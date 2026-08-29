import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { appointmentApi } from '@/services/appointmentApi'
import { patientApi } from '@/services/patientApi'
import type { Clinic, Doctor, Patient } from '@/types'

interface AppointmentModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clinics: Clinic[]
  doctors: Doctor[]
}

export function AppointmentModal({ open, onClose, onSuccess, clinics, doctors }: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const todayStr = new Date().toISOString().slice(0, 16)
  const defaultAppId = `APP-${Math.floor(100000 + Math.random() * 900000)}`

  const [appointmentId, setAppointmentId] = useState(defaultAppId)
  const [patientQuery, setPatientQuery] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientSearching, setPatientSearching] = useState(false)
  const [showPatientResults, setShowPatientResults] = useState(false)
  const patientBoxRef = useRef<HTMLDivElement>(null)
  const [doctorId, setDoctorId] = useState(doctors[0]?.doctor_id || '')
  const [clinicId, setClinicId] = useState(clinics[0]?.clinic_id || '')
  const [appointmentDay, setAppointmentDay] = useState(todayStr)
  const [scheduledDay, setScheduledDay] = useState(todayStr)
  const [smsReceived, setSmsReceived] = useState(0)
  const [consultationDuration, setConsultationDuration] = useState(20)

  useEffect(() => {
    if (open) {
      setPatientQuery('')
      setSelectedPatient(null)
      setPatientResults([])
      setShowPatientResults(false)
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (!patientQuery.trim()) {
      setPatientResults([])
      setPatientSearching(false)
      return
    }
    const timer = setTimeout(async () => {
      setPatientSearching(true)
      try {
        const res = await patientApi.list({ search: patientQuery.trim(), limit: 8 })
        setPatientResults(res.items)
      } catch {
        setPatientResults([])
      } finally {
        setPatientSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [patientQuery])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (patientBoxRef.current && !patientBoxRef.current.contains(e.target as Node)) {
        setShowPatientResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p)
    setPatientQuery(p.patient_id)
    setShowPatientResults(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) {
      setError('Search and select a patient from the list')
      return
    }
    if (!doctorId) {
      setError('Please select a doctor')
      return
    }
    if (!clinicId) {
      setError('Please select a clinic')
      return
    }

    setLoading(true)
    setError('')
    try {
      await appointmentApi.create({
        appointment_id: appointmentId.trim(),
        patient_id: selectedPatient.id,
        doctor_id: doctorId,
        clinic_id: clinicId,
        appointment_day: new Date(appointmentDay).toISOString(),
        scheduled_day: new Date(scheduledDay).toISOString(),
        status: 'Scheduled',
        sms_received: Number(smsReceived),
        queue_length: 0,
        patients_ahead: 0,
        consultation_duration: Number(consultationDuration),
        doctor_load: 0.5,
        room_available: 1,
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to book appointment'
      setError(msg || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Book New Appointment" wide>
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {error && (
          <div className="border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Appointment Specification Code"
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            placeholder="APP-100234"
            required
          />

          <div className="flex flex-col gap-1 relative" ref={patientBoxRef}>
            <label htmlFor="patient-search" className="text-[11px] font-bold uppercase tracking-wider text-carbon-gray-70">
              Patient
            </label>
            <input
              id="patient-search"
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value)
                setSelectedPatient(null)
                setShowPatientResults(true)
              }}
              onFocus={() => setShowPatientResults(true)}
              placeholder="Search name or ID, e.g. P10025"
              autoComplete="off"
              className="h-9 rounded-none border border-carbon-gray-30 bg-surface px-3 text-xs font-medium text-carbon-gray-100 placeholder:text-carbon-gray-50 transition-colors focus:border-primary-500 focus:outline-none"
            />
            {showPatientResults && patientQuery.trim() && (
              <ul className="absolute z-20 top-9 mt-0.5 max-h-56 w-full overflow-auto border border-carbon-gray-30 bg-surface shadow-carbon">
                {patientSearching && (
                  <li className="px-3 py-2 text-[11px] text-carbon-gray-60">Searching...</li>
                )}
                {!patientSearching && patientResults.length === 0 && (
                  <li className="px-3 py-2 text-[11px] text-carbon-gray-60">No patients match</li>
                )}
                {patientResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => selectPatient(p)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-carbon-gray-100 hover:bg-carbon-gray-10"
                    >
                      <span>{p.name}</span>
                      <span className="font-mono text-[11px] text-carbon-gray-60">{p.patient_id}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Select
            label="Assigned Doctor"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            options={doctors.map((d) => ({ value: d.doctor_id, label: `${d.name} (${d.doctor_id})` }))}
          />

          <Select
            label="Target Clinic Facility"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            options={clinics.map((c) => ({ value: c.clinic_id, label: `${c.name} (${c.clinic_id})` }))}
          />

          <Input
            label="Scheduled Booking Date & Time"
            type="datetime-local"
            value={scheduledDay}
            onChange={(e) => setScheduledDay(e.target.value)}
            required
          />

          <Input
            label="Appointment Date & Time"
            type="datetime-local"
            value={appointmentDay}
            onChange={(e) => setAppointmentDay(e.target.value)}
            required
          />

          <Select
            label="SMS Notification Sent?"
            value={String(smsReceived)}
            onChange={(e) => setSmsReceived(Number(e.target.value))}
            options={[
              { value: '1', label: 'Yes (1)' },
              { value: '0', label: 'No (0)' },
            ]}
          />

          <Input
            label="Consultation Duration (Minutes)"
            type="number"
            min={5}
            max={240}
            value={consultationDuration}
            onChange={(e) => setConsultationDuration(Number(e.target.value))}
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-carbon-gray-20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Booking...' : 'Confirm Appointment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}