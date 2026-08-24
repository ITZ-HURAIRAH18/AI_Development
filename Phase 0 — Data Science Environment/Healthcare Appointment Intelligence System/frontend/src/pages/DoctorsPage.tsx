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
        <PageHeader title="Doctor Performance Analytics" description="Provider workload ratios, average waiting times, and capacity utilization." />
        <LoadingState rows={10} />
      </div>
    )
  }

  return (
    <div className="font-sans space-y-4">
      <PageHeader title="Doctor Performance Analytics" description="Provider workload ratios, average waiting times, and capacity utilization." />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        filters={[
          {
            label: 'Clinic Filter',
            value: clinicId,
            onChange: setClinicId,
            options: [
              { value: '', label: 'All Clinics Overview' },
              ...(clinics.data ?? []).map((c) => ({ value: c.clinic_id, label: `${c.clinic_id} — ${c.name}` })),
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
        <EmptyState title="No provider records found" description="No doctor records match the active criteria." />
      ) : (
        <div className="border border-carbon-gray-20 bg-surface shadow-card">
          <Table
            columns={[
              { key: 'doctor_id', label: 'Doctor Specification' },
              { key: 'specialization', label: 'Medical Specialization' },
              { key: 'clinic_id', label: 'Assigned Clinic' },
              { key: 'appointments', label: 'Total Appointments', align: 'right' as const },
              { key: 'average_waiting_time', label: 'Avg Waiting', align: 'right' as const },
              { key: 'doctor_load', label: 'Workload Ratio', align: 'right' as const },
              { key: 'no_show_rate', label: 'No-show Rate', align: 'right' as const },
              { key: 'utilization', label: 'Capacity Utilization', align: 'right' as const },
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
    </div>
  )
}