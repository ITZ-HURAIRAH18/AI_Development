import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}

export function Modal({ open, onClose, title, children, wide = false }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} rounded-lg bg-surface shadow-lg`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-charcoal-muted hover:bg-gray-100 hover:text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}