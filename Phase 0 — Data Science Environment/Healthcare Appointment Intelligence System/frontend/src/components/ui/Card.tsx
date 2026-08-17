import type { ReactNode } from 'react'

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-card ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-charcoal-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>
}