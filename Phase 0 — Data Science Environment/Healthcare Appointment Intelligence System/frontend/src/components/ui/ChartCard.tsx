import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: ReactNode
  /** Label for the horizontal (X) axis, e.g. "Date" */
  xLabel?: string
  /** Label for the vertical (Y) axis, e.g. "Appointments" */
  yLabel?: string
  /** Section heading for the card text (optional a11y description). */
  description?: string
  children: ReactNode
  className?: string
}

/**
 * Standard enterprise chart container.
 * Renders a titled panel plus a visible X/Y axis caption strip so every
 * chart is interpretable without guesswork.
 */
export function ChartCard({
  title,
  subtitle,
  action,
  xLabel,
  yLabel,
  description,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <Card className={`flex h-full flex-col ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-carbon-gray-20 px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-carbon-gray-100">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-carbon-gray-70">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 p-4">{children}</div>
      {description && <p className="sr-only">{description}</p>}
      {(xLabel || yLabel) && (
        <div className="flex items-center justify-between gap-4 border-t border-carbon-gray-20 bg-carbon-gray-10 px-4 py-2 text-xs text-carbon-gray-60">
          {xLabel && (
            <span className="flex items-center gap-1.5 truncate">
              <span className="font-semibold uppercase tracking-wider">X</span>
              <span className="truncate">{xLabel}</span>
            </span>
          )}
          {yLabel && (
            <span className="flex items-center gap-1.5 truncate">
              {!xLabel && <span />}
              <span className="font-semibold uppercase tracking-wider">Y</span>
              <span className="truncate">{yLabel}</span>
            </span>
          )}
        </div>
      )}
    </Card>
  )
}