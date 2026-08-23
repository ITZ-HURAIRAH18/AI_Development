import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { useDebounce } from '@/hooks/useDebounce'
import { appointmentApi } from '@/services/appointmentApi'
import { clinicApi } from '@/services/clinicApi'
import { doctorApi } from '@/services/doctorApi'
import { formatDate, formatMinutes, formatProbability } from '@/utils/format'
import type { Appointment, Clinic, Doctor } from '@/types'

const STATUS_TONES: Record<string, 'neutral' | 'success' | 'warning' | 'danger' | 'primary'> = {
  Scheduled: 'primary',
  Completed: 'success',
  'No-show': 'danger',
  Cancelled: 'neutral',
}

const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const

export function AppointmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<Appointment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)

  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebounce(search, 300)

  const page = Number(searchParams.get('page') ?? '1')
  const clinicId = searchParams.get('clinic') ?? ''
  const doctorId = searchParams.get('doctor') ?? ''
  const rawRisk = searchParams.get('risk') ?? ''
  const risk = RISK_LEVELS.includes(rawRisk as (typeof RISK_LEVELS)[number]) ? rawRisk : ''
  const status = searchParams.get('status') ?? ''
  const sortBy = searchParams.get('sort_by') ?? 'appointment_day'
  const sortOrder = searchParams.get('sort_order') ?? 'desc'

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    clinicApi.list().then(setClinics).catch(() => setClinics([]))
    doctorApi.list().then(setDoctors).catch(() => setDoctors([]))
  }, [])

  useEffect(() => {
    if (!rawRisk) return
    if (risk) return
    const next = new URLSearchParams(searchParams)
    next.delete('risk')
    setSearchParams(next, { replace: true })
  }, [rawRisk, risk, searchParams, setSearchParams])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    appointmentApi
      .list({
        search: debouncedSearch,
        clinic_id: clinicId,
        doctor_id: doctorId,
        risk,
        status,
        page,
        limit: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      .then((result) => {
        if (!active) return
        setItems(result.items)
        setTotal(result.total)
      })
      .catch((err: unknown) => {
        if (active) setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Unable to load appointments.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [debouncedSearch, clinicId, doctorId, risk, status, page, sortBy, sortOrder])

  const openDetail = async (appointment: Appointment) => {
    setDrawerLoading(true)
    setSelected(appointment)
    try {
      const detail = await appointmentApi.get(appointment.id)
      setSelected(detail)
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Unable to load appointment detail.')
    } finally {
      setDrawerLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const columns = useMemo(
    () => [
      { key: 'appointment_id', label: 'Appointment ID' },
      { key: 'patient_id', label: 'Patient' },
      { key: 'doctor_id', label: 'Doctor' },
      { key: 'clinic_id', label: 'Clinic' },
      { key: 'appointment_day', label: 'Appointment Date' },
      { key: 'no_show_probability', label: 'No-show Probability', align: 'right' as const },
      { key: 'scheduling_risk', label: 'Scheduling Risk' },
      { key: 'status', label: 'Status' },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Appointments" description="Manage and review all clinic appointments." />
        <LoadingState rows={10} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Appointments" description="Manage and review all clinic appointments." />

      <FilterBar
        search={search}
        onSearchChange={(value) => updateParam('search', value)}
        filters={[
          {
            label: 'Clinic',
            value: clinicId,
            onChange: (value) => updateParam('clinic', value),
            options: [{ value: '', label: 'All clinics' }, ...clinics.map((c) => ({ value: c.clinic_id, label: c.name }))],
          },
          {
            label: 'Doctor',
            value: doctorId,
            onChange: (value) => updateParam('doctor', value),
            options: [{ value: '', label: 'All doctors' }, ...doctors.map((d) => ({ value: d.doctor_id, label: d.name }))],
          },
          {
            label: 'Risk',
            value: risk,
            onChange: (value) => updateParam('risk', value),
            options: [
              { value: '', label: 'All risks' },
              { value: 'LOW', label: 'Low risk' },
              { value: 'MEDIUM', label: 'Medium risk' },
              { value: 'HIGH', label: 'High risk' },
            ],
          },
          {
            label: 'Status',
            value: status,
            onChange: (value) => updateParam('status', value),
            options: [
              { value: '', label: 'All statuses' },
              { value: 'Scheduled', label: 'Scheduled' },
              { value: 'Completed', label: 'Completed' },
              { value: 'No-show', label: 'No-show' },
              { value: 'Cancelled', label: 'Cancelled' },
            ],
          },
        ]}
        clearable
        onClear={clearFilters}
      />

      {error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No appointments found" description="Try adjusting your search or filters." />
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-card">
          <Table columns={columns} onSort={(key) => updateParam('sort_by', key)} sortBy={sortBy} sortOrder={sortOrder}>
            {items.map((item) => (
              <tr key={item.id} className="cursor-pointer transition-colors hover:bg-gray-50" onClick={() => openDetail(item)}>
                <td className="px-4 py-3 font-medium text-primary-700">{item.appointment_id}</td>
                <td className="px-4 py-3 text-charcoal">{item.patient_id}</td>
                <td className="px-4 py-3 text-charcoal">{item.doctor_id}</td>
                <td className="px-4 py-3"><Badge tone="neutral">{item.clinic_id}</Badge></td>
                <td className="px-4 py-3 text-charcoal">{formatDate(item.appointment_day)}</td>
                <td className="px-4 py-3 text-right text-charcoal">{formatProbability(item.no_show_probability)}</td>
                <td className="px-4 py-3">
                  <RiskBadge risk={item.scheduling_risk} />
                </td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[item.status] ?? 'neutral'}>{item.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} total={total} limit={20} onPageChange={(nextPage) => updateParam('page', String(nextPage))} />
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `Appointment ${selected.appointment_id}` : 'Appointment'}>
        {drawerLoading || !selected ? (
          <LoadingState rows={6} />
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-charcoal">Appointment</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Detail label="Status" value={<Badge tone={STATUS_TONES[selected.status] ?? 'neutral'}>{selected.status}</Badge>} />
                <Detail label="Scheduled" value={formatDate(selected.scheduled_day)} />
                <Detail label="Appointment date" value={formatDate(selected.appointment_day)} />
                <Detail label="SMS received" value={selected.sms_received ? 'Yes' : 'No'} />
              </dl>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-charcoal">Prediction</h3>
              {selected.prediction ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Detail label="No-show probability" value={formatProbability(selected.prediction.no_show_probability)} />
                  <Detail label="No-show risk" value={<RiskBadge risk={selected.prediction.no_show_risk} />} />
                  <Detail label="Expected waiting time" value={formatMinutes(selected.prediction.expected_waiting_time)} />
                  <Detail label="Risk score" value={String(selected.prediction.risk_score)} />
                  <Detail label="Scheduling risk" value={<RiskBadge risk={selected.prediction.scheduling_risk} />} />
                </dl>
              ) : (
                <p className="text-sm text-charcoal-muted">No prediction recorded for this appointment.</p>
              )}
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-charcoal">Operational</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Detail label="Queue length" value={String(selected.queue_length)} />
                <Detail label="Patients ahead" value={String(selected.patients_ahead)} />
                <Detail label="Doctor load" value={selected.doctor_load.toFixed(2)} />
                <Detail label="Consultation duration" value={`${selected.consultation_duration} min`} />
                <Detail label="Room available" value={selected.room_available ? 'Yes' : 'No'} />
                <Detail label="Waiting time" value={formatMinutes(selected.waiting_time)} />
              </dl>
            </section>

            {selected.risk_factors && selected.risk_factors.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-charcoal">Risk factors</h3>
                <ul className="space-y-1.5">
                  {selected.risk_factors.map((factor) => (
                    <li key={factor} className="flex items-center gap-2 text-sm text-charcoal-muted">
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-warning" aria-hidden="true" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex items-center gap-2">
              <a
                href={`/patients/${selected.patient_id}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm text-charcoal hover:bg-gray-50"
                onClick={() => setSelected(null)}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View patient
              </a>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function RiskBadge({ risk }: { risk?: string }) {
  if (!risk) return <span className="text-xs text-charcoal-muted">—</span>
  const tone = risk === 'HIGH' ? 'danger' : risk === 'MEDIUM' ? 'warning' : 'success'
  return <Badge tone={tone as 'danger' | 'warning' | 'success'}>{risk}</Badge>
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-charcoal-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-charcoal">{value}</dd>
    </div>
  )
}