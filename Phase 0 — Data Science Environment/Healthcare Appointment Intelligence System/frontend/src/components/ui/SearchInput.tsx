import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Filter records...' }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-carbon-gray-50" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-none border border-carbon-gray-30 bg-surface pl-8 pr-3 text-xs text-carbon-gray-100 placeholder-carbon-gray-50 focus:border-primary-500 focus:outline-none"
        aria-label={placeholder}
      />
    </div>
  )
}