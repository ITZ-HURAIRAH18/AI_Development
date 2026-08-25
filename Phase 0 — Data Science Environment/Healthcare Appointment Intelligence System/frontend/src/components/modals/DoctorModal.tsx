import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { doctorApi } from '@/services/doctorApi'
import type { Clinic } from '@/types'

interface DoctorModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  clinics: Clinic[]
}

export function DoctorModal({ open, onClose, onSuccess, clinics }: DoctorModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [doctorId, setDoctorId] = useState(`DOC-${Math.floor(10 + Math.random() * 90)}`)
  const [name, setName] = useState('')
  const [specialization, setSpecialization] = useState('General Practice')
  const [clinicId, setClinicId] = useState(clinics[0]?.clinic_id || 'C01')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Doctor name is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      await doctorApi.create({
        doctor_id: doctorId.trim(),
        name: name.trim(),
        specialization: specialization.trim(),
        clinic_id: clinicId,
        active: true,
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to add doctor'
      setError(msg || 'Failed to add doctor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Doctor / Provider">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {error && (
          <div className="border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Input
            label="Doctor ID Code"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            placeholder="e.g. DOC-012"
            required
          />

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Arthur Pendelton"
            required
          />

          <Input
            label="Medical Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            placeholder="e.g. Cardiology, General Practice"
            required
          />

          <Select
            label="Primary Assigned Clinic"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            options={clinics.map((c) => ({ value: c.clinic_id, label: `${c.name} (${c.clinic_id})` }))}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-carbon-gray-20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Register Doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
