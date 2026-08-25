import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { appointmentApi } from '@/services/appointmentApi'
import type { Clinic, Doctor } from '@/types'

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
  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState(doctors[0]?.doctor_id || '')
  const [clinicId, setClinicId] = useState(clinics[0]?.clinic_id || '')
  const [appointmentDay, setAppointmentDay] = useState(todayStr)
  const [scheduledDay, setScheduledDay] = useState(todayStr)
  const [smsReceived, setSmsReceived] = useState(0)
  const [consultationDuration, setConsultationDuration] = useState(20)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId.trim()) {
      setError('Patient ID is required')
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
        patient_id: patientId.trim(),
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

          <Input
            label="Patient ID / Record Code"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="e.g. P10025"
            required
          />

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
