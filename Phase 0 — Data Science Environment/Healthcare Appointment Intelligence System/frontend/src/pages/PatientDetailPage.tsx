import { useParams } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { patientApi } from '@/services/patientApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, LoadingState, EmptyState } from '@/components/ui/States'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { formatDate, formatNumber, formatPercent } from '@/utils/format'
import { getRiskStyle } from '@/utils/risk'
import type { Appointment } from '@/types'

const STATUS_TONES: Record<string, 'neutral' | 'success' | 'warning' | 'danger' | 'primary'> = {
  Scheduled: 'primary',
  Completed: 'success',
  'No-show': 'danger',
  Cancelled: 'neutral',
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading, error, reload } = useApi(() => patientApi.get(id ?? ''), [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingState rows={8} />
      </div>
    )
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Patient not found'} onRetry={reload} />
  }

  const riskStyle = getRiskStyle(data.risk_status ?? 'LOW')

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.name}
        description={`${data.patient_id} · ${data.gender}`}
        actions={
          <Badge tone={riskStyle.dot === 'bg-danger' ? 'danger' : riskStyle.dot === 'bg-warning' ? 'warning' : 'success'}>
            {riskStyle.label}
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Age" value={String(data.age)} />
        <SummaryCard title="Appointments" value={formatNumber(data.appointments)} />
        <SummaryCard title="No-show rate" value={formatPercent(data.no_show_rate)} />
        <SummaryCard title="Last appointment" value={formatDate(data.last_appointment)} />
      </div>

      <Card>
        <CardHeader title="Appointment History" subtitle="Recent appointments for this patient" />
        <CardContent>
          {(data.history && data.history.length) === 0 ? (
            <EmptyState title="No appointments" description="This patient has no recorded appointments." />
          ) : (
            <Table
              columns={[
                { key: 'appointment_id', label: 'Appointment ID' },
                { key: 'appointment_day', label: 'Date' },
                { key: 'clinic_id', label: 'Clinic' },
                { key: 'doctor_id', label: 'Doctor' },
                { key: 'waiting_time', label: 'Waiting Time', align: 'right' as const },
                { key: 'status', label: 'Status' },
              ]}
            >
              {data.history.map((item: Appointment) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-primary-700">{item.appointment_id}</td>
                  <td className="px-4 py-3 text-charcoal">{formatDate(item.appointment_day)}</td>
                  <td className="px-4 py-3"><Badge tone="neutral">{item.clinic_id}</Badge></td>
                  <td className="px-4 py-3 text-charcoal">{item.doctor_id}</td>
                  <td className="px-4 py-3 text-right text-charcoal">{formatNumber(item.waiting_time)} min</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONES[item.status] ?? 'neutral'}>{item.status}</Badge></td>
                </tr>
              ))}
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <UserRound className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-charcoal-muted">{title}</p>
            <p className="text-lg font-semibold text-charcoal">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}