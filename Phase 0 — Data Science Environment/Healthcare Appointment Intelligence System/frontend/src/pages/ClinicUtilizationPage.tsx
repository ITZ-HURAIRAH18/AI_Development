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

import { useOutletContext } from 'react-router-dom'

export function ClinicUtilizationPage() {
  const outlet = useOutletContext<{ clinicId?: string }>()
  const clinicId = outlet?.clinicId ?? ''
  const { data, loading, error, reload } = useApi(() => clinicApi.utilization({ clinic_id: clinicId }), [clinicId], `clinic-utilization-${clinicId}`)

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load clinic capacity utilization analytics'} onRetry={reload} />
  }

  const rows = data as UtilizationRow[]
  const avgUtilization = rows.length ? rows.reduce((sum, row) => sum + row.utilization_percentage, 0) / rows.length : 0

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Clinic Utilization & Capacity Intelligence"
        description={`Capacity benchmarks across ${rows.length} facilities. Enterprise average: ${formatPercent(avgUtilization)}`}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="ACTIVE CLINICS" value={String(rows.length)} />
        <MiniStat label="TOTAL PATIENTS SERVED" value={formatNumber(rows.reduce((sum, r) => sum + (r.patient_volume ?? 0), 0))} />
        <MiniStat label="AVG CAPACITY UTILIZATION" value={formatPercent(avgUtilization)} />
        <MiniStat label="AVERAGE SYSTEM WAIT" value={formatMinutes(rows.length ? rows.reduce((sum, r) => sum + (r.average_waiting_time ?? 0), 0) / rows.length : 0)} />
      </div>

      <ChartCard title="FACILITY CAPACITY UTILIZATION BENCHMARK" subtitle="Percentage utilization by clinic ID (doctor load ratio × 100)">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows.map((row) => ({ name: row.clinic_id, utilization: row.utilization_percentage }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: 0, border: '1px solid #E0E0E0', fontSize: 11, fontFamily: 'IBM Plex Sans, sans-serif', background: '#FFFFFF' }} />
            <Bar dataKey="utilization" name="Utilization" fill="#0F62FE" radius={0} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {rows.length === 0 ? (
        <EmptyState title="No utilization data available" description="Import appointment schedules to populate capacity utilization." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table
              columns={[
                { key: 'clinic_id', label: 'Clinic ID' },
                { key: 'doctors', label: 'Active Doctors', align: 'right' as const },
                { key: 'patients', label: 'Patient Volume', align: 'right' as const },
                { key: 'wait', label: 'Average Waiting Time', align: 'right' as const },
                { key: 'load', label: 'Doctor Workload Load', align: 'right' as const },
                { key: 'utilization', label: 'Capacity Utilization', align: 'right' as const },
              ]}
            >
              {rows.map((row) => (
                <tr key={row.clinic_id} className="cds-table-row">
                  <td className="px-3.5 py-2.5 font-mono font-semibold text-primary-500">{row.clinic_id}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{row.doctors_count ?? 0}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatNumber(row.patient_volume)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatMinutes(row.average_waiting_time)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{Number(row.average_doctor_load ?? 0).toFixed(2)}</td>
                  <td className="px-3.5 py-2.5 text-right">
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
    <Card className="p-4 border-t-2 border-t-primary-500">
      <p className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-tight font-mono text-carbon-gray-100">{value}</p>
    </Card>
  )
}