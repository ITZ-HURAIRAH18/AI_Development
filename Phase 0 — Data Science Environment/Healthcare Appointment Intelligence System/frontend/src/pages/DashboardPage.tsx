import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, CalendarClock, Clock, Gauge, ShieldAlert, UserX } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { formatNumber, formatPercent, formatMinutes } from '@/utils/format'
import { RISK_COLORS } from '@/utils/risk'
import type { RiskLevel } from '@/utils/risk'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'

function chartTooltipStyles() {
  return {
    contentStyle: {
      borderRadius: 0,
      border: '1px solid #E0E0E0',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      fontSize: 11,
      fontFamily: 'IBM Plex Sans, sans-serif',
      background: '#FFFFFF',
    },
    labelStyle: { fontWeight: 700, color: '#161616', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  }
}

import { useOutletContext } from 'react-router-dom'

export function DashboardPage() {
  const outlet = useOutletContext<{ clinicId?: string }>()
  const clinicId = outlet?.clinicId ?? ''
  const kpis = useApi(() => analyticsApi.dashboard({ clinic_id: clinicId }), [clinicId], `dashboard-kpis-${clinicId}`)
  const charts = useApi(() => analyticsApi.charts({ clinic_id: clinicId }), [clinicId], `dashboard-charts-${clinicId}`)

  if (charts.loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={6} />
      </div>
    )
  }

  if (charts.error) {
    return <ErrorState message={charts.error} onRetry={charts.reload} />
  }

  const chartData = charts.data
  const kpiData = kpis.data

  const riskDistribution = (chartData?.scheduling_risk_distribution ?? []).map((item) => ({
    name: `${item._id} Risk`,
    value: item.count,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Command Center"
        description="Enterprise operational metrics for appointment volume, waiting time, no-show probability, and clinic utilization."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Appointments"
          value={formatNumber(kpiData?.total_appointments)}
          subtitle={`${formatNumber(chartData?.appointment_volume.length)} tracking days recorded`}
          icon={CalendarClock}
          tone="neutral"
        />
        <StatCard
          title="Predicted No-shows"
          value={formatNumber(kpiData?.predicted_no_shows)}
          subtitle="Model probability ≥ 50%"
          icon={UserX}
          tone="warning"
        />
        <StatCard
          title="Average Waiting Time"
          value={formatMinutes(kpiData?.average_waiting_time)}
          subtitle={`Max doctor load ${Number(kpiData?.average_doctor_load ?? 0).toFixed(2)}`}
          icon={Clock}
          tone="neutral"
        />
        <StatCard
          title="High Risk Appointments"
          value={formatNumber(kpiData?.high_risk_appointments)}
          subtitle="Scheduling risk flag = HIGH"
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          title="Clinic Utilization"
          value={formatPercent(kpiData?.clinic_utilization)}
          subtitle="Capacity average across clinics"
          icon={Gauge}
          tone="success"
        />
        <StatCard
          title="Doctor Workload Load"
          value={Number(kpiData?.average_doctor_load ?? 0).toFixed(2)}
          subtitle="Average active doctor load ratio"
          icon={AlertTriangle}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Appointment Volume" subtitle="Daily appointment throughput">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData?.appointment_volume ?? []}>
              <defs>
                <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F62FE" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0F62FE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...chartTooltipStyles()} />
              <Area type="monotone" dataKey="appointments" stroke="#0F62FE" fill="url(#volume)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="No-show Rate Trend" subtitle="Percentage of no-shows over time (%)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData?.no_show_rate ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...chartTooltipStyles()} />
              <Line type="monotone" dataKey="rate" stroke="#DA1E28" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waiting Time Trend" subtitle="Average waiting time in minutes">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData?.waiting_time_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...chartTooltipStyles()} />
              <Area type="monotone" dataKey="waiting_time" stroke="#393939" fill="#E0E0E0" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Scheduling Risk Distribution" subtitle="Risk classification of all predictions">
          {riskDistribution.length === 0 ? (
            <EmptyState title="No risk data" description="Run predictions to build the risk distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4} stroke="#ffffff" strokeWidth={2}>
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[(entry.name.split(' ')[0] as RiskLevel) ?? 'LOW']} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyles()} />
                <Legend iconType="square" wrapperStyle={{ fontSize: 11, color: '#161616' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Clinic Utilization Breakdown" subtitle="Capacity utilization percentage by clinic">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(chartData?.clinic_utilization ?? []).map((row) => ({ ...row, name: row.clinic_id }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...chartTooltipStyles()} />
              <Bar dataKey="utilization_percentage" name="Utilization" fill="#0F62FE" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctor Workload Distribution" subtitle="Active appointments count per doctor">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(chartData?.doctor_workload ?? []).slice(0, 15).map((row) => ({ ...row, name: String(row.doctor_id) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...chartTooltipStyles()} />
              <Bar dataKey="appointments" name="Appointments" fill="#525252" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}