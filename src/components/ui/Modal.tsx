import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative z-10 w-full rounded-3xl border border-ink/10 bg-surface-1 shadow-[0_24px_80px_rgb(var(--shadow-ambient)/calc(0.6*var(--shadow-scale)))] animate-fade-up flex flex-col max-h-[90vh]',
          {
            'max-w-sm': size === 'sm',
            'max-w-md': size === 'md',
            'max-w-xl': size === 'lg',
          }
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/5 px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink/60 transition hover:bg-ink/5 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
