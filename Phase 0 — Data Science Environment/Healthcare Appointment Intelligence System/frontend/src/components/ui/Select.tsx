import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-charcoal">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`h-10 rounded-md border border-border bg-white px-3 text-sm text-charcoal transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}