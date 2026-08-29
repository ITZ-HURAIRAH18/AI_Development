import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import { useOutletContext } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ChartCard } from '@/components/ui/ChartCard'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { PageSkeleton } from '@/components/ui/Skeleton'
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
  const outlet = useOutletContext<{ clinicId?: string }>()
  const clinicId = outlet?.clinicId ?? ''
  const { data, loading, error, reload } = useApi(() => analyticsApi.waitingTime({ clinic_id: clinicId }), [clinicId], `waiting-time-${clinicId}`)

  if (loading) {
    return <PageSkeleton cards={4} charts={4} tableRows={0} />
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load waiting-time analytics'} title="Unable to load waiting time analytics" onRetry={reload} />
  }

  const stats = data.stats

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Waiting Time Analytics"
        breadcrumb="Operations / Waiting Time"
        description="Statistical distributions, clinic comparisons, and provider queue time trends."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Average Waiting Time" value={`${Math.round(stats.average)} min`} subtitle="Model estimate" icon={Clock} tone="info" />
        <StatCard title="Median Waiting Time" value={`${Math.round(stats.median)} min`} subtitle="50th percentile" icon={Gauge} tone="neutral" />
        <StatCard title="Maximum Waiting Time" value={`${Math.round(stats.maximum)} min`} subtitle="Peak recorded wait" icon={TrendingUp} tone="warning" />
        <StatCard title="Patients Served" value={stats.count.toLocaleString('en-US')} subtitle="Appointments analyzed" icon={Clock} tone="neutral" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Waiting Time Distribution" subtitle="Appointments grouped by duration interval" xLabel="Waiting Time (minutes)" yLabel="Patients">
          {data.distribution.length === 0 ? (
            <EmptyState title="No waiting-time data" description="Import appointment records to calculate queue waiting metrics." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.distribution.map((d) => ({ name: `${String(d._id)} min`, count: d.count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip {...tooltipStyles()} />
                <Bar dataKey="count" name="Patients" fill="#0F62FE" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Waiting Time Trend" subtitle="Historical average daily waiting time" xLabel="Date" yLabel="Average Waiting Time (min)">
          {data.trend.length === 0 ? (
            <EmptyState title="No trend data" description="Daily waiting times will appear once records are available." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} tickFormatter={(v) => v.slice(5)} minTickGap={40} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip {...tooltipStyles()} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="waiting_time" name="Waiting (min)" stroke="#393939" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Waiting Time by Clinic" subtitle="Facility benchmark comparison" xLabel="Clinic" yLabel="Average Waiting Time (min)">
          {data.by_clinic.length === 0 ? (
            <EmptyState title="No clinic data" description="Waiting times per clinic will appear once records are available." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.by_clinic.map((c) => ({ name: c.clinic_id, minutes: c.average }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip {...tooltipStyles()} />
                <Bar dataKey="minutes" name="Avg waiting" fill="#0F62FE" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Doctors by Average Waiting Time" subtitle="Providers with the longest average patient waits" xLabel="Doctor" yLabel="Average Waiting Time (min)">
          {data.by_doctor.length === 0 ? (
            <EmptyState title="No doctor data" description="Waiting times per provider will appear once records are available." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.by_doctor.slice(0, 12).map((d) => ({ name: d.doctor_id, minutes: d.average }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#525252' }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
                <Tooltip {...tooltipStyles()} />
                <Bar dataKey="minutes" name="Avg waiting" fill="#525252" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}