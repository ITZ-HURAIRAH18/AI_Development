import { useParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, LoadingState, EmptyState } from '@/components/ui/States'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { formatMinutes, formatPercent, formatNumber } from '@/utils/format'
import type { Doctor } from '@/types'

export function ClinicDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useApi(() => clinicApi.get(id ?? ''), [id])
  const utilization = useApi(() => clinicApi.utilization({}), [])

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Clinic not found'} onRetry={reload} />
  }

  const doctors = Array.isArray(data.doctors) ? (data.doctors as Doctor[]) : []
  const risk = data.risk_distribution ?? { LOW: 0, MEDIUM: 0, HIGH: 0 }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.name}
        description={`${data.clinic_id} · ${data.location}`}
        actions={
          <div className="flex items-center gap-2 text-sm text-charcoal-muted">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {formatPercent(data.utilization)} utilization
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <MiniStat label="Doctors" value={String(doctors.length)} />
        <MiniStat label="Appointments" value={formatNumber(data.appointments)} />
        <MiniStat label="Avg waiting" value={formatMinutes(data.average_waiting_time)} />
        <MiniStat label="No-show rate" value={formatPercent(data.no_show_rate)} />
        <MiniStat label="Doctor load" value={Number(data.average_doctor_load ?? 0).toFixed(2)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Risk Distribution" subtitle="Scheduling risk across appointments" />
          <CardContent>
            <div className="space-y-3">
              {(['HIGH', 'MEDIUM', 'LOW'] as const).map((level) => (
                <div key={level} className="flex items-center gap-3">
                  <Badge tone={level === 'HIGH' ? 'danger' : level === 'MEDIUM' ? 'warning' : 'success'}>{level}</Badge>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${(risk[level] ?? 0) > 0 ? 100 : 0}%` }} />
                  </div>
                  <span className="w-16 text-right text-sm text-charcoal-muted">{formatNumber(risk[level] ?? 0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Clinic Comparison" subtitle="Utilization across all clinics" />
          <CardContent className="overflow-x-auto">
            <Table
              columns={[
                { key: 'clinic_id', label: 'Clinic' },
                { key: 'patient_volume', label: 'Patients', align: 'right' as const },
                { key: 'average_waiting_time', label: 'Avg Wait', align: 'right' as const },
                { key: 'utilization_percentage', label: 'Utilization', align: 'right' as const },
              ]}
            >
              {(utilization.data ?? []).map((row) => (
                <tr key={row.clinic_id}>
                  <td className="px-4 py-2.5 font-medium text-charcoal">{row.clinic_id}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal">{formatNumber(row.patient_volume)}</td>
                  <td className="px-4 py-2.5 text-right text-charcoal">{formatMinutes(row.average_waiting_time)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-charcoal">{formatPercent(row.utilization_percentage)}</td>
                </tr>
              ))}
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Doctors" subtitle="Providers assigned to this clinic" />
        <CardContent>
          {doctors.length === 0 ? (
            <EmptyState title="No doctors" description="No providers have been assigned to this clinic." />
          ) : (
            <Table
              columns={[
                { key: 'doctor_id', label: 'Doctor' },
                { key: 'name', label: 'Name' },
                { key: 'specialization', label: 'Specialization' },
                { key: 'appointments', label: 'Appointments', align: 'right' as const },
                { key: 'average_waiting_time', label: 'Avg Waiting', align: 'right' as const },
                { key: 'no_show_rate', label: 'No-show Rate', align: 'right' as const },
              ]}
            >
              {doctors.map((doctor) => (
                <tr key={doctor.id ?? doctor.doctor_id}>
                  <td className="px-4 py-3 font-medium text-primary-700">{doctor.doctor_id}</td>
                  <td className="px-4 py-3 text-charcoal">{doctor.name}</td>
                  <td className="px-4 py-3 text-charcoal">{doctor.specialization}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{doctor.appointments ?? 0}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{formatMinutes(doctor.average_waiting_time)}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{formatPercent(doctor.no_show_rate)}</td>
                </tr>
              ))}
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-charcoal-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-charcoal">{value}</p>
    </Card>
  )
}