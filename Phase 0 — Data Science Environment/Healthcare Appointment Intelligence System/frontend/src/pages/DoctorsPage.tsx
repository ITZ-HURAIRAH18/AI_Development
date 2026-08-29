import { useNavigate, useOutletContext } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Plus, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { doctorApi } from '@/services/doctorApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { ChartCard } from '@/components/ui/ChartCard'
import { StatCard } from '@/components/ui/StatCard'
import { DoctorModal } from '@/components/modals/DoctorModal'
import { formatMinutes, formatPercent } from '@/utils/format'
import type { Doctor } from '@/types'

function tooltipStyles() {
  return {
    contentStyle: {
      borderRadius: 0,
      border: '1px solid #E0E0E0',
      fontSize: 11,
      fontFamily: 'IBM Plex Sans, sans-serif',
      background: '#FFFFFF',
    },
  }
}

export function DoctorsPage() {
  const navigate = useNavigate()
  const outlet = useOutletContext<{ clinicId?: string }>()
  const globalClinicId = outlet?.clinicId ?? ''
  const [search, setSearch] = useState('')
  const [localClinicId, setLocalClinicId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const activeClinicId = localClinicId || globalClinicId
  const { data, loading, error, reload } = useApi(() => doctorApi.list({ search, clinic_id: activeClinicId }), [search, activeClinicId])
  const workload = useApi(() => doctorApi.workload({ clinic_id: activeClinicId }), [activeClinicId], `doctor-workload-${activeClinicId}`)
  const clinics = useApi(() => clinicApi.list(), [])

  const headerActions = (
    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
      <Plus className="h-4 w-4 mr-1 shrink-0" />
      Add Doctor
    </Button>
  )

  if (loading) {
    return (
      <div className="space-y-4 font-sans">
        <PageHeader title="Doctor Workload" breadcrumb="Operations / Doctor Workload" description="Provider workload ratios, average waiting times, and capacity utilization." actions={headerActions} />
        <PageSkeleton cards={4} charts={1} tableRows={6} />
      </div>
    )
  }

  const workloadRows = (workload.data ?? []) as Array<{
    doctor_id: string
    appointments?: number
    doctor_load?: number
    average_waiting_time?: number
    no_show_rate?: number
    utilization?: number
  }>
  const avgLoad = workloadRows.length
    ? workloadRows.reduce((sum, r) => sum + (r.doctor_load ?? 0), 0) / workloadRows.length
    : 0
  const maxLoad = workloadRows.length ? Math.max(...workloadRows.map((r) => r.doctor_load ?? 0)) : 0
  const activeAppointments = workloadRows.reduce((sum, r) => sum + (r.appointments ?? 0), 0)

  return (
    <div className="space-y-4 font-sans">
      <PageHeader title="Doctor Workload" breadcrumb="Operations / Doctor Workload" description="Provider workload ratios, average waiting times, and capacity utilization." actions={headerActions} />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: 'Clinic',
            value: activeClinicId,
            onChange: setLocalClinicId,
            options: [
              { value: '', label: 'All Clinics' },
              ...(clinics.data ?? []).map((c) => ({ value: c.clinic_id, label: `${c.clinic_id} — ${c.name}` })),
            ],
          },
        ]}
        clearable
        onClear={() => {
          setSearch('')
          setLocalClinicId('')
        }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Average Load" value={avgLoad.toFixed(2)} subtitle="Average active load" icon={Stethoscope} tone="info" />
        <StatCard title="Highest Load" value={maxLoad.toFixed(2)} subtitle="Peak provider load" icon={Stethoscope} tone={maxLoad >= 0.8 ? 'danger' : maxLoad >= 0.6 ? 'warning' : 'success'} />
        <StatCard title="Active Appointments" value={activeAppointments.toLocaleString('en-US')} subtitle="Appointments across providers" icon={Stethoscope} tone="neutral" />
        <StatCard title="Doctors" value={String(workloadRows.length || (data?.length ?? 0))} subtitle="Providers tracked" icon={Stethoscope} tone="neutral" />
      </div>

      <ChartCard title="Doctor Workload" subtitle="Active appointments per provider" xLabel="Doctor" yLabel="Active Appointments">
        {!workload.loading && workload.error ? (
          <EmptyState title="Workload chart unavailable" description="The workload distribution could not be loaded." />
        ) : workloadRows.length === 0 ? (
          <EmptyState title="No workload data" description="Doctor workload metrics will appear once appointments are recorded." />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={workloadRows.slice(0, 15).map((row) => ({ name: row.doctor_id, appointments: row.appointments ?? 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="appointments" name="Appointments" fill="#525252" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No provider records found" description="No doctor records match the active criteria." />
      ) : (
        <div className="border border-carbon-gray-20 bg-surface shadow-card">
          <Table
            columns={[
              { key: 'doctor_id', label: 'Doctor' },
              { key: 'specialization', label: 'Specialization' },
              { key: 'clinic_id', label: 'Clinic' },
              { key: 'appointments', label: 'Appointments', align: 'right' as const },
              { key: 'average_waiting_time', label: 'Avg Waiting', align: 'right' as const },
              { key: 'doctor_load', label: 'Workload', align: 'right' as const },
              { key: 'no_show_rate', label: 'No-show Rate', align: 'right' as const },
              { key: 'utilization', label: 'Utilization', align: 'right' as const },
            ]}
          >
            {data.map((doctor: Doctor) => (
              <tr key={doctor.id ?? doctor.doctor_id} className="cds-table-row cursor-pointer" onClick={() => navigate(`/doctors/${doctor.id ?? doctor.doctor_id}`)}>
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center bg-carbon-gray-10 text-primary-500">
                      <Stethoscope className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-semibold text-carbon-gray-100">{doctor.name}</p>
                      <p className="text-[11px] font-mono text-carbon-gray-60">{doctor.doctor_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3.5 py-2.5 text-carbon-gray-70">{doctor.specialization}</td>
                <td className="px-3.5 py-2.5"><Badge tone="neutral">{doctor.clinic_id}</Badge></td>
                <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{doctor.appointments ?? 0}</td>
                <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatMinutes(doctor.average_waiting_time)}</td>
                <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{Number(doctor.doctor_load ?? 0).toFixed(2)}</td>
                <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatPercent(doctor.no_show_rate)}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-bold text-primary-500">{formatPercent(doctor.utilization)}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <DoctorModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { reload(); workload.reload() }}
        clinics={clinics.data ?? []}
      />
    </div>
  )
}