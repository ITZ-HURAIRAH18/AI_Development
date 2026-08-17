import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { useDebounce } from '@/hooks/useDebounce'
import { patientApi } from '@/services/patientApi'
import { formatDate, formatNumber, formatPercent } from '@/utils/format'
import { getRiskStyle } from '@/utils/risk'
import type { Patient } from '@/types'

export function PatientsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''
  const debouncedSearch = useDebounce(search, 300)
  const page = Number(searchParams.get('page') ?? '1')

  const [items, setItems] = useState<Patient[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    patientApi
      .list({ search: debouncedSearch, page, limit: 20 })
      .then((result) => {
        if (!active) return
        setItems(result.items)
        setTotal(result.total)
      })
      .catch(() => setError('Unable to load patients.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [debouncedSearch, page])

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const columns = useMemo(
    () => [
      { key: 'patient_id', label: 'Patient ID' },
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age', align: 'right' as const },
      { key: 'gender', label: 'Gender' },
      { key: 'appointments', label: 'Appointments', align: 'right' as const },
      { key: 'no_show_rate', label: 'No-show Rate', align: 'right' as const },
      { key: 'last_appointment', label: 'Last Appointment' },
      { key: 'risk_status', label: 'Risk Status' },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Patients" description="View patient history and risk status." />
        <LoadingState rows={10} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Patients" description="View patient history and risk status." />
      <FilterBar search={search} onSearchChange={(value) => updateParam('search', value)} />

      {error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No patients found" description="Adjust your search to find patients." />
      ) : (
        <div className="rounded-lg border border-border bg-surface shadow-card">
          <Table columns={columns}>
            {items.map((patient) => (
              <tr key={patient.id} className="cursor-pointer transition-colors hover:bg-gray-50" onClick={() => navigate(`/patients/${patient.id}`)}>
                <td className="px-4 py-3 font-medium text-primary-700">{patient.patient_id}</td>
                <td className="px-4 py-3 text-charcoal">{patient.name}</td>
                <td className="px-4 py-3 text-right text-charcoal">{patient.age}</td>
                <td className="px-4 py-3 text-charcoal">{patient.gender}</td>
                <td className="px-4 py-3 text-right text-charcoal">{formatNumber(patient.appointments)}</td>
                <td className="px-4 py-3 text-right text-charcoal">{formatPercent(patient.no_show_rate)}</td>
                <td className="px-4 py-3 text-charcoal">{formatDate(patient.last_appointment)}</td>
                <td className="px-4 py-3">
                  <Badge tone={getRiskStyle(patient.risk_status ?? 'LOW').dot === 'bg-danger' ? 'danger' : getRiskStyle(patient.risk_status ?? 'LOW').dot === 'bg-warning' ? 'warning' : 'success'}>
                    {getRiskStyle(patient.risk_status ?? 'LOW').label}
                  </Badge>
                </td>
              </tr>
            ))}
          </Table>
          <Pagination page={page} total={total} limit={20} onPageChange={(nextPage) => updateParam('page', String(nextPage))} />
        </div>
      )}
    </div>
  )
}