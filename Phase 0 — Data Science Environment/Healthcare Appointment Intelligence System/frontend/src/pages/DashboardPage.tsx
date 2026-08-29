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
import {
  CalendarClock,
  ClipboardList,
  Clock,
  Gauge,
  ShieldAlert,
  UserX,
} from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { formatNumber, formatPercent, formatMinutes } from '@/utils/format'
import { RISK_COLORS } from '@/utils/risk'
import type { RiskLevel } from '@/utils/risk'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

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

export function DashboardPage() {
  const outlet = useOutletContext<{ clinicId?: string }>()
  const clinicId = outlet?.clinicId ?? ''
  const kpis = useApi(() => analyticsApi.dashboard({ clinic_id: clinicId }), [clinicId], `dashboard-kpis-${clinicId}`)
  const charts = useApi(() => analyticsApi.charts({ clinic_id: clinicId }), [clinicId], `dashboard-charts-${clinicId}`)

  if (charts.loading || kpis.loading) {
    return <DashboardSkeleton />
  }

  if (charts.error || kpis.error) {
    return <ErrorState message={charts.error ?? kpis.error ?? 'Unable to load dashboard data'} onRetry={() => { charts.reload(); kpis.reload() }} />
  }

  const chartData = charts.data
  const kpiData = kpis.data

  const riskDistribution = (chartData?.scheduling_risk_distribution ?? []).map((item) => ({
    name: `${item._id} Risk`,
    value: item.count,
  }))

  const trackingDays = chartData?.appointment_volume?.length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Command Center"
        breadcrumb="Operations / Dashboard"
        description="Enterprise operational metrics for appointment volume, waiting time, no-show probability, clinic utilization, and doctor workload."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Appointments"
          value={formatNumber(kpiData?.total_appointments)}
          subtitle={trackingDays > 0 ? `${formatNumber(trackingDays)} tracking days` : 'Tracking period metrics'}
          icon={CalendarClock}
          tone="info"
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
          subtitle="Model estimate"
          icon={Clock}
          tone="neutral"
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
          subtitle="Capacity average"
          icon={Gauge}
          tone="info"
        />
        <StatCard
          title="Doctor Workload"
          value={Number(kpiData?.average_doctor_load ?? 0).toFixed(2)}
          subtitle="Average active load"
          icon={ClipboardList}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Appointment Volume" subtitle="Daily appointment throughput" xLabel="Date" yLabel="Appointments">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData?.appointment_volume ?? []}>
              <defs>
                <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F62FE" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0F62FE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...chartTooltipStyles()} />
              <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#0F62FE" fill="url(#volume)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="No-show Rate Trend" subtitle="Percentage of scheduled appointments not attended" xLabel="Date" yLabel="No-show Rate (%)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData?.no_show_rate ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" />
              <Tooltip {...chartTooltipStyles()} />
              <Line type="monotone" dataKey="rate" name="No-show rate" stroke="#DA1E28" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waiting Time Trend" subtitle="Average waiting time in minutes" xLabel="Date" yLabel="Average Waiting Time (min)">
          {!chartData || (chartData.waiting_time_trend ?? []).length === 0 ? (
            <EmptyState title="No waiting-time data" description="Waiting time metrics will appear once appointment records are imported." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData.waiting_time_trend} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(value) => value.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} domain={[0, 'auto']} />
                <Tooltip {...chartTooltipStyles()} />
                <Legend iconType="line" wrapperStyle={{ fontSize: 12, color: '#161616' }} />
                <Line type="monotone" dataKey="waiting_time" name="Waiting (min)" stroke="#0F62FE" strokeWidth={2} dot={{ r: 2, fill: '#0F62FE' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Scheduling Risk Distribution" subtitle="Risk classification of active prediction records" description="Distribution of appointments across low, medium and high scheduling risk.">
          {riskDistribution.length === 0 ? (
            <EmptyState title="No risk data" description="Prediction records will populate the risk distribution." />
          ) : (
            <div className="flex h-[260px] items-center justify-center">
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
            </div>
          )}
        </ChartCard>

        <ChartCard title="Clinic Utilization" subtitle="Capacity utilization percentage by clinic" xLabel="Clinic" yLabel="Utilization (%)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={(chartData?.clinic_utilization ?? []).map((row) => ({ ...row, name: row.clinic_id }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} unit="%" domain={[0, 100]} />
              <Tooltip {...chartTooltipStyles()} />
              <Bar dataKey="utilization_percentage" name="Utilization" fill="#0F62FE" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Doctor Workload" subtitle="Active appointments per doctor" xLabel="Doctor" yLabel="Active Appointments">
          {!chartData || (chartData.doctor_workload ?? []).length === 0 ? (
            <EmptyState title="No workload data" description="Doctor workload metrics will appear once appointments are recorded." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={(chartData.doctor_workload ?? []).slice(0, 15).map((row) => ({ name: String(row.doctor_id), ...row }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip {...chartTooltipStyles()} />
                <Bar dataKey="appointments" name="Appointments" fill="#525252" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}