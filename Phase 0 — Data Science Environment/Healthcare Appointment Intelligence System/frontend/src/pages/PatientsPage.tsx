import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
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

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    patientApi
      .list({ search: debouncedSearch, clinic_id: clinicId, page, limit: 20 })
      .then((result) => {
        if (!active) return
        setItems(result.items)
        setTotal(result.total)
      })
      .catch(() => setError('Unable to load patient directory.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [debouncedSearch, clinicId, page])

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

  const pagination = useMemo(
    () => ({
      page,
      limit: 20,
      total,
      totalPages: Math.ceil(total / 20) || 1,
    }),
    [page, total],
  )

  return (
    <div className="space-y-4 font-sans">
      <PageHeader title="Patient Intelligence Directory" description="Registered patient specifications, historical no-show profiles, and appointment records." />

      <FilterBar
        search={search}
        onSearchChange={(val) => updateParam('search', val)}
        placeholder="Search patient by name, ID, neighbourhood..."
        clearable
        onClear={() => setSearchParams(new URLSearchParams())}
      />

      {loading ? (
        <LoadingState rows={10} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => updateParam('page', String(page))} />
      ) : items.length === 0 ? (
        <EmptyState title="No patient records found" description="Try adjusting your search terms or active clinic filter." />
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
            ]}
          >
            {items.map((patient) => {
              const riskStyle = getRiskStyle(patient.risk_level ?? 'LOW')
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
                  <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{formatNumber(patient.appointments_count)}</td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">{formatPercent(patient.no_show_rate)}</td>
                  <td className="px-3.5 py-2.5 text-center">
                    <Badge tone={riskStyle.tone}>{patient.risk_level ?? 'LOW'}</Badge>
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-70">{formatDate(patient.last_appointment_date)}</td>
                </tr>
              )
            })}
          </Table>
          <div className="p-3 border-t border-carbon-gray-20 bg-carbon-gray-10">
            <Pagination pagination={pagination} onPageChange={(p) => updateParam('page', String(p))} />
          </div>
        </div>
      )}
    </div>
  )
}