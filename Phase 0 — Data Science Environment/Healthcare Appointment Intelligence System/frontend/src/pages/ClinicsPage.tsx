import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { Card } from '@/components/ui/Card'
import { formatMinutes, formatPercent } from '@/utils/format'

export function ClinicsPage() {
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi(() => clinicApi.list(), [])

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Clinics" description="Operational overview of each clinic." />
        <LoadingState rows={8} />
      </div>
    )
  }
  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load clinics'} onRetry={reload} />
  }

  return (
    <div>
      <PageHeader title="Clinics" description="Operational overview of each clinic." />
      {data.length === 0 ? (
        <EmptyState title="No clinics" description="Import clinic data to see clinic statistics." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((clinic) => (
            <Card key={clinic.id} className="cursor-pointer p-5 transition-shadow hover:shadow-md" onClick={() => navigate(`/clinics/${clinic.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">{clinic.name}</p>
                    <p className="text-xs text-charcoal-muted">{clinic.clinic_id} · {clinic.location}</p>
                  </div>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-charcoal-muted">Doctors</dt>
                  <dd className="font-medium text-charcoal">{typeof clinic.doctors === 'number' ? clinic.doctors : (clinic.doctors ?? []).length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-charcoal-muted">Appointments</dt>
                  <dd className="font-medium text-charcoal">{clinic.appointments ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-xs text-charcoal-muted">Utilization</dt>
                  <dd className="font-medium text-charcoal">{formatPercent(clinic.utilization)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-charcoal-muted">Avg waiting</dt>
                  <dd className="font-medium text-charcoal">{formatMinutes(clinic.average_waiting_time)}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}