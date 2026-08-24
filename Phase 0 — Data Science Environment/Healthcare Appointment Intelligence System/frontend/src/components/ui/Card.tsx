import type { ReactNode } from 'react'

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      className={`border border-carbon-gray-20 bg-surface shadow-card ${onClick ? 'cursor-pointer hover:border-carbon-gray-50' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-carbon-gray-20 bg-surface px-4 py-3.5">
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-carbon-gray-100">{title}</div>
        {subtitle && <p className="mt-0.5 text-[11px] text-carbon-gray-70">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}