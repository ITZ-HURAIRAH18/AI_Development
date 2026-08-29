import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Activity, AlertTriangle, Clock, History, ShieldAlert, TimerReset } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { ErrorState } from '@/components/ui/States'
import { FormSkeleton } from '@/components/ui/Skeleton'
import { RiskBadge } from '@/components/ui/Badge'
import { getErrorMessage } from '@/services/api'
import { predictionApi } from '@/services/predictionApi'
import { formatDateTime, formatMinutes, formatProbability } from '@/utils/format'
import type { FullPredictionResult, Prediction } from '@/types'

interface NoShowForm {
  age: string
  gender: string
  scholarship: string
  hypertension: string
  diabetes: string
  alcoholism: string
  handicap: string
  sms_received: string
  scheduled_day: string
  appointment_day: string
}

interface OperationalForm {
  queue_length: string
  patients_ahead: string
  consultation_duration: string
  doctor_load: string
  room_available: string
}

const initialNoShow: NoShowForm = {
  age: '42',
  gender: 'F',
  scholarship: '0',
  hypertension: '0',
  diabetes: '0',
  alcoholism: '0',
  handicap: '0',
  sms_received: '1',
  scheduled_day: '',
  appointment_day: '',
}

const initialOperational: OperationalForm = {
  queue_length: '5',
  patients_ahead: '3',
  consultation_duration: '20',
  doctor_load: '0.5',
  room_available: '1',
}

const toggleOptions = [
  { value: '0', label: 'No' },
  { value: '1', label: 'Yes' },
]

function toDaysAgoDate(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 16)
}

