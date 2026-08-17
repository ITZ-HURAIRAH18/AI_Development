import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary'
}

const tones = {
  neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  primary: 'bg-primary-50 text-primary-800 border border-primary-200',
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}