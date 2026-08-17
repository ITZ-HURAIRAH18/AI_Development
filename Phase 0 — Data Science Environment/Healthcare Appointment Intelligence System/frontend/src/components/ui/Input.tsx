import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-charcoal">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-10 rounded-md border border-border bg-white px-3 text-sm text-charcoal placeholder:text-gray-400 transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}