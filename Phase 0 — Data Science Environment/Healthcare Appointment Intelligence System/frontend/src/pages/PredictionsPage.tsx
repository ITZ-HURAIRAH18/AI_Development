import { useState } from 'react'
import type { FormEvent } from 'react'
import { Activity, Clock, ShieldAlert, TimerReset } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getErrorMessage } from '@/services/api'
import { predictionApi } from '@/services/predictionApi'
import type { FullPredictionResult } from '@/types'

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
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const riskTone = result?.scheduling_risk === 'HIGH' ? 'danger' : result?.scheduling_risk === 'MEDIUM' ? 'warning' : 'success'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointment Risk Prediction"
        description="Enter appointment and operational information to generate a prediction."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Patient Information" subtitle="Features used by the no-show model" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Age" type="number" min={0} max={120} value={noShow.age} onChange={(event) => updateNoShow('age', event.target.value)} required />
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Select label="Scholarship" value={noShow.scholarship} onChange={(event) => updateNoShow('scholarship', event.target.value)} options={toggleOptions} />
              <Select label="Hypertension" value={noShow.hypertension} onChange={(event) => updateNoShow('hypertension', event.target.value)} options={toggleOptions} />
              <Select label="Diabetes" value={noShow.diabetes} onChange={(event) => updateNoShow('diabetes', event.target.value)} options={toggleOptions} />
              <Select label="Alcoholism" value={noShow.alcoholism} onChange={(event) => updateNoShow('alcoholism', event.target.value)} options={toggleOptions} />
              <Select label="Handicap" value={noShow.handicap} onChange={(event) => updateNoShow('handicap', event.target.value)} options={[{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }]} />
              <Select label="SMS received" value={noShow.sms_received} onChange={(event) => updateNoShow('sms_received', event.target.value)} options={toggleOptions} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Scheduled date" type="datetime-local" value={noShow.scheduled_day} onChange={(event) => updateNoShow('scheduled_day', event.target.value)} required />
              <Input label="Appointment date" type="datetime-local" value={noShow.appointment_day} onChange={(event) => updateNoShow('appointment_day', event.target.value)} required />
            </div>
            <button type="button" onClick={setSuggestedDates} className="text-sm text-primary-700 hover:text-primary-800">
              Use suggested dates
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Operational Information" subtitle="Used to estimate waiting time and scheduling risk" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Queue length" type="number" min={0} value={operational.queue_length} onChange={(event) => updateOperational('queue_length', event.target.value)} required />
              <Input label="Patients ahead" type="number" min={0} value={operational.patients_ahead} onChange={(event) => updateOperational('patients_ahead', event.target.value)} required />
              <Input label="Consultation duration (min)" type="number" min={1} max={240} value={operational.consultation_duration} onChange={(event) => updateOperational('consultation_duration', event.target.value)} required />
              <Input label="Doctor load (0.0–1.0)" type="number" step="0.05" min={0} max={1} value={operational.doctor_load} onChange={(event) => updateOperational('doctor_load', event.target.value)} required />
            </div>
            <Select label="Room availability" value={operational.room_available} onChange={(event) => updateOperational('room_available', event.target.value)} options={toggleOptions} />
            <div className="!mt-6">
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {loading ? 'Analyzing appointment...' : 'Run Prediction'}
                {!loading && <Activity className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && <ErrorNotice message={error} />}
      </form>

      {result && !loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ResultCard
            icon={Activity}
            title="No-show Probability"
            value={`${Math.round(result.no_show_probability * 100)}%`}
            detail={<>RISK {result.no_show_risk}</>}
          />
          <ResultCard icon={Clock} title="Expected Waiting Time" value={`${Math.round(result.expected_waiting_time)} min`} detail={<>Estimated wait</>} />
          <Card>
            <CardHeader title="Scheduling Risk" />
            <CardContent>
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-8 w-8 text-primary-700" aria-hidden="true" />
                <div>
                  <p className="text-2xl font-semibold text-charcoal">{result.scheduling_risk}</p>
                  <p className="text-sm text-charcoal-muted">Risk score {result.risk_score}</p>
                </div>
                <Badge tone={riskTone as 'danger' | 'warning' | 'success'}>{result.scheduling_risk}</Badge>
              </div>
              {result.risk_factors.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {result.risk_factors.map((factor) => (
                    <li key={factor} className="flex items-center gap-2 text-sm text-charcoal-muted">
                      <TimerReset className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                      {factor}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ResultCard({ icon: Icon, title, value, detail }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string; detail: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div className="flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary-700" aria-hidden="true" />
          <span className="text-3xl font-semibold tracking-tight text-charcoal">{value}</span>
        </div>
        <div className="mt-2 text-sm text-charcoal-muted">{detail}</div>
      </CardContent>
    </Card>
  )
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger lg:col-span-2" role="alert">
      {message}
    </div>
  )
}