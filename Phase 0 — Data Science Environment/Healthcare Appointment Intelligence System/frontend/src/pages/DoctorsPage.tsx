import { useNavigate } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { doctorApi } from '@/services/doctorApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { useState } from 'react'
import { formatMinutes, formatPercent } from '@/utils/format'
import type { Doctor } from '@/types'

export function DoctorsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [clinicId, setClinicId] = useState('')
  const { data, loading, error, reload } = useApi(() => doctorApi.list({ search, clinic_id: clinicId }), [search, clinicId])
  const clinics = useApi(() => clinicApi.list(), [])

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Doctors" description="Provider workload and performance." />
        <LoadingState rows={10} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Doctors" description="Provider workload and performance." />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: 'Clinic',
            value: clinicId,
            onChange: setClinicId,
            options: [
              { value: '', label: 'All clinics' },
              ...(clinics.data ?? []).map((c) => ({ value: c.clinic_id, label: c.name })),
            ],
          },
        ]}
        clearable
        onClear={() => {
          setSearch('')
          setClinicId('')
        }}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No doctors found" description="No providers match the current filters." />
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-card">
          <Table
            columns={[
              { key: 'doctor_id', label: 'Doctor' },
              { key: 'specialization', label: 'Specialization' },
              { key: 'clinic_id', label: 'Clinic' },
              { key: 'appointments', label: 'Appointments', align: 'right' as const },
              { key: 'average_waiting_time', label: 'Avg Waiting', align: 'right' as const },
              { key: 'doctor_load', label: 'Load', align: 'right' as const },
              { key: 'no_show_rate', label: 'No-show Rate', align: 'right' as const },
              { key: 'utilization', label: 'Utilization', align: 'right' as const },
            ]}
          >
            {data.map((doctor: Doctor) => (
              <tr key={doctor.id ?? doctor.doctor_id} className="cursor-pointer transition-colors hover:bg-gray-50" onClick={() => navigate(`/doctors/${doctor.id ?? doctor.doctor_id}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <Stethoscope className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{doctor.name}</p>
                      <p className="text-xs text-charcoal-muted">{doctor.doctor_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal">{doctor.specialization}</td>
                <td className="px-4 py-3"><Badge tone="neutral">{doctor.clinic_id}</Badge></td>
                <td className="px-4 py-3 text-right text-charcoal">{doctor.appointments ?? 0}</td>
                <td className="px-4 py-3 text-right text-charcoal">{formatMinutes(doctor.average_waiting_time)}</td>
                <td className="px-4 py-3 text-right text-charcoal">{Number(doctor.doctor_load ?? 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-charcoal">{formatPercent(doctor.no_show_rate)}</td>
                <td className="px-4 py-3 text-right font-medium text-charcoal">{formatPercent(doctor.utilization)}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  )
}