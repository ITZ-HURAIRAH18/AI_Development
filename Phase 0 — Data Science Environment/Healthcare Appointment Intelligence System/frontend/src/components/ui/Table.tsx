import type { ReactNode } from 'react'
import { ArrowUpDown } from 'lucide-react'

interface TableProps {
  columns: { key: string; label: string; className?: string; align?: 'left' | 'right' | 'center' }[]
  children: ReactNode
  onSort?: (key: string) => void
  sortBy?: string
  sortOrder?: string
}

export function Table({ columns, children, onSort, sortBy, sortOrder }: TableProps) {
  return (
    <div className="overflow-x-auto border border-carbon-gray-20 bg-surface">
      <table className="w-full text-left text-xs font-sans">
        <thead>
          <tr className="border-b border-carbon-gray-20 bg-carbon-gray-10 text-carbon-gray-70">
            {columns.map((column) => {
              const isSorted = sortBy === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-3.5 py-3 font-semibold uppercase tracking-wider text-[11px] ${
                    column.align === 'right' ? 'text-right' : ''
                  } ${column.align === 'center' ? 'text-center' : ''} ${column.className ?? ''}`}
                >
                  {onSort ? (
                    <button
                      onClick={() => onSort(column.key)}
                      className="inline-flex items-center gap-1.5 hover:text-carbon-gray-100 focus:outline-none"
                    >
                      <span>{column.label}</span>
                      <ArrowUpDown className={`h-3 w-3 ${isSorted ? 'text-primary-500' : 'text-carbon-gray-50'}`} />
                      {isSorted && <span className="sr-only">Sorted {sortOrder}</span>}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-carbon-gray-20 text-carbon-gray-100">{children}</tbody>
      </table>
    </div>
  )
}