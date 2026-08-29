import { useParams } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, EmptyState } from '@/components/ui/States'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
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
    return <ProfileSkeleton />
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Clinic record could not be found'} title="Unable to load clinic record" onRetry={reload} />
  }

  const doctors = Array.isArray(data.doctors) ? (data.doctors as Doctor[]) : []
  const risk = data.risk_distribution ?? { LOW: 0, MEDIUM: 0, HIGH: 0 }
  const riskTotal = risk.LOW + risk.MEDIUM + risk.HIGH

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Clinic Specification: ${data.name}`}
        breadcrumb="Operations / Clinics"
        description={`Identifier: ${data.clinic_id} · Facility Location: ${data.location}`}
        actions={
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary-500">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {formatPercent(data.utilization)} Utilization
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <MiniStat label="Active Doctors" value={String(doctors.length)} />
        <MiniStat label="Total Appointments" value={formatNumber(data.appointments)} />
        <MiniStat label="Avg Waiting Time" value={formatMinutes(data.average_waiting_time)} />
        <MiniStat label="Historical No-show Rate" value={formatPercent(data.no_show_rate)} />
        <MiniStat label="Average Doctor Load" value={Number(data.average_doctor_load ?? 0).toFixed(2)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Scheduling Risk Classification Distribution" subtitle="Diagnostic counts across appointment volume" />
          <CardContent className="p-4">
            <div className="space-y-3">
              {([['HIGH', 'danger'], ['MEDIUM', 'warning'], ['LOW', 'success']] as const).map(([level, tone]) => (
                <div key={level} className="flex items-center gap-3">
                  <Badge tone={tone}>{level}</Badge>
                  <div className="h-2 flex-1 overflow-hidden bg-carbon-gray-20 rounded-none">
                    <div
                      className={`h-full ${tone === 'danger' ? 'bg-danger' : tone === 'warning' ? 'bg-warning-strong' : 'bg-success'}`}
                      style={{ width: riskTotal > 0 ? `${((risk[level] ?? 0) / riskTotal) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-16 text-right font-mono text-xs font-semibold text-carbon-gray-100">{formatNumber(risk[level] ?? 0)}</span>
                </div>
              ))}
              {riskTotal === 0 && (
                <p className="text-xs text-carbon-gray-60">No risk classifications have been recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Enterprise Clinic Comparison" subtitle="Capacity utilization benchmarking across facilities" />
          <CardContent className="p-0">
            <Table
              columns={[
                { key: 'clinic_id', label: 'Clinic ID' },
                { key: 'patient_volume', label: 'Patients', align: 'right' as const },
                { key: 'average_waiting_time', label: 'Avg Wait', align: 'right' as const },
                { key: 'utilization_percentage', label: 'Utilization', align: 'right' as const },
              ]}
            >
              {(utilization.data ?? []).map((row) => (
                <tr key={row.clinic_id} className="cds-table-row">
                  <td className="px-3.5 py-2.5 font-mono font-semibold text-carbon-gray-100">{row.clinic_id}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatNumber(row.patient_volume)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatMinutes(row.average_waiting_time)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-primary-500">{formatPercent(row.utilization_percentage)}</td>
                </tr>
              ))}
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Assigned Providers Directory" subtitle="Medical practitioners assigned to facility" />
        <CardContent className="p-0">
          {doctors.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No assigned doctors" description="No medical practitioners have been linked to this clinic ID." />
            </div>
          ) : (
            <Table
              columns={[
                { key: 'doctor_id', label: 'Doctor ID' },
                { key: 'name', label: 'Full Name' },
                { key: 'specialization', label: 'Specialization' },
                { key: 'appointments', label: 'Appointments', align: 'right' as const },
                { key: 'average_waiting_time', label: 'Avg Waiting', align: 'right' as const },
                { key: 'no_show_rate', label: 'No-show Rate', align: 'right' as const },
              ]}
            >
              {doctors.map((doctor) => (
                <tr key={doctor.id ?? doctor.doctor_id} className="cds-table-row">
                  <td className="px-3.5 py-2.5 font-mono font-semibold text-primary-500">{doctor.doctor_id}</td>
                  <td className="px-3.5 py-2.5 font-semibold text-carbon-gray-100">{doctor.name}</td>
                  <td className="px-3.5 py-2.5 text-carbon-gray-70">{doctor.specialization}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{doctor.appointments ?? 0}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatMinutes(doctor.average_waiting_time)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatPercent(doctor.no_show_rate)}</td>
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
    <Card className="p-4 border-t-2 border-t-primary-500">
      <p className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight font-mono text-carbon-gray-100">{value}</p>
    </Card>
  )
}