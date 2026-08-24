import type { ReactNode } from 'react'
import { AlertCircle, FileX } from 'lucide-react'

export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-label="Loading" role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton h-10 border border-carbon-gray-20" />
      ))}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-carbon-gray-30 bg-surface py-10 px-4 text-center">
      <FileX className="h-6 w-6 text-carbon-gray-50" />
      <p className="text-xs font-bold uppercase tracking-wider text-carbon-gray-100">{title}</p>
      {description && <p className="max-w-md text-xs text-carbon-gray-70">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 border border-red-200 border-l-4 border-l-danger bg-red-50 py-8 px-4 text-center">
      <AlertCircle className="h-6 w-6 text-danger" />
      <p className="text-xs font-bold uppercase tracking-wider text-danger">Data Retrieval Error</p>
      <p className="max-w-md text-xs text-carbon-gray-70">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 border border-carbon-gray-30 bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-carbon-gray-100 hover:bg-carbon-gray-10 active:scale-95 transition-all"
        >
          Re-query Data
        </button>
      )}
    </div>
  )
}