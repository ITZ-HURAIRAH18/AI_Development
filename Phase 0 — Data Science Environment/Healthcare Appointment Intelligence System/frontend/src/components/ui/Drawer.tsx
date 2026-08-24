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
    <div className="fixed inset-0 z-50 font-sans" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-carbon-gray-20 bg-surface shadow-carbon">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-carbon-gray-20 bg-carbon-gray-100 px-5 py-3 text-white">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-carbon-gray-30 hover:bg-carbon-gray-80 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}