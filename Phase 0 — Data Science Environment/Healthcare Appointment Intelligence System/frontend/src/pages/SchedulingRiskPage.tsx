import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { formatMinutes, formatProbability } from '@/utils/format'
import { RISK_COLORS } from '@/utils/risk'

interface RiskDoc {
  id: string
  appointment_id: string | null
  no_show_probability: number
  expected_waiting_time: number
  risk_score: number
  scheduling_risk: string
  risk_factors: string[]
  patient_name?: string
  doctor_name?: string
  clinic_name?: string
  appointment_date?: string
}

export function SchedulingRiskPage() {
  const { data, loading, error, reload } = useApi(() => analyticsApi.schedulingRisk({}), [])

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load scheduling risk'} onRetry={reload} />
  }

  const result = data as { distribution: Array<{ _id: string; count: number }>; high_risk_appointments: RiskDoc[] }
  const distribution = result.distribution ?? []
  const highRisk = result.high_risk_appointments ?? []
  const total = distribution.reduce((sum, item) => sum + item.count, 0)

  const pieData = distribution.map((item) => ({ name: `${item._id} risk`, value: item.count }))

  return (
    <div className="space-y-6">
      <PageHeader title="Scheduling Risk" description="Identify appointments that need attention." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Risk Distribution" subtitle={`${total} predictions analyzed`}>
          {pieData.length === 0 ? (
            <EmptyState title="No risk data" description="Run predictions to populate risk distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[(entry.name.split(' ')[0] as 'LOW' | 'MEDIUM' | 'HIGH') ?? 'LOW']} />
                  ))}
                </Pie>
                <Tooltip {...{ contentStyle: { borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: '#FFFFFF' } }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex justify-center gap-4 text-sm">
            {['HIGH', 'MEDIUM', 'LOW'].map((level) => {
              const count = distribution.find((item) => item._id === level)?.count ?? 0
              return (
                <span key={level} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: RISK_COLORS[level as 'LOW' | 'MEDIUM' | 'HIGH'] }} aria-hidden="true" />
                  {level} · {count}
                </span>
              )
            })}
          </div>
        </ChartCard>

        <Card className="lg:col-span-2">
          <CardHeader title="High-Risk Appointments" subtitle="Appointments with HIGH scheduling risk" />
          <CardContent>
            {highRisk.length === 0 ? (
              <EmptyState title="No high-risk appointments" description="No appointments are currently flagged as high risk." />
            ) : (
              <Table
                columns={[
                  { key: 'patient', label: 'Patient' },
                  { key: 'doctor', label: 'Doctor' },
                  { key: 'clinic', label: 'Clinic' },
                  { key: 'no_show', label: 'No-show Probability', align: 'right' as const },
                  { key: 'wait', label: 'Expected Wait', align: 'right' as const },
                  { key: 'score', label: 'Risk Score', align: 'right' as const },
                  { key: 'factors', label: 'Risk Factors' },
                ]}
              >
                {highRisk.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-charcoal">{item.patient_name}</td>
                    <td className="px-4 py-3 text-charcoal">{item.doctor_name}</td>
                    <td className="px-4 py-3 text-charcoal">{item.clinic_name}</td>
                    <td className="px-4 py-3 text-right text-charcoal">{formatProbability(item.no_show_probability)}</td>
                    <td className="px-4 py-3 text-right text-charcoal">{formatMinutes(item.expected_waiting_time)}</td>
                    <td className="px-4 py-3 text-right"><Badge tone="danger">{item.risk_score}</Badge></td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-charcoal-muted">{(item.risk_factors ?? []).join(', ') || '—'}</span>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}