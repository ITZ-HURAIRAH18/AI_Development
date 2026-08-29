import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useOutletContext } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { ChartCard } from '@/components/ui/ChartCard'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { StatCard } from '@/components/ui/StatCard'
import { AlertTriangle, Building2, Gauge, Timer } from 'lucide-react'
import { formatMinutes, formatNumber, formatPercent } from '@/utils/format'
import type { UtilizationRow } from '@/types'

function utilizationTone(value: number) {
  if (value >= 80) return 'danger'
  if (value >= 50) return 'warning'
  return 'success'
}

export function ClinicUtilizationPage() {
  const outlet = useOutletContext<{ clinicId?: string }>()
  const clinicId = outlet?.clinicId ?? ''
  const { data, loading, error, reload } = useApi(() => clinicApi.utilization({ clinic_id: clinicId }), [clinicId], `clinic-utilization-${clinicId}`)

  if (loading) {
    return <PageSkeleton cards={4} charts={1} tableRows={6} />
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load clinic capacity utilization analytics'} title="Unable to load clinic utilization data" onRetry={reload} />
  }

  const rows = data as UtilizationRow[]
  const avgUtilization = rows.length ? rows.reduce((sum, row) => sum + row.utilization_percentage, 0) / rows.length : 0
  const totalPatients = rows.reduce((sum, r) => sum + (r.patient_volume ?? 0), 0)
  const atCapacity = rows.filter((r) => r.utilization_percentage >= 100).length

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
title="Clinic Utilization"
        breadcrumb="Operations / Clinic Utilization"
        description={`Capacity benchmarks across ${rows.length} facilities. Enterprise average utilization is ${formatPercent(avgUtilization)}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Average Utilization" value={formatPercent(avgUtilization)} subtitle="Capacity average" icon={Gauge} tone="info" />
        <StatCard
          title="Highest Utilization"
          value={formatPercent(Math.max(0, ...rows.map((r) => r.utilization_percentage)))}
          subtitle="Clinic at peak capacity"
          icon={Building2}
          tone={avgUtilization >= 80 ? 'danger' : avgUtilization >= 50 ? 'warning' : 'success'}
        />
        <StatCard
          title="Lowest Utilization"
          value={formatPercent(Math.min(...rows.map((r) => r.utilization_percentage)))}
          subtitle="Clinic at lowest capacity"
          icon={Building2}
          tone="neutral"
        />
        <StatCard title="Total Clinics" value={formatNumber(rows.length)} subtitle={`${formatNumber(totalPatients)} patients served`} icon={Timer} tone="neutral" />
      </div>

      {atCapacity > 0 && (
        <div className="flex items-start gap-3 border border-amber-200 border-l-4 border-l-warning bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-strong" aria-hidden="true" />
          <p>
            <span className="font-semibold">Capacity review flag:</span> {atCapacity} clinic(s) reported utilization at or above 100%.
            Utilization is derived from average doctor load and is capped at 100%. Values at this bound may indicate over-capacity and
            should be reviewed operationally.
          </p>
        </div>
      )}

      <ChartCard title="Clinic Utilization" subtitle="Percentage capacity utilization by clinic" xLabel="Clinic" yLabel="Utilization (%)">
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
                { key: 'doctors', label: 'Doctors', align: 'right' as const },
                { key: 'patients', label: 'Patients', align: 'right' as const },
                { key: 'wait', label: 'Average Waiting Time', align: 'right' as const },
                { key: 'load', label: 'Doctor Workload', align: 'right' as const },
                { key: 'utilization', label: 'Utilization', align: 'right' as const },
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
                    <Badge tone={utilizationTone(row.utilization_percentage ?? 0) as 'danger' | 'warning' | 'success'} dot>
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