import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { Clock, Gauge, TrendingUp } from 'lucide-react'

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

export function WaitingTimePage() {
  const { data, loading, error, reload } = useApi(() => analyticsApi.waitingTime({}), [], 'waiting-time')

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load waiting-time analytics'} onRetry={reload} />
  }

  const stats = data.stats

  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Waiting Time Analytics & Queue Diagnostics" description="Statistical distributions, clinic averages, and provider queue time trends." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="AVERAGE WAITING TIME" value={`${Math.round(stats.average)} min`} icon={Clock} tone="neutral" />
        <StatCard title="MEDIAN WAITING TIME" value={`${Math.round(stats.median)} min`} icon={Gauge} tone="neutral" />
        <StatCard title="MAXIMUM RECORDED WAIT" value={`${Math.round(stats.maximum)} min`} icon={TrendingUp} tone="warning" />
        <StatCard title="APPOINTMENTS ANALYZED" value={String(stats.count)} icon={Clock} tone="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="WAITING TIME BUCKET DISTRIBUTION" subtitle="Appointments grouped by duration interval (minutes)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.distribution.map((d) => ({ name: `${String(d._id)} min`, count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="count" name="Appointments" fill="#0F62FE" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="WAITING TIME TREND DIAGNOSTIC" subtitle="Historical average waiting time per day (minutes)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(v) => v.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="waiting_time" name="Waiting (min)" stroke="#DA1E28" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="AVERAGE WAITING TIME BY CLINIC" subtitle="Facility benchmark comparison (minutes)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.by_clinic.map((c) => ({ name: c.clinic_id, minutes: c.average }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="minutes" name="Avg waiting" fill="#525252" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="TOP DOCTORS BY WAITING TIME" subtitle="Providers with longest average patient wait times">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.by_doctor.slice(0, 12).map((d) => ({ name: d.doctor_id, minutes: d.average }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="minutes" name="Avg waiting" fill="#393939" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {data.distribution.length === 0 && <EmptyState title="No waiting-time data available" description="Import appointments to calculate queue waiting metrics." />}
    </div>
  )
}