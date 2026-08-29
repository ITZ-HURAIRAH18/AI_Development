import type { LucideIcon } from 'lucide-react'

export type MetricTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

interface MetricCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  /** Semantic accent applied to the small indicator only — never the whole card. */
  tone?: MetricTone
}

const toneStyles: Record<MetricTone, { bar: string; dot: string }> = {
  neutral: { bar: 'bg-carbon-gray-50', dot: 'bg-carbon-gray-50' },
  success: { bar: 'bg-success', dot: 'bg-success' },
  warning: { bar: 'bg-warning', dot: 'bg-warning' },
  danger: { bar: 'bg-danger', dot: 'bg-danger' },
  info: { bar: 'bg-primary-500', dot: 'bg-primary-500' },
}

/**
 * Enterprise metric card: white surface, hairline border, small semantic
 * indicator, clear value hierarchy and concise metadata.
 */
export function MetricCard({ title, value, subtitle, icon: Icon, tone = 'neutral' }: MetricCardProps) {
  const accent = toneStyles[tone]
  return (
    <div className="relative overflow-hidden border border-carbon-gray-20 bg-surface">
      <span className={`absolute left-0 top-0 h-1 w-8 ${accent.bar}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3 px-4 pb-4 pt-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-carbon-gray-70">{title}</p>
          <p className="mt-2 text-3xl font-light tracking-tight text-carbon-gray-100">{value}</p>
          {subtitle && <p className="mt-1.5 text-xs text-carbon-gray-60">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="shrink-0 text-carbon-gray-50">
            <span className={`mt-1 inline-block h-2 w-2 ${accent.dot}`} aria-hidden="true" />
            <Icon className="mt-1.5 h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  )
}

/** Backwards-compatible alias so existing callers keep working. */
export function StatCard(props: MetricCardProps) {
  return <MetricCard {...props} />
}