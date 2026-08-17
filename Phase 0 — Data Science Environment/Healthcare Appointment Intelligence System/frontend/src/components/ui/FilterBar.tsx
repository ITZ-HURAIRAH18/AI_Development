import { Search, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Select } from '@/components/ui/Select'
import { SearchInput } from '@/components/ui/SearchInput'

interface FilterBarProps {
  search?: string
  onSearchChange?: (value: string) => void
  filters?: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }[]
  clearable?: boolean
  onClear?: () => void
  children?: ReactNode
}

export function FilterBar({ search, onSearchChange, filters = [], clearable = false, onClear, children }: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-3 shadow-card">
      {search !== undefined && onSearchChange && (
        <div className="min-w-48 flex-1">
          <SearchInput value={search} onChange={onSearchChange} />
        </div>
      )}
      {filters.map((filter) => (
        <div key={filter.label} className="min-w-36">
          <Select label={filter.label} value={filter.value} onChange={(event) => filter.onChange(event.target.value)} options={filter.options} />
        </div>
      ))}
      {clearable && onClear && (
        <button
          onClick={onClear}
          className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border bg-white px-3 text-sm text-charcoal-muted hover:bg-gray-50 hover:text-charcoal"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
      )}
      {children}
    </div>
  )
}

export function FilterIconFallback() {
  return <Search className="h-4 w-4" aria-hidden="true" />
}