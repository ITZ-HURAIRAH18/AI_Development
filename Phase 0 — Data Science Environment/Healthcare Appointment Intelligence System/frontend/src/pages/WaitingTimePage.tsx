import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { Clock, Gauge, TrendingUp } from 'lucide-react'

function tooltipStyles() {
  return { contentStyle: { borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: '#FFFFFF' } }
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
    <div className="space-y-6">
      <PageHeader title="Waiting Time Analytics" description="Waiting time statistics across appointments." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Average Waiting Time" value={`${Math.round(stats.average)} min`} icon={Clock} />
        <StatCard title="Median Waiting Time" value={`${Math.round(stats.median)} min`} icon={Gauge} />
        <StatCard title="Maximum Waiting Time" value={`${Math.round(stats.maximum)} min`} icon={TrendingUp} tone="warning" />
        <StatCard title="Appointments Analyzed" value={String(stats.count)} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Waiting Time Distribution" subtitle="Appointments by waiting-time bucket">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.distribution.map((d) => ({ name: String(d._id), count: d.count }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="count" name="Appointments" fill="#1F6E66" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waiting Time Trend" subtitle="Average waiting time over time (minutes)">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="waiting_time" name="Waiting (min)" stroke="#B45309" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waiting Time by Clinic" subtitle="Average minutes per clinic">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.by_clinic.map((c) => ({ name: c.clinic_id, minutes: c.average }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="minutes" name="Avg waiting" fill="#64748B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Waiting Time by Doctor" subtitle="Top providers by average waiting time">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.by_doctor.slice(0, 12).map((d) => ({ name: d.doctor_id, minutes: d.average }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Bar dataKey="minutes" name="Avg waiting" fill="#475569" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {data.distribution.length === 0 && <EmptyState title="No waiting-time data" description="Import appointments to see waiting-time analytics." />}
    </div>
  )
}