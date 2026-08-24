import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'

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
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const columns = useMemo(
    () => [
      { key: 'patient_id', label: 'Patient ID' },
      { key: 'name', label: 'Full Name' },
      { key: 'age', label: 'Age', align: 'right' as const },
      { key: 'gender', label: 'Gender' },
      { key: 'appointments', label: 'Total Appointments', align: 'right' as const },
      { key: 'no_show_rate', label: 'Historical No-show Rate', align: 'right' as const },
      { key: 'last_appointment', label: 'Last Active Appointment' },
      { key: 'risk_status', label: 'Patient Risk Profile' },
    ],
    [],
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Patient Intelligence Directory" description="Enterprise records for historical patient attendance and risk profile classification." />
        <LoadingState rows={10} />
      </div>
    )
  }

  return (
    <div className="font-sans space-y-4">
      <PageHeader title="Patient Intelligence Directory" description="Enterprise records for historical patient attendance and risk profile classification." />
      <FilterBar search={search} onSearchChange={(value) => updateParam('search', value)} />

      {error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="No patient records found" description="Adjust your filter terms or patient ID query." />
      ) : (
        <div className="border border-carbon-gray-20 bg-surface shadow-card">
          <Table columns={columns}>
            {items.map((patient) => (
              <tr key={patient.id} className="cds-table-row cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                <td className="px-3.5 py-2.5 font-mono font-semibold text-primary-500">{patient.patient_id}</td>
                <td className="px-3.5 py-2.5 font-semibold text-carbon-gray-100">{patient.name}</td>
                <td className="px-3.5 py-2.5 text-right text-carbon-gray-100 font-mono">{patient.age}</td>
                <td className="px-3.5 py-2.5 text-carbon-gray-70 font-mono">{patient.gender}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{formatNumber(patient.appointments)}</td>
                <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-carbon-gray-100">{formatPercent(patient.no_show_rate)}</td>
                <td className="px-3.5 py-2.5 text-carbon-gray-70 font-mono">{formatDate(patient.last_appointment)}</td>
                <td className="px-3.5 py-2.5">
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