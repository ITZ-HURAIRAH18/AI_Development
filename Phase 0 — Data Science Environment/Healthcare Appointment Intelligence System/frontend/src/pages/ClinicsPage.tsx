import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { clinicApi } from '@/services/clinicApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { Card } from '@/components/ui/Card'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { ClinicModal } from '@/components/modals/ClinicModal'
import { formatMinutes, formatPercent } from '@/utils/format'

export function ClinicsPage() {
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data, loading, error, reload } = useApi(() => clinicApi.list(), [])

  const headerActions = (
    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
      <Plus className="h-4 w-4 mr-1 shrink-0" />
      Add Clinic
    </Button>
  )

  if (loading) {
    return (
      <div className="space-y-4 font-sans">
        <PageHeader title="Clinics Directory & Capacity" breadcrumb="Operations / Clinics" description="Operational overview, active doctors, and average waiting time per facility." actions={headerActions} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }
  if (error || !data) {
    return (
      <div className="space-y-4 font-sans">
        <PageHeader title="Clinics Directory & Capacity" breadcrumb="Operations / Clinics" description="Operational overview, active doctors, and average waiting time per facility." actions={headerActions} />
        <ErrorState message={error ?? 'Unable to load clinics directory'} title="Unable to load clinics directory" onRetry={reload} />
      </div>
    )
  }

  return (
    <div className="font-sans space-y-4">
      <PageHeader title="Clinics Directory & Capacity" breadcrumb="Operations / Clinics" description="Operational overview, active doctors, and average waiting time per facility." actions={headerActions} />
      {data.length === 0 ? (
        <EmptyState title="No clinics directory records" description="Import clinic configuration records to populate capacity analytics." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((clinic) => {
            const riskDistribution = clinic.risk_distribution
            const highShare = riskDistribution && (riskDistribution.LOW + riskDistribution.MEDIUM + riskDistribution.HIGH) > 0
              ? (riskDistribution.HIGH / (riskDistribution.LOW + riskDistribution.MEDIUM + riskDistribution.HIGH)) * 100
              : null
            return (
              <Card key={clinic.id} className="cursor-pointer p-4 transition-all hover:border-carbon-gray-50 border-t-4 border-t-primary-500 shadow-card" onClick={() => navigate(`/clinics/${clinic.id}`)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center bg-carbon-gray-10 text-primary-500">
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight text-carbon-gray-100">{clinic.name}</p>
                      <p className="text-[11px] font-mono text-carbon-gray-60">{clinic.clinic_id} · {clinic.location}</p>
                    </div>
                  </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-carbon-gray-20 pt-3 text-xs">
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">Active Doctors</dt>
                    <dd className="mt-0.5 font-mono text-sm font-semibold text-carbon-gray-100">{typeof clinic.doctors === 'number' ? clinic.doctors : (clinic.doctors ?? []).length}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">Appointments</dt>
                    <dd className="mt-0.5 font-mono text-sm font-semibold text-carbon-gray-100">{clinic.appointments ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">Capacity Utilization</dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-primary-500">{formatPercent(clinic.utilization)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">Avg Waiting Time</dt>
                    <dd className="mt-0.5 font-mono text-sm font-semibold text-carbon-gray-100">{formatMinutes(clinic.average_waiting_time)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">No-show Rate</dt>
                    <dd className="mt-0.5 font-mono text-sm font-semibold text-carbon-gray-100">{formatPercent(clinic.no_show_rate)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">High-risk Share</dt>
                    <dd className={`mt-0.5 font-mono text-sm font-semibold ${highShare !== null && highShare >= 20 ? 'text-danger' : 'text-carbon-gray-100'}`}>
                      {highShare !== null ? `${Math.round(highShare)}%` : '—'}
                    </dd>
                  </div>
                </dl>
              </Card>
            )
          })}
        </div>
      )}

      <ClinicModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={reload}
      />
    </div>
  )
}