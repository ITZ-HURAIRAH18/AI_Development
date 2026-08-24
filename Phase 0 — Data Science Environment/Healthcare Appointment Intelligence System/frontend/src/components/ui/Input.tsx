import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-carbon-gray-70">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-9 rounded-none border border-carbon-gray-30 bg-surface px-3 text-xs font-medium text-carbon-gray-100 placeholder:text-carbon-gray-50 transition-colors focus:border-primary-500 focus:outline-none ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] font-medium text-danger">{error}</p>}
    </div>
  )
}