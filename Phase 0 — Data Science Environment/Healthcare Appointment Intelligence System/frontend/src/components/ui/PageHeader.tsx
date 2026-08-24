import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 border-b border-carbon-gray-20 pb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-mono font-bold tracking-widest text-carbon-gray-60 uppercase">
          HEALTHCARE INTELLIGENCE / OPERATIONS
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-carbon-gray-100">{title}</h1>
        {description && <p className="mt-1 text-xs text-carbon-gray-70">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}