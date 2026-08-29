import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary'
  /** Render a small semantic dot so meaning is not conveyed by color alone. */
  dot?: boolean
}

const tones = {
  neutral: 'bg-carbon-gray-10 text-carbon-gray-70 border border-carbon-gray-30',
  success: 'bg-green-50 text-success border border-green-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-red-50 text-danger border border-red-200',
  primary: 'bg-primary-50 text-primary-600 border border-primary-200',
}

const dots = {
  neutral: 'bg-carbon-gray-50',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  primary: 'bg-primary-500',
}

export function Badge({ children, tone = 'neutral', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider ${tones[tone]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 ${dots[tone]}`} aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Semantic risk badge: dot + label so HIGH/MEDIUM/LOW is never color-only. */
export function RiskBadge({ risk }: { risk?: string }) {
  if (!risk) return <span className="font-mono text-xs text-carbon-gray-50">—</span>
  const tone = risk === 'HIGH' ? 'danger' : risk === 'MEDIUM' ? 'warning' : 'success'
  return (
    <Badge tone={tone} dot>
      {risk}
    </Badge>
  )
}