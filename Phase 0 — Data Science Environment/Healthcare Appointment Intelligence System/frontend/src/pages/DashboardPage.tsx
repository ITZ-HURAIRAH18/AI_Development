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
      borderRadius: 8,
      border: '1px solid #E5E7EB',
      fontSize: 12,
      background: '#FFFFFF',
    },
    labelStyle: { fontWeight: 600, color: '#1E293B' },
  }
}

export function DashboardPage() {
  const kpis = useApi(() => analyticsApi.dashboard(), [], 'dashboard-kpis')
  const charts = useApi(() => analyticsApi.charts(), [], 'dashboard-charts')

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
    name: `${item._id} risk`,
    value: item.count,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Overview"
        description="Key performance indicators across clinics and providers."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Appointments"
          value={formatNumber(kpiData?.total_appointments)}
          subtitle={`${formatNumber(chartData?.appointment_volume.length)} days tracked`}
          icon={CalendarClock}
        />
        <StatCard
          title="Predicted No-shows"
          value={formatNumber(kpiData?.predicted_no_shows)}
          subtitle="Probability ≥ 50%"
          icon={UserX}
          tone="warning"
        />
        <StatCard
          title="Average Waiting Time"
          value={formatMinutes(kpiData?.average_waiting_time)}
          subtitle={`Max doctor load ${Number(kpiData?.average_doctor_load ?? 0).toFixed(2)}`}
          icon={Clock}
        />
        <StatCard
          title="High Risk Appointments"
          value={formatNumber(kpiData?.high_risk_appointments)}
          subtitle="Scheduling risk = HIGH"
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          title="Clinic Utilization"
          value={formatPercent(kpiData?.clinic_utilization)}
          subtitle="Average across clinics"
          icon={Gauge}
          tone="success"
        />
        <StatCard
          title="Doctor Workload"
          value={Number(kpiData?.average_doctor_load ?? 0).toFixed(2)}
          subtitle="Average doctor load"
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Appointment Volume" subtitle="Appointments per day">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData?.appointment_volume ?? []}>
              <defs>
                <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F6E66" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#1F6E66" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...chartTooltipStyles()} />
              <Area type="monotone" dataKey="appointments" stroke="#1F6E66" fill="url(#volume)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="No-show Rate" subtitle="No-show rate over time (%)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData?.no_show_rate ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...chartTooltipStyles()} />
              <Line type="monotone" dataKey="rate" stroke="#B45309" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waiting Time Trend" subtitle="Average waiting time (minutes)">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData?.waiting_time_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...chartTooltipStyles()} />
              <Area type="monotone" dataKey="waiting_time" stroke="#475569" fill="#E2E8F0" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Scheduling Risk" subtitle="Distribution across appointments">
          {riskDistribution.length === 0 ? (
            <EmptyState title="No risk data" description="Run predictions to build the risk distribution." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[(entry.name.split(' ')[0] as RiskLevel) ?? 'LOW']} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyles()} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Clinic Utilization" subtitle="Utilization percentage by clinic">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(chartData?.clinic_utilization ?? []).map((row) => ({ ...row, name: row.clinic_id }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...chartTooltipStyles()} />
              <Bar dataKey="utilization_percentage" name="Utilization" fill="#1F6E66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctor Workload" subtitle="Appointments per doctor">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(chartData?.doctor_workload ?? []).slice(0, 15).map((row) => ({ ...row, name: String(row.doctor_id) }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...chartTooltipStyles()} />
              <Bar dataKey="appointments" name="Appointments" fill="#64748B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}