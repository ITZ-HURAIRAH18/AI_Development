import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Drawer({ open, onClose, title, children }: DrawerProps) {
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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto bg-surface shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface px-5 py-4">
          <h2 className="text-base font-semibold text-charcoal">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-charcoal-muted hover:bg-gray-100 hover:text-charcoal focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}