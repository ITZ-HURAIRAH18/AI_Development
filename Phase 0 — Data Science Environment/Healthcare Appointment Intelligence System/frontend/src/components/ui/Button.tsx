import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 focus-visible:outline-primary-700',
  secondary: 'bg-primary-50 text-primary-800 hover:bg-primary-100 focus-visible:outline-primary-700',
  outline: 'border border-border bg-white text-charcoal hover:bg-gray-50 focus-visible:outline-charcoal',
  ghost: 'text-charcoal hover:bg-gray-100 focus-visible:outline-charcoal',
  danger: 'bg-danger text-white hover:bg-red-700 focus-visible:outline-danger',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
}

export function Button({ variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}