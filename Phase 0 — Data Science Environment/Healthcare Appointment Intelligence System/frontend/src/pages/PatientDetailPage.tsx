import { useParams } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { patientApi } from '@/services/patientApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, EmptyState } from '@/components/ui/States'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge, RiskBadge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { formatDate, formatNumber, formatPercent } from '@/utils/format'
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
    return <ProfileSkeleton />
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Patient profile could not be found'} title="Unable to load patient profile" onRetry={reload} />
  }

  const riskStatus = data.risk_status ?? 'LOW'

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title={`Patient Profile: ${data.name}`}
        breadcrumb="Patient Intelligence / Patient Records"
        description={`Identifier: ${data.patient_id} · Gender: ${data.gender}`}
        actions={<RiskBadge risk={riskStatus} />}
      />
      <div className="flex items-center gap-2 border-b border-carbon-gray-20 pb-4 text-xs text-carbon-gray-70">
        <UserRound className="h-4 w-4 text-carbon-gray-50" aria-hidden="true" />
        <span>Predictive risk rating derived from historical no-show behaviour.</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="AGE" value={String(data.age)} />
        <SummaryCard title="TOTAL APPOINTMENTS" value={formatNumber(data.appointments)} />
        <SummaryCard title="NO-SHOW RATE" value={formatPercent(data.no_show_rate)} />
        <SummaryCard title="LAST APPOINTMENT" value={formatDate(data.last_appointment)} />
      </div>

      <Card>
        <CardHeader title="HISTORICAL APPOINTMENT TIMELINE" subtitle="Chronological history of patient clinic visits" />
        <CardContent className="p-0">
          {(data.history && data.history.length) === 0 ? (
            <div className="p-4">
              <EmptyState title="No recorded appointments" description="This patient profile currently has no appointment history." />
            </div>
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
              {(data.history ?? []).map((item: Appointment) => (
                <tr key={item.id} className="cds-table-row">
                  <td className="px-3.5 py-2.5 font-mono font-semibold text-primary-500">{item.appointment_id}</td>
                  <td className="px-3.5 py-2.5 text-carbon-gray-70 font-mono">{formatDate(item.appointment_day)}</td>
                  <td className="px-3.5 py-2.5"><Badge tone="neutral">{item.clinic_id}</Badge></td>
                  <td className="px-3.5 py-2.5 text-carbon-gray-100">{item.doctor_id}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{formatNumber(item.waiting_time)} min</td>
                  <td className="px-3.5 py-2.5"><Badge tone={STATUS_TONES[item.status] ?? 'neutral'}>{item.status}</Badge></td>
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
    <Card className="border-t-2 border-t-primary-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center bg-carbon-gray-10 text-carbon-gray-100">
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">{title}</p>
            <p className="text-xl font-bold tracking-tight font-mono text-carbon-gray-100">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}