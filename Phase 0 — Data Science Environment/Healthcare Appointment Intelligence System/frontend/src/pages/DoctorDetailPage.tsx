import { useParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useApi } from '@/hooks/useApi'
import { doctorApi } from '@/services/doctorApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, LoadingState } from '@/components/ui/States'
import { ChartCard } from '@/components/ui/ChartCard'
import { Card } from '@/components/ui/Card'
import { formatMinutes, formatPercent } from '@/utils/format'
import type { Doctor } from '@/types'

function tooltipStyles() {
  return { contentStyle: { borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, background: '#FFFFFF' } }
}

export function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useApi(() => doctorApi.get(id ?? ''), [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Doctor not found'} onRetry={reload} />
  }

  const doctor = data as Doctor & { doctor_load?: number; no_show_rate?: number }
  const trends = doctor.trends ?? []

  return (
    <div className="space-y-6">
      <PageHeader title={doctor.name} description={`${doctor.doctor_id} · ${doctor.specialization} · ${doctor.clinic_name ?? doctor.clinic_id}`} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <MiniStat label="Appointments" value={String(doctor.appointments ?? 0)} />
        <MiniStat label="Avg waiting" value={formatMinutes(doctor.average_waiting_time)} />
        <MiniStat label="Doctor load" value={Number(doctor.doctor_load ?? 0).toFixed(2)} />
        <MiniStat label="No-show rate" value={formatPercent(doctor.no_show_rate)} />
        <MiniStat label="Utilization" value={formatPercent(doctor.utilization)} />
      </div>

      <ChartCard title="Patient Volume" subtitle="Appointments per day">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trends.map((t) => ({ date: t._id.day, value: t.appointments }))}>
            <defs>
              <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1F6E66" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#1F6E66" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
            <Tooltip {...tooltipStyles()} />
            <Area type="monotone" dataKey="value" name="Appointments" stroke="#1F6E66" fill="url(#vol)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Waiting Time" subtitle="Average waiting time per day (minutes)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends.map((t) => ({ date: t._id.day, value: t.average_waiting_time }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Line type="monotone" dataKey="value" name="Waiting (min)" stroke="#B45309" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Doctor Load Trend" subtitle="Average load per day">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends.map((t) => ({ date: t._id.day, value: t.average_doctor_load }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} domain={[0, 1]} />
              <Tooltip {...tooltipStyles()} />
              <Line type="monotone" dataKey="value" name="Load" stroke="#475569" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-charcoal-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-charcoal">{value}</p>
    </Card>
  )
}