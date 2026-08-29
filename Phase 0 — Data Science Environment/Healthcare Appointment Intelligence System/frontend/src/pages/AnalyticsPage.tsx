import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { Select } from '@/components/ui/Select'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { RISK_COLORS } from '@/utils/risk'
import type { RiskLevel } from '@/utils/risk'
import { useOutletContext } from 'react-router-dom'

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

export function AnalyticsPage() {
  const outlet = useOutletContext<{ clinicId?: string }>()
  const globalClinicId = outlet?.clinicId ?? ''
  const [localClinicId, setLocalClinicId] = useState('')
  const activeClinicId = localClinicId || globalClinicId
  const charts = useApi(() => analyticsApi.charts({ clinic_id: activeClinicId }), [activeClinicId], `analytics-charts-${activeClinicId}`)
  const advanced = useApi(() => analyticsApi.advanced({ clinic_id: activeClinicId }), [activeClinicId], `analytics-advanced-${activeClinicId}`)
  const clinics = useApi(() => clinicApi.list(), [], 'analytics-clinics')

  if (charts.loading || advanced.loading) {
    return <PageSkeleton cards={0} charts={6} tableRows={0} />
  }
  if (charts.error || advanced.error) {
    return (
      <ErrorState
        message={charts.error ?? advanced.error ?? 'Unable to load analytics'}
        title="Unable to load analytics"
        onRetry={() => { charts.reload(); advanced.reload() }}
      />
    )
  }

  const advancedData = advanced.data as {
    sms_impact: Array<{ sms_received: number; appointments: number; no_show_rate: number }>
    age_groups: Array<{ age_group: string; appointments: number; no_show_rate: number }>
    neighbourhoods: Array<{ neighbourhood: string; appointments: number; no_show_rate: number }>
  }
  const chartData = charts.data

  const riskDistribution = (chartData?.scheduling_risk_distribution ?? []).map((item) => ({
    name: `${item._id} Risk`,
    value: item.count,
  }))
  const riskTotal = riskDistribution.reduce((sum, item) => sum + item.value, 0)

  const volumeData = chartData?.appointment_volume ?? []
  const noShowData = chartData?.no_show_rate ?? []
  const smsImpact = advancedData?.sms_impact ?? []
  const ageGroups = advancedData?.age_groups ?? []
  const neighbourhoods = advancedData?.neighbourhoods ?? []

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Advanced Operations & Demographic Analytics"
        breadcrumb="Reporting / Advanced Analytics"
        description="SMS intervention analysis, age group cohorts, neighbourhood demand density, and risk distribution diagnostics."
        actions={
          <div className="min-w-44">
            <Select
              label="Clinic Scope"
              value={activeClinicId}
              onChange={(event) => setLocalClinicId(event.target.value)}
              options={[
                { value: '', label: 'All Clinics Overview' },
                ...(clinics.data ?? []).map((c) => ({ value: c.clinic_id, label: `${c.clinic_id} — ${c.name}` })),
              ]}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Appointment Throughput Volume" subtitle="Daily appointment records count" xLabel="Date" yLabel="Appointments">
          {volumeData.length === 0 ? (
            <EmptyState title="No throughput data" description="Daily appointment volume will appear once records are available." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(v) => v.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip {...tooltipStyles()} />
                <Bar dataKey="appointments" name="Appointments" fill="#0F62FE" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Historical No-show Rate Trend" subtitle="Daily no-show percentage" xLabel="Date" yLabel="No-show Rate (%)">
          {noShowData.length === 0 ? (
            <EmptyState title="No no-show trend" description="Daily no-show rates will appear once records are available." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={noShowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(v) => v.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" />
                <Tooltip {...tooltipStyles()} />
                <Line type="monotone" dataKey="rate" name="No-show Rate (%)" stroke="#DA1E28" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="SMS Reminder Intervention Impact" subtitle="Comparison of no-show rate between SMS notification states" xLabel="Notification State" yLabel="No-show Rate (%)">
          {smsImpact.length === 0 ? (
            <EmptyState title="No SMS impact data" description="SMS reminder impact can be measured once records include notification status." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={smsImpact.map((row) => ({ name: row.sms_received ? 'SMS Sent' : 'No SMS', rate: row.no_show_rate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" />
                <Tooltip {...tooltipStyles()} />
                <Bar dataKey="rate" name="No-show Rate (%)" fill="#525252" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Demographic Age Group Cohort Analysis" subtitle="No-show probability variation across patient age brackets" xLabel="Age Group" yLabel="No-show Rate (%)">
          {ageGroups.length === 0 ? (
            <EmptyState title="No age cohort data" description="Age group cohort analysis requires demographic records." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ageGroups.map((row) => ({ name: row.age_group, rate: row.no_show_rate }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" />
                <Tooltip {...tooltipStyles()} />
                <Bar dataKey="rate" name="No-show Rate (%)" fill="#393939" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Neighbourhood Demand Density" subtitle="Top patient geographical origins by volume" xLabel="Appointments" yLabel="Neighbourhood">
          {neighbourhoods.length === 0 ? (
            <EmptyState title="No neighbourhood data" description="Geographical demand density will appear once records are available." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={neighbourhoods.map((row) => ({ name: row.neighbourhood, appointments: row.appointments }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} width={120} />
                <Tooltip {...tooltipStyles()} />
                <Bar dataKey="appointments" name="Appointments" fill="#0F62FE" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Scheduling Risk Classification Profile" subtitle="Risk distribution across all active predictions">
          {riskDistribution.length === 0 ? (
            <EmptyState title="No risk data logged" description="Execute model inference to build risk profile metrics." />
          ) : (
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <ResponsiveContainer width="100%" height={200} className="max-w-[220px]">
                <PieChart>
                  <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3} stroke="#ffffff" strokeWidth={2}>
                    {riskDistribution.map((entry) => (
                      <Cell key={entry.name} fill={RISK_COLORS[(entry.name.split(' ')[0] as RiskLevel) ?? 'LOW']} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyles()} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {riskDistribution.map((entry) => {
                  const share = riskTotal > 0 ? Math.round((entry.value / riskTotal) * 100) : 0
                  return (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-none" style={{ backgroundColor: RISK_COLORS[(entry.name.split(' ')[0] as RiskLevel) ?? 'LOW'] }} aria-hidden="true" />
                      <span className="font-semibold text-carbon-gray-100">{entry.name}</span>
                      <span className="font-mono text-carbon-gray-60">{entry.value} · {share}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}