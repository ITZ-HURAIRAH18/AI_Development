import { useState, useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Search,
  RefreshCw,
  User,
  Stethoscope,
  Building2,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { analyticsApi } from '@/services/analyticsApi'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { formatMinutes, formatProbability, formatNumber } from '@/utils/format'
import { RISK_COLORS } from '@/utils/risk'

interface RiskDoc {
  id: string
  appointment_id: string | null
  no_show_probability: number
  expected_waiting_time: number
  risk_score: number
  scheduling_risk: string
  risk_factors: string[]
  patient_name?: string
  doctor_name?: string
  clinic_name?: string
  appointment_date?: string
}

import { useOutletContext } from 'react-router-dom'

export function SchedulingRiskPage() {
  const outlet = useOutletContext<{ clinicId?: string }>()
  const clinicId = outlet?.clinicId ?? ''
  const { data, loading, error, reload } = useApi(() => analyticsApi.schedulingRisk({ clinic_id: clinicId }), [clinicId], `scheduling-risk-${clinicId}`)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFactor, setSelectedFactor] = useState<string>('ALL')

  const result = data as { distribution: Array<{ _id: string; count: number }>; high_risk_appointments: RiskDoc[] } | undefined
  const distribution = result?.distribution ?? []
  const highRisk = result?.high_risk_appointments ?? []
  const totalAnalyzed = distribution.reduce((sum, item) => sum + item.count, 0)

  const highCount = distribution.find((item) => item._id === 'HIGH')?.count ?? 0
  const mediumCount = distribution.find((item) => item._id === 'MEDIUM')?.count ?? 0
  const lowCount = distribution.find((item) => item._id === 'LOW')?.count ?? 0

  // Extract all unique risk factors across high-risk appointments
  const allFactors = useMemo(() => {
    const set = new Set<string>()
    highRisk.forEach((item) => {
      ;(item.risk_factors ?? []).forEach((f) => set.add(f))
    })
    return Array.from(set)
  }, [highRisk])

  // Filter high-risk list based on search and selected factor
  const filteredHighRisk = useMemo(() => {
    return highRisk.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        (item.patient_name ?? '').toLowerCase().includes(q) ||
        (item.doctor_name ?? '').toLowerCase().includes(q) ||
        (item.clinic_name ?? '').toLowerCase().includes(q) ||
        (item.risk_factors ?? []).some((f) => f.toLowerCase().includes(q))

      const matchesFactor = selectedFactor === 'ALL' || (item.risk_factors ?? []).includes(selectedFactor)

      return matchesSearch && matchesFactor
    })
  }, [highRisk, searchQuery, selectedFactor])

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingState rows={8} />
      </div>
    )
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Unable to load scheduling risk analytics'} onRetry={reload} />
  }

  const chartData = distribution.map((item) => ({
    name: `${item._id} Risk`,
    value: item.count,
    level: item._id as 'HIGH' | 'MEDIUM' | 'LOW',
  }))

  return (
    <div className="space-y-6 font-sans">
      <PageHeader
        title="Scheduling Risk Intelligence"
        description="High-risk appointment flags, risk factor distribution, and capacity diagnostic tracking."
        actions={
          <button
            onClick={reload}
            className="inline-flex h-8 items-center gap-1.5 border border-carbon-gray-30 bg-surface px-3 text-xs font-semibold uppercase tracking-wider text-carbon-gray-100 hover:bg-carbon-gray-10 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Analytics
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="HIGH SCHEDULING RISK"
          value={formatNumber(highCount)}
          subtitle={`${((highCount / (totalAnalyzed || 1)) * 100).toFixed(1)}% of total predictions`}
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          title="MEDIUM SCHEDULING RISK"
          value={formatNumber(mediumCount)}
          subtitle={`${((mediumCount / (totalAnalyzed || 1)) * 100).toFixed(1)}% of total predictions`}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          title="LOW SCHEDULING RISK"
          value={formatNumber(lowCount)}
          subtitle={`${((lowCount / (totalAnalyzed || 1)) * 100).toFixed(1)}% of total predictions`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="TOTAL PREDICTIONS ANALYZED"
          value={formatNumber(totalAnalyzed)}
          subtitle="Predictions logged in database"
          icon={Activity}
          tone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ChartCard
            title="RISK DISTRIBUTION DIAGNOSTIC"
            subtitle="Overall risk classification breakdown"
          >
            {chartData.length === 0 ? (
              <EmptyState title="No distribution data" description="No risk classifications logged." />
            ) : (
              <div className="relative flex flex-col items-center">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {chartData.map((entry: { name: string; value: number; level: 'HIGH' | 'MEDIUM' | 'LOW' }) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.level] ?? '#8D8D8D'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 0,
                        border: '1px solid #E0E0E0',
                        fontSize: '11px',
                        fontFamily: 'IBM Plex Sans, sans-serif',
                        background: '#FFFFFF',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center pb-6">
                  <span className="text-2xl font-bold font-mono tracking-tight text-carbon-gray-100">{highCount}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-danger">HIGH RISK</span>
                </div>

                <div className="mt-2 flex w-full justify-center gap-4 border-t border-carbon-gray-20 pt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 bg-danger" />
                    <span className="font-semibold text-carbon-gray-100">HIGH ({highCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 bg-amber-500" />
                    <span className="font-semibold text-carbon-gray-100">MED ({mediumCount})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 bg-success" />
                    <span className="font-semibold text-carbon-gray-100">LOW ({lowCount})</span>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-danger" />
                  <span>HIGH-RISK APPOINTMENT QUEUE</span>
                  <Badge tone="danger">{filteredHighRisk.length}</Badge>
                </div>
              }
              subtitle="Appointments flagged with HIGH scheduling risk score requiring operational attention."
            />
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-carbon-gray-50" />
                  <input
                    type="search"
                    placeholder="Search by patient, doctor, clinic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 w-full rounded-none border border-carbon-gray-30 bg-surface pl-8 pr-3 text-xs text-carbon-gray-100 placeholder-carbon-gray-50 focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {allFactors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-carbon-gray-60" />
                    <select
                      value={selectedFactor}
                      onChange={(e) => setSelectedFactor(e.target.value)}
                      className="h-8 rounded-none border border-carbon-gray-30 bg-surface px-2 text-xs font-medium text-carbon-gray-100 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="ALL">All Risk Factors ({allFactors.length})</option>
                      {allFactors.map((factor) => (
                        <option key={factor} value={factor}>
                          {factor}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {filteredHighRisk.length === 0 ? (
                <EmptyState
                  title="No high-risk appointments match criteria"
                  description={
                    searchQuery || selectedFactor !== 'ALL'
                      ? 'Try clearing your search term or factor filter.'
                      : 'No appointments are currently flagged as High Risk.'
                  }
                />
              ) : (
                <Table
                  columns={[
                    { key: 'patient', label: 'Patient Specification' },
                    { key: 'doctor', label: 'Doctor & Clinic' },
                    { key: 'no_show', label: 'No-show Risk', align: 'right' as const },
                    { key: 'wait', label: 'Est. Wait', align: 'right' as const },
                    { key: 'score', label: 'Risk Score', align: 'center' as const },
                    { key: 'factors', label: 'Contributing Risk Factors' },
                  ]}
                >
                  {filteredHighRisk.map((item) => {
                    const isHighProb = item.no_show_probability >= 0.7
                    return (
                      <tr key={item.id} className="cds-table-row">
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-carbon-gray-10 text-carbon-gray-100">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold text-carbon-gray-100">{item.patient_name || 'Unknown Patient'}</p>
                              {item.appointment_date && (
                                <p className="text-[11px] font-mono text-carbon-gray-60">
                                  {new Date(item.appointment_date).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-carbon-gray-100">
                              <Stethoscope className="h-3 w-3 text-primary-500 shrink-0" />
                              <span>{item.doctor_name || 'Unknown Doctor'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-carbon-gray-60">
                              <Building2 className="h-3 w-3 shrink-0" />
                              <span>{item.clinic_name || 'General Clinic'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5 text-right font-mono font-semibold">
                          <span
                            className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[11px] font-mono font-bold ${
                              isHighProb
                                ? 'bg-red-50 text-danger border border-red-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {formatProbability(item.no_show_probability)}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 text-right font-mono text-carbon-gray-100">
                          <div className="inline-flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3 text-carbon-gray-50 shrink-0" />
                            <span>{formatMinutes(item.expected_waiting_time)}</span>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center bg-red-50 px-2 py-0.5 font-mono text-xs font-bold text-danger border border-red-200">
                            <Sparkles className="mr-1 h-3 w-3" />
                            {item.risk_score}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {item.risk_factors && item.risk_factors.length > 0 ? (
                              item.risk_factors.map((factor, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center bg-carbon-gray-10 px-1.5 py-0.5 text-[10px] font-mono text-carbon-gray-70 border border-carbon-gray-20"
                                >
                                  {factor}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-carbon-gray-50">—</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}