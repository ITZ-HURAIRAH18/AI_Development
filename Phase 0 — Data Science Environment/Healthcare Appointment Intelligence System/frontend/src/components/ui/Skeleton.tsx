import type { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  style?: CSSProperties
}

/** Base single block placeholder used to compose all loading skeletons. */
export function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

/** A few stacked text lines sized like body copy. */
export function SkeletonText({ lines = 2, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={index === 0 ? 'h-3 w-3/4 last:w-1/2' : 'h-3 w-1/2'} />
      ))}
    </div>
  )
}

/** Compact metric-card-shaped skeleton. */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-carbon-gray-20 bg-surface p-4 ${className}`} aria-label="Loading metric">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}

/** Chart-card-shaped skeleton (header + plot region + axis strip). */
export function ChartSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-carbon-gray-20 bg-surface ${className}`} aria-label="Loading chart">
      <div className="flex items-start justify-between border-b border-carbon-gray-20 px-4 py-3.5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-44" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-48 w-full" />
        <div className="mt-3 flex items-center justify-between border-t border-carbon-gray-20 pt-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

/** Data-table-shaped skeleton that mirrors compact enterprise table rows. */
export function TableSkeleton({
  rows = 8,
  columns = 6,
  className = '',
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={`overflow-hidden border border-carbon-gray-20 bg-surface ${className}`} aria-label="Loading table">
      <div className="flex gap-6 border-b border-carbon-gray-20 bg-carbon-gray-10 px-3.5 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1 last:flex-none last:w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-6 border-b border-carbon-gray-20 px-3.5 py-3 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className={`h-3 flex-1 ${rowIndex % 3 === 0 ? 'w-24' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Page header + filter toolbar skeleton. */
export function PageHeaderSkeleton({ filters = false }: { filters?: boolean }) {
  return (
    <div className="border-b border-carbon-gray-20 pb-5">
      <Skeleton className="h-3 w-44" />
      <Skeleton className="mt-3 h-8 w-72" />
      <Skeleton className="mt-2 h-3 w-96 max-w-full" />
      {filters && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-40" />
        </div>
      )}
    </div>
  )
}

/** Full page loading state: header + filters + cards + charts + table. */
export function PageSkeleton({
  cards = 4,
  charts = 2,
  tableRows = 6,
  filters = false,
}: {
  cards?: number
  charts?: number
  tableRows?: number
  filters?: boolean
}) {
  return (
    <div className="space-y-6" aria-label="Loading page" role="status">
      <PageHeaderSkeleton filters={filters} />
      {cards > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: cards }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      )}
      {charts > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: charts }).map((_, index) => (
            <ChartSkeleton key={index} />
          ))}
        </div>
      )}
      {tableRows > 0 && <TableSkeleton rows={tableRows} />}
    </div>
  )
}

/** Dashboard-specific loading skeleton matching the real layout. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard" role="status">
      <PageHeaderSkeleton filters={false} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <ChartSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

/** Profile/detail-page loading skeleton. */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading profile" role="status">
      <PageHeaderSkeleton filters={false} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      <TableSkeleton rows={6} columns={5} />
    </div>
  )
}

/** Form/simulator page loading skeleton. */
export function FormSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading form" role="status">
      <PageHeaderSkeleton filters={false} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="border border-carbon-gray-20 bg-surface">
            <div className="border-b border-carbon-gray-20 px-4 py-3.5">
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="space-y-4 p-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}