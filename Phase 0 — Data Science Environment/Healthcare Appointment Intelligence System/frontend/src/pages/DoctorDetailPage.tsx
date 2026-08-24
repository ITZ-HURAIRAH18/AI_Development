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
    return <ErrorState message={error ?? 'Doctor record not found'} onRetry={reload} />
  }

  const doctor = data as Doctor & { doctor_load?: number; no_show_rate?: number }
  const trends = doctor.trends ?? []

  return (
    <div className="space-y-6 font-sans">
      <PageHeader title={`DOCTOR SPECIFICATION: ${doctor.name.toUpperCase()}`} description={`ID: ${doctor.doctor_id} · ${doctor.specialization} · Assigned Clinic: ${doctor.clinic_name ?? doctor.clinic_id}`} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <MiniStat label="TOTAL APPOINTMENTS" value={String(doctor.appointments ?? 0)} />
        <MiniStat label="AVG WAITING TIME" value={formatMinutes(doctor.average_waiting_time)} />
        <MiniStat label="DOCTOR WORKLOAD RATIO" value={Number(doctor.doctor_load ?? 0).toFixed(2)} />
        <MiniStat label="NO-SHOW RATE" value={formatPercent(doctor.no_show_rate)} />
        <MiniStat label="CAPACITY UTILIZATION" value={formatPercent(doctor.utilization)} />
      </div>

      <ChartCard title="PATIENT APPOINTMENT VOLUME TREND" subtitle="Daily appointments processed by doctor">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trends.map((t) => ({ date: t._id.day, value: t.appointments }))}>
            <defs>
              <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0F62FE" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0F62FE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} minTickGap={40} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
            <Tooltip {...tooltipStyles()} />
            <Area type="monotone" dataKey="value" name="Appointments" stroke="#0F62FE" fill="url(#vol)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="WAITING TIME DIAGNOSTIC TREND" subtitle="Average patient waiting time in minutes">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends.map((t) => ({ date: t._id.day, value: t.average_waiting_time }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} />
              <Tooltip {...tooltipStyles()} />
              <Line type="monotone" dataKey="value" name="Waiting (min)" stroke="#DA1E28" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="DOCTOR WORKLOAD RATIO TREND" subtitle="Average daily doctor load">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trends.map((t) => ({ date: t._id.day, value: t.average_doctor_load }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#525252' }} minTickGap={40} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#525252' }} tickLine={false} axisLine={false} width={45} domain={[0, 1]} />
              <Tooltip {...tooltipStyles()} />
              <Line type="monotone" dataKey="value" name="Load Ratio" stroke="#393939" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 border-t-2 border-t-primary-500">
      <p className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">{label}</p>
      <p className="mt-1 text-lg font-bold tracking-tight font-mono text-carbon-gray-100">{value}</p>
    </Card>
  )
}