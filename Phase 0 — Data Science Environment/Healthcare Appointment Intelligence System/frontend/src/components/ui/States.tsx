import type { ReactNode } from 'react'
import { AlertTriangle, FileQuestion, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/** Keep a bounded, human-readable surface for unexpected API messages. */
export function sanitizeErrorMessage(message?: string): string {
  if (!message) return 'We could not retrieve the requested information.'
  const trimmed = message.trim()
  const cleaned = trimmed
    .replace(/\bAxiosError\b/gi, 'Network request failed')
    .replace(/^Error:\s*/i, '')
    .replace(/\b(?:Request failed with status code\s+\d+)\b/gi, 'The server returned an unexpected status.')
  if (cleaned.length > 220) return `${cleaned.slice(0, 220)}…`
  return cleaned
}

/** Professional skeleton marker used while an API request is in flight. */
export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-label="Loading" role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton h-10 border border-carbon-gray-20" />
      ))}
    </div>
  )
}

/** Empty state with optional recovery action. */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-carbon-gray-30 bg-surface px-4 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center bg-carbon-gray-10 text-carbon-gray-50">
        {icon ?? <FileQuestion className="h-5 w-5" aria-hidden="true" />}
      </div>
      <p className="text-sm font-medium text-carbon-gray-100">{title}</p>
      {description && <p className="max-w-md text-xs leading-relaxed text-carbon-gray-70">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/** Professional error state with human-readable copy and a retry action. */
export function ErrorState({
  message,
  title = 'Unable to load data',
  onRetry,
}: {
  message?: string
  title?: string
  onRetry?: () => void
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 border border-carbon-gray-20 border-l-4 border-l-danger bg-surface px-4 py-10 text-center"
      role="alert"
    >
      <div className="flex h-10 w-10 items-center justify-center bg-red-50 text-danger">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-carbon-gray-100">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-carbon-gray-70">
          {sanitizeErrorMessage(message)}
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  )
}