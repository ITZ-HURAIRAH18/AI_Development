import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, options, className = '', id, ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-[11px] font-bold uppercase tracking-wider text-carbon-gray-70">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`h-9 rounded-none border border-carbon-gray-30 bg-surface px-3 text-xs font-medium text-carbon-gray-100 transition-colors focus:border-primary-500 focus:outline-none ${className}`}
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