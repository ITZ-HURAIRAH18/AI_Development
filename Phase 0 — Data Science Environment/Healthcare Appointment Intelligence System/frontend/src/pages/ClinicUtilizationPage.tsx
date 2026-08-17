import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '@/hooks/useApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { ChartCard } from '@/components/ui/ChartCard'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { formatMinutes, formatNumber, formatPercent } from '@/utils/format'
import type { UtilizationRow } from '@/types'

function utilizationTone(value: number) {
  if (value >= 80) return 'danger'
  if (value >= 50) return 'warning'
  return 'success'
}

export function ClinicUtilizationPage() {
  const { data, loading, error, reload } = useApi(() => clinicApi.utilization({}), [])

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load clinic utilization'} onRetry={reload} />
  }

  const rows = data as UtilizationRow[]
  const avgUtilization = rows.length ? rows.reduce((sum, row) => sum + row.utilization_percentage, 0) / rows.length : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinic Utilization"
        description={`Average utilization across ${rows.length} clinics: ${formatPercent(avgUtilization)}`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="Clinics" value={String(rows.length)} />
        <MiniStat label="Total patients" value={formatNumber(rows.reduce((sum, r) => sum + (r.patient_volume ?? 0), 0))} />
        <MiniStat label="Avg utilization" value={formatPercent(avgUtilization)} />
        <MiniStat label="Avg waiting" value={formatMinutes(rows.length ? rows.reduce((sum, r) => sum + (r.average_waiting_time ?? 0), 0) / rows.length : 0)} />
      </div>

      <ChartCard title="Utilization Comparison" subtitle="Utilization percentage by clinic (average doctor load × 100)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows.map((row) => ({ name: row.clinic_id, utilization: row.utilization_percentage }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} unit="%" domain={[0, 100]} />
            <Tooltip {...{ contentStyle: { borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: '#FFFFFF' } }} />
            <Bar dataKey="utilization" name="Utilization" fill="#1F6E66" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {rows.length === 0 ? (
        <EmptyState title="No utilization data" description="Import appointments to calculate clinic utilization." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table
              columns={[
                { key: 'clinic_id', label: 'Clinic' },
                { key: 'doctors', label: 'Doctors', align: 'right' as const },
                { key: 'patients', label: 'Patients', align: 'right' as const },
                { key: 'wait', label: 'Average Wait', align: 'right' as const },
                { key: 'load', label: 'Doctor Load', align: 'right' as const },
                { key: 'utilization', label: 'Utilization', align: 'right' as const },
              ]}
            >
              {rows.map((row) => (
                <tr key={row.clinic_id}>
                  <td className="px-4 py-3 font-medium text-primary-700">{row.clinic_id}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{row.doctors_count ?? 0}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{formatNumber(row.patient_volume)}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{formatMinutes(row.average_waiting_time)}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{Number(row.average_doctor_load ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge tone={utilizationTone(row.utilization_percentage ?? 0) as 'danger' | 'warning' | 'success'}>
                      {formatPercent(row.utilization_percentage)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </Table>
          </CardContent>
        </Card>
      )}
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