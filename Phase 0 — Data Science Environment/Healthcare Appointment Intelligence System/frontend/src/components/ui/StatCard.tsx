import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const topAccentStyles = {
  neutral: 'border-t-primary-500',
  success: 'border-t-success',
  warning: 'border-t-warning',
  danger: 'border-t-danger',
}

const iconToneStyles = {
  neutral: 'text-primary-500 bg-primary-50',
  success: 'text-success bg-green-50',
  warning: 'text-amber-700 bg-amber-50',
  danger: 'text-danger bg-red-50',
}

export function StatCard({ title, value, subtitle, icon: Icon, tone = 'neutral' }: StatCardProps) {
  return (
    <div className={`border border-carbon-gray-20 bg-surface p-4 border-t-4 ${topAccentStyles[tone]} shadow-card transition-all hover:border-carbon-gray-50`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-carbon-gray-70">{title}</p>
        <div className={`p-1.5 rounded-none ${iconToneStyles[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-carbon-gray-100 font-mono">{value}</p>
      {subtitle && <p className="mt-1 text-[11px] text-carbon-gray-60">{subtitle}</p>}
    </div>
  )
}