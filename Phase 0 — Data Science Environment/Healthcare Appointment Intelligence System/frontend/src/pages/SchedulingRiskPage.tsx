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

export function SchedulingRiskPage() {
  const { data, loading, error, reload } = useApi(() => analyticsApi.schedulingRisk({}), [], 'scheduling-risk')
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

  const pieData = distribution.map((item) => ({
    name: `${item._id} Risk`,
    value: item.count,
    level: item._id as 'HIGH' | 'MEDIUM' | 'LOW',
  }))

  return (
    <div className="space-y-6">
      {/* Header with Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Scheduling Risk Intelligence"
          description="Real-time ML risk predictions and high-priority appointment flag monitoring."
        />
        <button
          onClick={reload}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-charcoal shadow-sm transition-all hover:bg-gray-50 hover:text-primary-700 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="High Risk Appointments"
          value={formatNumber(highCount)}
          subtitle={`${totalAnalyzed ? ((highCount / totalAnalyzed) * 100).toFixed(1) : 0}% of total predictions`}
          icon={ShieldAlert}
          tone="danger"
        />
        <StatCard
          title="Medium Risk"
          value={formatNumber(mediumCount)}
          subtitle={`${totalAnalyzed ? ((mediumCount / totalAnalyzed) * 100).toFixed(1) : 0}% of total predictions`}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          title="Low Risk"
          value={formatNumber(lowCount)}
          subtitle={`${totalAnalyzed ? ((lowCount / totalAnalyzed) * 100).toFixed(1) : 0}% of total predictions`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          title="Total Predictions"
          value={formatNumber(totalAnalyzed)}
          subtitle="Analyzed ML models"
          icon={Activity}
          tone="neutral"
        />
      </div>

      {/* Main Grid: Distribution Chart & High Risk Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Donut Breakdown */}
        <div className="lg:col-span-4">
          <ChartCard
            title="Risk Level Distribution"
            subtitle={`${formatNumber(totalAnalyzed)} total predictions evaluated`}
          >
            {pieData.length === 0 ? (
              <EmptyState title="No risk data available" description="Run predictions to populate the risk breakdown." />
            ) : (
              <div className="space-y-6">
                <div className="relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={RISK_COLORS[entry.level] ?? '#64748B'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                          fontSize: 12,
                          background: '#FFFFFF',
                          fontWeight: 500,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-charcoal">{highCount}</span>
                    <span className="text-xs font-medium text-danger uppercase tracking-wider">High Risk</span>
                  </div>
                </div>

                {/* Styled Legend & Progress Items */}
                <div className="space-y-3 pt-2">
                  {[
                    { level: 'HIGH', count: highCount, color: RISK_COLORS.HIGH, label: 'High Risk' },
                    { level: 'MEDIUM', count: mediumCount, color: RISK_COLORS.MEDIUM, label: 'Medium Risk' },
                    { level: 'LOW', count: lowCount, color: RISK_COLORS.LOW, label: 'Low Risk' },
                  ].map((item) => {
                    const pct = totalAnalyzed > 0 ? ((item.count / totalAnalyzed) * 100).toFixed(1) : '0'
                    return (
                      <div key={item.level} className="space-y-1.5 rounded-lg border border-border/50 bg-gray-50/50 p-2.5">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="flex items-center gap-2 text-charcoal">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                              aria-hidden="true"
                            />
                            {item.label}
                          </span>
                          <span className="font-semibold text-charcoal">
                            {formatNumber(item.count)}{' '}
                            <span className="font-normal text-charcoal-muted">({pct}%)</span>
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Right Column: High Risk Appointments Table & Filtering */}
        <div className="lg:col-span-8">
          <Card className="flex h-full flex-col shadow-card">
            <CardHeader
              title={
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-danger" />
                  <span>High-Risk Appointments</span>
                  <Badge tone="danger">{filteredHighRisk.length}</Badge>
                </div>
              }
              subtitle="Appointments flagged with HIGH scheduling risk requiring operational review"
            />
            <CardContent className="flex-1 space-y-4">
              {/* Controls Header: Search & Factor Filter */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient, doctor, clinic, or factor..."
                    className="w-full rounded-lg border border-border bg-surface pl-9 pr-4 py-2 text-sm text-charcoal placeholder-charcoal-muted transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Risk Factor Filter Dropdown */}
                {allFactors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-charcoal-muted" />
                    <select
                      value={selectedFactor}
                      onChange={(e) => setSelectedFactor(e.target.value)}
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-charcoal transition-colors focus:border-primary-500 focus:outline-none"
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

              {/* Table Render */}
              {filteredHighRisk.length === 0 ? (
                <EmptyState
                  title="No high-risk appointments match filter"
                  description={searchQuery || selectedFactor !== 'ALL' ? 'Try adjusting your search criteria or factor filter.' : 'No appointments are currently flagged as high risk.'}
                />
              ) : (
                <Table
                  columns={[
                    { key: 'patient', label: 'Patient' },
                    { key: 'doctor', label: 'Doctor & Clinic' },
                    { key: 'no_show', label: 'No-show Risk', align: 'right' as const },
                    { key: 'wait', label: 'Est. Wait', align: 'right' as const },
                    { key: 'score', label: 'Risk Score', align: 'center' as const },
                    { key: 'factors', label: 'Risk Factors' },
                  ]}
                >
                  {filteredHighRisk.map((item) => {
                    const isHighProb = item.no_show_probability >= 0.7
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/70">
                        {/* Patient Cell */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                              <User className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-charcoal">{item.patient_name || 'Unknown Patient'}</p>
                              {item.appointment_date && (
                                <p className="text-xs text-charcoal-muted">
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

                        {/* Doctor & Clinic Cell */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal">
                              <Stethoscope className="h-3.5 w-3.5 text-primary-600" />
                              <span>{item.doctor_name || 'Unknown Doctor'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-charcoal-muted">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>{item.clinic_name || 'General Clinic'}</span>
                            </div>
                          </div>
                        </td>

                        {/* No-show Probability */}
                        <td className="px-4 py-3.5 text-right font-medium">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ${
                              isHighProb
                                ? 'bg-danger/10 text-danger border border-danger/20'
                                : 'bg-warning/10 text-warning border border-warning/20'
                            }`}
                          >
                            {formatProbability(item.no_show_probability)}
                          </span>
                        </td>

                        {/* Expected Wait Time */}
                        <td className="px-4 py-3.5 text-right font-medium text-charcoal">
                          <div className="inline-flex items-center gap-1 text-xs">
                            <Clock className="h-3.5 w-3.5 text-charcoal-muted" />
                            <span>{formatMinutes(item.expected_waiting_time)}</span>
                          </div>
                        </td>

                        {/* Risk Score */}
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-danger/15 px-3 py-1 text-xs font-bold text-danger border border-danger/25">
                            <Sparkles className="mr-1 h-3 w-3" />
                            {item.risk_score}
                          </span>
                        </td>

                        {/* Risk Factors Chips */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {item.risk_factors && item.risk_factors.length > 0 ? (
                              item.risk_factors.map((factor, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-charcoal hover:bg-gray-200 transition-colors"
                                >
                                  {factor}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-charcoal-muted">—</span>
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