import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  /** Breadcrumb / section label shown above the title. */
  breadcrumb?: string
}

export function PageHeader({ title, description, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-carbon-gray-20 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-normal text-carbon-gray-60">
          {breadcrumb ?? 'Operations'}
        </p>
        <h1 className="mt-2 text-2xl font-normal tracking-tight text-carbon-gray-100 sm:text-[28px]">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-carbon-gray-70">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  )
}