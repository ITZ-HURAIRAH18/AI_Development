import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { Select } from '@/components/ui/Select'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { RISK_COLORS } from '@/utils/risk'
import type { RiskLevel } from '@/utils/risk'

function tooltipStyles() {
  return { contentStyle: { borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: '#FFFFFF' } }
}

export function AnalyticsPage() {
  const [clinicId, setClinicId] = useState('')
  const charts = useApi(() => analyticsApi.charts({ clinic_id: clinicId }), [clinicId])
  const advanced = useApi(() => analyticsApi.advanced({ clinic_id: clinicId }), [clinicId])
  const clinics = useApi(() => clinicApi.list(), [])

  if (charts.loading || advanced.loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }
  if (charts.error || advanced.error) {
    return <ErrorState message={charts.error ?? advanced.error ?? 'Unable to load analytics'} onRetry={() => { charts.reload(); advanced.reload() }} />
  }

  const advancedData = advanced.data as {
    sms_impact: Array<{ sms_received: number; appointments: number; no_show_rate: number }>
    age_groups: Array<{ age_group: string; appointments: number; no_show_rate: number }>
    neighbourhoods: Array<{ neighbourhood: string; appointments: number; no_show_rate: number }>
  }
  const chartData = charts.data

  const riskDistribution = (chartData?.scheduling_risk_distribution ?? []).map((item) => ({
    name: `${item._id} risk`,
    value: item.count,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Advanced appointment, no-show and operational analytics."
        actions={
          <div className="min-w-44">
            <Select
              label="Clinic"
              value={clinicId}
              onChange={(event) => setClinicId(event.target.value)}
              options={[
                { value: '', label: 'All clinics' },
                ...(clinics.data ?? []).map((c) => ({ value: c.clinic_id, label: c.name })),
              ]}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Appointment Volume" subtitle="Appointments per day">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData?.appointment_volume ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="appointments" name="Appointments" fill="#1F6E66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="No-show Trend" subtitle="No-show rate over time (%)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData?.no_show_rate ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...tooltipStyles()} />
              <Line type="monotone" dataKey="rate" name="No-show %" stroke="#B45309" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="SMS Impact" subtitle="No-show rate by SMS reminder status">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(advancedData?.sms_impact ?? []).map((row) => ({ name: row.sms_received ? 'SMS received' : 'No SMS', rate: row.no_show_rate }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="rate" name="No-show rate" fill="#64748B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Group Analysis" subtitle="No-show rate by age group">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(advancedData?.age_groups ?? []).map((row) => ({ name: row.age_group, rate: row.no_show_rate }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="rate" name="No-show rate" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Neighbourhood Analysis" subtitle="Top neighbourhoods by appointment volume">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={(advancedData?.neighbourhoods ?? []).map((row) => ({ name: row.neighbourhood, appointments: row.appointments }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="appointments" name="Appointments" fill="#1F6E66" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Risk Distribution" subtitle="Scheduling risk across predictions">
          {riskDistribution.length === 0 ? (
            <EmptyState title="No risk data" description="Run predictions to build this distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[(entry.name.split(' ')[0] as RiskLevel) ?? 'LOW']} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyles()} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}