export function PredictionsPage() {
  const [noShow, setNoShow] = useState<NoShowForm>(initialNoShow)
  const [operational, setOperational] = useState<OperationalForm>(initialOperational)
  const [result, setResult] = useState<FullPredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [historyItems, setHistoryItems] = useState<Prediction[]>([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const loadHistory = async (page = historyPage) => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const result = await predictionApi.history({ page, limit: 10 })
      setHistoryItems(result.items)
      setHistoryTotal(result.total)
      setHistoryPage(result.page)
    } catch (err) {
      setHistoryError(getErrorMessage(err))
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    void loadHistory(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateNoShow = (key: keyof NoShowForm, value: string) => setNoShow((prev) => ({ ...prev, [key]: value }))
  const updateOperational = (key: keyof OperationalForm, value: string) => setOperational((prev) => ({ ...prev, [key]: value }))

  const setSuggestedDates = () => {
    updateNoShow('scheduled_day', toDaysAgoDate(7))
    updateNoShow('appointment_day', toDaysAgoDate(3))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)
    try {
      const payload = {
        no_show: {
          age: Number(noShow.age),
          gender: noShow.gender,
          scholarship: Number(noShow.scholarship),
          hypertension: Number(noShow.hypertension),
          diabetes: Number(noShow.diabetes),
          alcoholism: Number(noShow.alcoholism),
          handicap: Number(noShow.handicap),
          sms_received: Number(noShow.sms_received),
          scheduled_day: new Date(noShow.scheduled_day).toISOString(),
          appointment_day: new Date(noShow.appointment_day).toISOString(),
        },
        operational: {
          queue_length: Number(operational.queue_length),
          patients_ahead: Number(operational.patients_ahead),
          consultation_duration: Number(operational.consultation_duration),
          doctor_load: Number(operational.doctor_load),
          room_available: Number(operational.room_available),
        },
      }
      const data = await predictionApi.full(payload)
      setResult(data)
      void loadHistory(1)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Model Prediction Simulator"
        breadcrumb="Patient Intelligence / Model Predictions"
        description="Simulate appointment parameters to compute no-show probability, expected waiting time, and operational risk factors."
      />

      <div className="flex items-start gap-3 border border-carbon-gray-20 bg-carbon-gray-10 px-4 py-3 text-xs text-carbon-gray-70">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-carbon-gray-50" aria-hidden="true" />
        <p>
          <span className="font-semibold text-carbon-gray-100">Model governance notice:</span> Predictions are statistical estimates for
          operational planning and do not constitute clinical decisions. Live model performance dashboards are not exposed through the API;
          validation metrics (MAE, RMSE, R&sup2;) are documented in the training report.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Patient Demographic & Historical Attributes" subtitle="Primary features for no-show probability inference" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Patient Age" type="number" min={0} max={120} value={noShow.age} onChange={(event) => updateNoShow('age', event.target.value)} required />
              <Select
                label="Gender"
                value={noShow.gender}
                onChange={(event) => updateNoShow('gender', event.target.value)}
                options={[
                  { value: 'M', label: 'Male' },
                  { value: 'F', label: 'Female' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Select label="Scholarship" value={noShow.scholarship} onChange={(event) => updateNoShow('scholarship', event.target.value)} options={toggleOptions} />
              <Select label="Hypertension" value={noShow.hypertension} onChange={(event) => updateNoShow('hypertension', event.target.value)} options={toggleOptions} />
              <Select label="Diabetes" value={noShow.diabetes} onChange={(event) => updateNoShow('diabetes', event.target.value)} options={toggleOptions} />
              <Select label="Alcoholism" value={noShow.alcoholism} onChange={(event) => updateNoShow('alcoholism', event.target.value)} options={toggleOptions} />
              <Select label="Handicap Level" value={noShow.handicap} onChange={(event) => updateNoShow('handicap', event.target.value)} options={[{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }]} />
              <Select label="SMS Notification" value={noShow.sms_received} onChange={(event) => updateNoShow('sms_received', event.target.value)} options={toggleOptions} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Scheduled Timestamp" type="datetime-local" value={noShow.scheduled_day} onChange={(event) => updateNoShow('scheduled_day', event.target.value)} required />
              <Input label="Appointment Timestamp" type="datetime-local" value={noShow.appointment_day} onChange={(event) => updateNoShow('appointment_day', event.target.value)} required />
            </div>
            <button type="button" onClick={setSuggestedDates} className="text-xs font-semibold text-primary-500 hover:text-primary-600 uppercase tracking-wider">
              Auto-fill sample timestamps
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Clinical & Queue Operational Metrics" subtitle="Parameters for waiting time and capacity diagnostics" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Current Queue Length" type="number" min={0} value={operational.queue_length} onChange={(event) => updateOperational('queue_length', event.target.value)} required />
              <Input label="Patients Ahead in Line" type="number" min={0} value={operational.patients_ahead} onChange={(event) => updateOperational('patients_ahead', event.target.value)} required />
              <Input label="Consultation Duration (Min)" type="number" min={1} max={240} value={operational.consultation_duration} onChange={(event) => updateOperational('consultation_duration', event.target.value)} required />
              <Input label="Doctor Workload Ratio (0-1)" type="number" step="0.05" min={0} max={1} value={operational.doctor_load} onChange={(event) => updateOperational('doctor_load', event.target.value)} required />
            </div>
            <Select label="Exam Room Availability" value={operational.room_available} onChange={(event) => updateOperational('room_available', event.target.value)} options={toggleOptions} />
            <div className="!mt-6">
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {loading ? 'Processing Model Inference...' : 'Execute Model Prediction'}
                {!loading && <Activity className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-start gap-3 border border-red-200 border-l-4 border-l-danger bg-red-50 px-4 py-3 text-xs font-semibold text-danger lg:col-span-2" role="alert">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {result && !loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ResultCard
            icon={Activity}
            title="No-show Probability"
            value={`${Math.round(result.no_show_probability * 100)}%`}
            detail={<>Risk classification: <span className="font-bold text-carbon-gray-100">{result.no_show_risk}</span></>}
            percentage={result.no_show_probability * 100}
          />
          <ResultCard
            icon={Clock}
            title="Expected Waiting Time"
            value={`${Math.round(result.expected_waiting_time)} min`}
            detail={<>Queue calculation based on doctor workload ratio</>}
          />
          <Card className="border-t-4 border-t-danger">
            <CardHeader title="Scheduling Risk Diagnostic" />
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-7 w-7 text-primary-500" aria-hidden="true" />
                  <div>
                    <p className="text-2xl font-bold tracking-tight font-mono text-carbon-gray-100">{result.scheduling_risk}</p>
                    <p className="text-xs font-mono text-carbon-gray-60">Risk Score: {result.risk_score} / 20</p>
                  </div>
                </div>
                <RiskBadge risk={result.scheduling_risk} />
              </div>

              {result.risk_factors.length > 0 && (
                <div className="border-t border-carbon-gray-20 pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60 mb-2">Contributing Factors</p>
                  <ul className="space-y-1">
                    {result.risk_factors.map((factor) => (
                      <li key={factor} className="flex items-center gap-2 text-xs text-carbon-gray-70">
                        <TimerReset className="h-3.5 w-3.5 text-warning shrink-0" aria-hidden="true" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <History className="h-4 w-4 text-carbon-gray-50" aria-hidden="true" />
              Prediction History
            </span>
          }
          subtitle="Recorded model inference requests across the organization"
        />
        <CardContent className="space-y-4">
          {historyError ? (
            <ErrorState message={historyError} onRetry={() => void loadHistory(1)} title="Unable to load prediction history" />
          ) : historyLoading && historyItems.length === 0 ? (
            <FormSkeleton />
          ) : historyItems.length === 0 ? (
            <div className="border border-carbon-gray-20 px-4 py-10 text-center text-xs text-carbon-gray-60">
              No prediction records have been generated yet. Run the simulator above to produce the first inference.
            </div>
          ) : (
            <>
              <div className="border border-carbon-gray-20">
                <Table
                  columns={[
                    { key: 'created_at', label: 'Timestamp' },
                    { key: 'no_show_risk', label: 'No-show Probability', align: 'right' as const },
                    { key: 'wait', label: 'Expected Wait', align: 'right' as const },
                    { key: 'risk', label: 'Scheduling Risk', align: 'right' as const },
                  ]}
                >
                  {historyItems.map((prediction) => (
                    <tr key={prediction.id} className="cds-table-row">
                      <td className="px-3.5 py-2.5 font-mono text-xs text-carbon-gray-70">{formatDateTime(prediction.created_at)}</td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-mono font-semibold text-carbon-gray-100">{formatProbability(prediction.no_show_probability)}</span>
                          <Badge tone={prediction.no_show_risk === 'HIGH' ? 'danger' : prediction.no_show_risk === 'MEDIUM' ? 'warning' : 'success'}>
                            {prediction.no_show_risk}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatMinutes(Math.round(prediction.expected_waiting_time))}</td>
                      <td className="px-3.5 py-2.5 text-right">
                        <RiskBadge risk={prediction.scheduling_risk} />
                      </td>
                    </tr>
                  ))}
                </Table>
              </div>
              <div className="flex justify-end">
                <Pagination
                  page={historyPage}
                  total={historyTotal}
                  limit={10}
                  onPageChange={(next) => void loadHistory(next)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ResultCard({
  icon: Icon,
  title,
  value,
  detail,
  percentage,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string
  detail: React.ReactNode
  percentage?: number
}) {
  return (
    <Card className="border-t-4 border-t-primary-500">
      <CardHeader title={title} />
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold tracking-tight font-mono text-carbon-gray-100">{value}</span>
          <div className="p-2 bg-primary-50 text-primary-500">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>
        {percentage !== undefined && (
          <div className="w-full bg-carbon-gray-20 h-2 rounded-none overflow-hidden">
            <div className="bg-primary-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, percentage)}%` }} />
          </div>
        )}
        <div className="text-xs text-carbon-gray-70">{detail}</div>
      </CardContent>
    </Card>
  )
}