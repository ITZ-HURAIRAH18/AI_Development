import type { ReactNode } from 'react'

export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading" role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton h-12 rounded-md" />
      ))}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <p className="text-sm font-medium text-charcoal">{title}</p>
      {description && <p className="max-w-md text-sm text-charcoal-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-danger/20 bg-danger/5 py-10 text-center">
      <p className="text-sm font-medium text-danger">Unable to load data</p>
      <p className="max-w-md text-sm text-charcoal-muted">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-md border border-border bg-white px-3 py-1.5 text-sm text-charcoal hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          Try again
        </button>
      )}
    </div>
  )
}