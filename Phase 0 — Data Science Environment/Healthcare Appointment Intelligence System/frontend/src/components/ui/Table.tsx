import type { ReactNode } from 'react'

interface TableProps {
  columns: { key: string; label: string; className?: string; align?: 'left' | 'right' | 'center' }[]
  children: ReactNode
  onSort?: (key: string) => void
  sortBy?: string
  sortOrder?: string
}

export function Table({ columns, children, onSort, sortBy, sortOrder }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-50/60">
            {columns.map((column) => {
              const isSorted = sortBy === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-medium uppercase tracking-wide text-charcoal-muted ${column.align === 'right' ? 'text-right' : ''} ${column.align === 'center' ? 'text-center' : ''} ${column.className ?? ''}`}
                >
                  {onSort ? (
                    <button
                      onClick={() => onSort(column.key)}
                      className="inline-flex items-center gap-1 hover:text-charcoal focus:outline-none"
                    >
                      {column.label}
                      {isSorted && <span aria-hidden="true">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  )
}