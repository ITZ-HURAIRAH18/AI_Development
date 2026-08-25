import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { clinicApi } from '@/services/clinicApi'

interface ClinicModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClinicModal({ open, onClose, onSuccess }: ClinicModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [clinicId, setClinicId] = useState(`C0${Math.floor(6 + Math.random() * 4)}`)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Clinic name is required')
      return
    }

    setLoading(true)
    setError('')
    try {
      await clinicApi.create({
        clinic_id: clinicId.trim(),
        name: name.trim(),
        location: location.trim(),
        doctor_ids: [],
      })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to add clinic'
      setError(msg || 'Failed to add clinic')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add New Clinic Facility">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {error && (
          <div className="border border-danger/30 bg-danger/10 p-3 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <Input
            label="Clinic ID Code"
            value={clinicId}
            onChange={(e) => setClinicId(e.target.value)}
            placeholder="e.g. C06"
            required
          />

          <Input
            label="Facility Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Metro Specialty Care Center"
            required
          />

          <Input
            label="Location / District Address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. SANTA LUCIA, DISTRICT 4"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-carbon-gray-20">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Register Facility'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
