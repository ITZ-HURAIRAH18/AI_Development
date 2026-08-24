import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary'
}

const tones = {
  neutral: 'bg-carbon-gray-10 text-carbon-gray-70 border border-carbon-gray-30',
  success: 'bg-green-50 text-success border border-green-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  danger: 'bg-red-50 text-danger border border-red-200',
  primary: 'bg-primary-50 text-primary-600 border border-primary-200',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-none px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  )
}