import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const toneStyles = {
  neutral: 'bg-primary-50 text-primary-700',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
}

export function StatCard({ title, value, subtitle, icon: Icon, tone = 'neutral' }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-charcoal-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-charcoal-muted">{subtitle}</p>}
        </div>
        <div className={`rounded-md p-2 ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}