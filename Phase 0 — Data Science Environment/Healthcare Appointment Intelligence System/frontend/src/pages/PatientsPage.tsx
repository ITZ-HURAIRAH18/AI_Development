import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Table } from '@/components/ui/Table'
import { RiskBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { PatientModal } from '@/components/modals/PatientModal'
import { useDebounce } from '@/hooks/useDebounce'
import { patientApi } from '@/services/patientApi'
import { formatDate, formatNumber, formatPercent } from '@/utils/format'
import type { Patient } from '@/types'

export function PatientsPage() {
  const navigate = useNavigate()
  const outlet = useOutletContext<{ clinicId?: string }>()
  const clinicId = outlet?.clinicId ?? ''
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebounce(search, 300)
  const page = Number(searchParams.get('page') ?? '1')

  const [items, setItems] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  const loadPatients = useCallback(() => {
    setLoading(true)
    setError('')
    patientApi
      .list({ search: debouncedSearch, clinic_id: clinicId, page, limit: 20 })
      .then((result) => {
        setItems(result.items)
        setTotal(result.total)
      })
      .catch(() => setError('Unable to load patient directory.'))
      .finally(() => setLoading(false))
  }, [debouncedSearch, clinicId, page])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const handleDelete = async (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete patient ${patient.name} (${patient.patient_id})?`)) return
    try {
      await patientApi.delete(patient.id)
      loadPatients()
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to delete patient')
    }
  }

  const handleEdit = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation()
    setEditingPatient(patient)
    setIsModalOpen(true)
  }

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )



  const headerActions = (
    <Button
      variant="primary"
      size="sm"
      onClick={() => {
        setEditingPatient(null)
        setIsModalOpen(true)
      }}
    >
      <Plus className="h-4 w-4 mr-1 shrink-0" />
      Register Patient
    </Button>
  )

  return (
    <div className="space-y-4 font-sans">
      <PageHeader
        title="Patient Intelligence Directory"
        description="Registered patient specifications, historical no-show profiles, and appointment records."
        breadcrumb="Patient Intelligence / Patient Records"
        actions={headerActions}
      />

      <FilterBar
        search={search}
        onSearchChange={(val) => updateParam('search', val)}
        clearable
        onClear={() => setSearchParams(new URLSearchParams())}
      />

      {loading ? (
        <TableSkeleton rows={10} columns={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadPatients} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No patient records found"
          description="There are no patient records matching the current search or clinic filter."
          action={<Button variant="outline" size="sm" onClick={() => setSearchParams(new URLSearchParams())}>Clear filters</Button>}
        />
      ) : (
        <div className="border border-carbon-gray-20 bg-surface shadow-card">
          <Table
            columns={[
              { key: 'patient_id', label: 'Patient Specification' },
              { key: 'gender', label: 'Gender / Age' },
              { key: 'neighbourhood', label: 'Neighbourhood' },
              { key: 'appointments', label: 'Total Visits', align: 'right' as const },
              { key: 'no_show_rate', label: 'No-show Rate', align: 'right' as const },
              { key: 'risk_level', label: 'Risk Rating', align: 'center' as const },
              { key: 'last_visit', label: 'Last Visit Date', align: 'right' as const },
              { key: 'actions', label: 'Actions', align: 'right' as const },
            ]}
          >
            {items.map((patient) => {
              return (
                <tr key={patient.id} className="cds-table-row cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                  <td className="px-3.5 py-2.5">
                    <div>
                      <p className="font-semibold text-carbon-gray-100">{patient.name}</p>
                      <p className="text-[11px] font-mono text-carbon-gray-60">{patient.patient_id}</p>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-carbon-gray-70">{patient.gender} · {patient.age} yrs</td>
                  <td className="px-3.5 py-2.5 text-carbon-gray-70">{patient.neighbourhood}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{formatNumber(patient.appointments)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatPercent(patient.no_show_rate)}</td>
                  <td className="px-3.5 py-2.5 text-center">
                    <RiskBadge risk={patient.risk_status ?? 'LOW'} />
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-70">{formatDate(patient.last_appointment)}</td>
                  <td className="px-3.5 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handleEdit(e, patient)}
                        className="rounded p-1 text-carbon-gray-60 hover:bg-carbon-gray-10 hover:text-carbon-gray-100 transition-colors"
                        title="Edit Patient"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, patient)}
                        className="rounded p-1 text-danger/80 hover:bg-danger/10 hover:text-danger transition-colors"
                        title="Delete Patient"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </Table>
          <Pagination page={page} total={total} limit={20} onPageChange={(p) => updateParam('page', String(p))} />
        </div>
      )}

      <PatientModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPatients}
        patient={editingPatient}
      />
    </div>
  )
}