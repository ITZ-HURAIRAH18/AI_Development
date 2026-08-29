import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { patientApi } from '@/services/patientApi'
import type { Patient } from '@/types'

interface PatientModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  patient?: Patient | null
}

export function PatientModal({ open, onClose, onSuccess, patient }: PatientModalProps) {
  const isEdit = Boolean(patient)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [age, setAge] = useState(35)
  const [gender, setGender] = useState('F')
  const [neighbourhood, setNeighbourhood] = useState('')

  useEffect(() => {
    if (patient) {
      setName(patient.name || '')
      setAge(patient.age || 35)
      setGender(patient.gender || 'F')
      setNeighbourhood(patient.neighbourhood || '')
    } else {
      setName('')
      setAge(35)
      setGender('F')
      setNeighbourhood('')
    }
  }, [patient, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Patient name is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      if (isEdit && patient?.id) {
        await patientApi.update(patient.id, {
          name: name.trim(),
          age: Number(age),
          gender,
          neighbourhood: neighbourhood.trim(),
        })
      } else {
        await patientApi.create({
          name: name.trim(),
          age: Number(age),
          gender,
          neighbourhood: neighbourhood.trim(),
        })
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Operation failed'
      setError(msg || 'Operation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Patient Specification' : 'Register New Patient'}>
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {error && (
          <div className="border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {!isEdit && (
            <div className="rounded-none border border-carbon-gray-20 bg-carbon-gray-10 px-3 py-2.5 text-xs text-carbon-gray-70">
              <span className="font-semibold text-carbon-gray-100">Patient ID:</span> auto-assigned in sequence by the system on
              registration (e.g., P00001, P00002).
            </div>
          )}

          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maria Silva"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age (Years)"
              type="number"
              min={0}
              max={120}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              required
            />

            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: 'F', label: 'Female (F)' },
                { value: 'M', label: 'Male (M)' },
              ]}
            />
          </div>

          <Input
            label="Neighbourhood / District"
            value={neighbourhood}
            onChange={(e) => setNeighbourhood(e.target.value)}
            placeholder="e.g. JARDIM DA PENHA"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-carbon-gray-20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
