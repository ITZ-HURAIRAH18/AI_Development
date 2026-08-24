import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 font-semibold',
  secondary: 'bg-carbon-gray-90 text-white hover:bg-carbon-gray-80 font-semibold',
  outline: 'border border-carbon-gray-30 bg-surface text-carbon-gray-100 hover:bg-carbon-gray-10 font-semibold',
  ghost: 'text-carbon-gray-100 hover:bg-carbon-gray-10 font-medium',
  danger: 'bg-danger text-white hover:bg-red-700 font-semibold',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-xs tracking-wider uppercase',
  lg: 'h-11 px-5 text-sm uppercase tracking-wider',
}

export function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-none transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}