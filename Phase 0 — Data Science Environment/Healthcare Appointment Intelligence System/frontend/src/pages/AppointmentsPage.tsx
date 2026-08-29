import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { ChevronDown, ExternalLink, Plus, RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Table } from '@/components/ui/Table'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { AppointmentModal } from '@/components/modals/AppointmentModal'
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
  const outlet = useOutletContext<{ clinicId?: string }>()
  const globalClinicId = outlet?.clinicId ?? ''
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState<Appointment[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebounce(search, 300)

  const page = Number(searchParams.get('page') ?? '1')
  const clinicId = searchParams.get('clinic') || globalClinicId
  const doctorId = searchParams.get('doctor') ?? ''
  const rawRisk = searchParams.get('risk') ?? ''
  const risk = RISK_LEVELS.includes(rawRisk as (typeof RISK_LEVELS)[number]) ? rawRisk : ''
  const status = searchParams.get('status') ?? ''
  const startDate = searchParams.get('start_date') ?? ''
  const endDate = searchParams.get('end_date') ?? ''
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

  const loadAppointments = useCallback(() => {
    setLoading(true)
    setError('')
    appointmentApi
      .list({
        search: debouncedSearch,
        clinic_id: clinicId,
        doctor_id: doctorId,
        risk,
        status,
        start_date: startDate,
        end_date: endDate,
        page,
        limit: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
      .then((result) => {
        setItems(result.items)
        setTotal(result.total)
      })
      .catch((err: unknown) => {
        setError((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Unable to load appointments.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [debouncedSearch, clinicId, doctorId, risk, status, startDate, endDate, page, sortBy, sortOrder])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

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

  const handleStatusChange = async (newStatus: string) => {
    if (!selected) return
    setStatusUpdating(true)
    try {
      const updated = await appointmentApi.updateStatus(selected.id, newStatus)
      setSelected(updated)
      loadAppointments()
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to update status')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handlePredictManual = async () => {
    if (!selected) return
    setStatusUpdating(true)
    try {
      await appointmentApi.predict(selected.id)
      const detail = await appointmentApi.get(selected.id)
      setSelected(detail)
      loadAppointments()
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to compute prediction')
    } finally {
      setStatusUpdating(false)
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

  const headerActions = (
    <Button variant="primary" size="sm" onClick={() => setIsBookModalOpen(true)}>
      <Plus className="h-4 w-4 mr-1 shrink-0" />
      Book Appointment
    </Button>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Appointments Schedule" description="Manage and review all clinic appointments." breadcrumb="Patient Intelligence / Appointments" actions={headerActions} />
        <TableSkeleton rows={10} columns={8} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Appointments Schedule" description="Manage and review all clinic appointments." breadcrumb="Patient Intelligence / Appointments" actions={headerActions} />

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
      >
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Input
              label="From Date"
              type="date"
              value={startDate}
              onChange={(event) => updateParam('start_date', event.target.value)}
              max={endDate || undefined}
            />
          </div>
          <div className="w-40">
            <Input
              label="To Date"
              type="date"
              value={endDate}
              onChange={(event) => updateParam('end_date', event.target.value)}
              min={startDate || undefined}
            />
          </div>
        </div>
      </FilterBar>

      {error ? (
        <ErrorState message={error} onRetry={loadAppointments} />
      ) : items.length === 0 ? (
        <EmptyState title="No appointments found" description="There are no appointments matching the selected filters." action={<Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>} />
      ) : (
        <div className="border border-carbon-gray-20 bg-surface shadow-card">
          <Table columns={columns} onSort={(key) => updateParam('sort_by', key)} sortBy={sortBy} sortOrder={sortOrder}>
            {items.map((item) => (
              <tr key={item.id} className="cds-table-row cursor-pointer" onClick={() => openDetail(item)}>
                <td className="px-3.5 py-2.5 font-mono font-semibold text-primary-500">{item.appointment_id}</td>
                <td className="px-3.5 py-2.5 text-carbon-gray-100 font-medium">{item.patient_id}</td>
                <td className="px-3.5 py-2.5 text-carbon-gray-100">{item.doctor_id}</td>
                <td className="px-3.5 py-2.5"><Badge tone="neutral">{item.clinic_id}</Badge></td>
                <td className="px-3.5 py-2.5 text-carbon-gray-70 font-mono">{formatDate(item.appointment_day)}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{formatProbability(item.no_show_probability)}</td>
                <td className="px-3.5 py-2.5">
                  <RiskBadge risk={item.scheduling_risk} />
                </td>
                <td className="px-3.5 py-2.5">
                  <Badge tone={STATUS_TONES[item.status] ?? 'neutral'}>{item.status}</Badge>
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} total={total} limit={20} onPageChange={(nextPage) => updateParam('page', String(nextPage))} />
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected ? `APPOINTMENT SPECIFICATION: ${selected.appointment_id}` : 'APPOINTMENT SPECIFICATION'}>
        {drawerLoading || !selected ? (
          <LoadingState rows={6} />
        ) : (
          <div className="space-y-5 font-sans">
            <section className="border border-carbon-gray-20 bg-carbon-gray-10 p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-carbon-gray-100">Appointment Overview</h3>
                <Badge tone={STATUS_TONES[selected.status] ?? 'neutral'}>{selected.status}</Badge>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <Detail label="Scheduled Day" value={formatDate(selected.scheduled_day)} />
                <Detail label="Appointment Day" value={formatDate(selected.appointment_day)} />
                <Detail label="SMS Notification" value={selected.sms_received ? 'Received' : 'Not Sent'} />
                <Detail label="Doctor ID" value={selected.doctor_id} />
              </dl>

              {/* Status Update Quick Actions */}
              <div className="mt-4 border-t border-carbon-gray-20 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60 mb-2">Update Appointment Status:</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Scheduled', 'Completed', 'No-show', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      disabled={statusUpdating || selected.status === st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all border ${
                        selected.status === st
                          ? 'border-primary-500 bg-primary-500 text-white cursor-default'
                          : 'border-carbon-gray-30 bg-surface text-carbon-gray-80 hover:bg-carbon-gray-10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-carbon-gray-20 bg-surface p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-carbon-gray-100">Model Prediction Metrics</h3>
                <Button variant="outline" size="sm" onClick={handlePredictManual} disabled={statusUpdating}>
                  <RefreshCw className={`h-3 w-3 mr-1 ${statusUpdating ? 'animate-spin' : ''}`} />
                  Recalculate AI Risk
                </Button>
              </div>
              {selected.prediction ? (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                  <Detail label="No-show Probability" value={formatProbability(selected.prediction.no_show_probability)} />
                  <Detail label="No-show Risk" value={<RiskBadge risk={selected.prediction.no_show_risk} />} />
                  <Detail label="Expected Wait Time" value={formatMinutes(selected.prediction.expected_waiting_time)} />
                  <Detail label="Risk Score Diagnostic" value={String(selected.prediction.risk_score)} />
                  <Detail label="Scheduling Risk Flag" value={<RiskBadge risk={selected.prediction.scheduling_risk} />} />
                </dl>
              ) : (
                <p className="text-xs text-carbon-gray-60">No automated prediction recorded for this appointment.</p>
              )}
            </section>

            <section className="border border-carbon-gray-20 bg-surface p-4">
              <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-carbon-gray-100">Operational Diagnostics</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <Detail label="Queue Length" value={String(selected.queue_length)} />
                <Detail label="Patients Ahead" value={String(selected.patients_ahead)} />
                <Detail label="Doctor Workload Load" value={selected.doctor_load.toFixed(2)} />
                <Detail label="Consultation Duration" value={`${selected.consultation_duration} min`} />
                <Detail label="Room Availability" value={selected.room_available ? 'Available' : 'Unavailable'} />
                <Detail label="Recorded Waiting Time" value={formatMinutes(selected.waiting_time)} />
              </dl>
            </section>

            {selected.risk_factors && selected.risk_factors.length > 0 && (
              <section className="border border-amber-200 bg-amber-50 p-4">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-900">Contributing Risk Factors</h3>
                <ul className="space-y-1">
                  {selected.risk_factors.map((factor) => (
                    <li key={factor} className="flex items-center gap-2 text-xs font-medium text-amber-800">
                      <ChevronDown className="h-3 w-3 -rotate-90 text-amber-600 shrink-0" aria-hidden="true" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="flex items-center gap-2 pt-2 border-t border-carbon-gray-20">
              <a
                href={`/patients/${selected.patient_id}`}
                className="inline-flex h-8 items-center gap-1.5 border border-carbon-gray-30 bg-surface px-3 text-xs font-semibold uppercase tracking-wider text-carbon-gray-100 hover:bg-carbon-gray-10 transition-all"
                onClick={() => setSelected(null)}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                View Patient Record
              </a>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close Panel
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      <AppointmentModal
        open={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={loadAppointments}
        clinics={clinics}
        doctors={doctors}
      />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">{label}</dt>
      <dd className="mt-0.5 font-mono text-xs font-semibold text-carbon-gray-100">{value}</dd>
    </div>
  )
}