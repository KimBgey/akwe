import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in
      flex-col justify-end
      md:items-center md:justify-center md:p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — bottom sheet sur mobile, modal centré sur desktop */}
      <div className="
        relative z-10 w-full bg-surface-1 animate-fade-up flex flex-col
        rounded-t-3xl border-t border-ink/10 max-h-[92vh]
        md:rounded-3xl md:border md:border-ink/10 md:max-w-md md:max-h-[85vh] md:shadow-[0_24px_80px_rgb(var(--shadow-ambient)/calc(0.6*var(--shadow-scale)))]
      ">
        {/* Drag handle — mobile uniquement */}
        <div className="flex justify-center pt-3 pb-1 shrink-0 md:hidden">
          <div className="h-1 w-10 rounded-full bg-ink/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-ink/5">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 transition hover:bg-ink/5 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto overscroll-contain px-5 py-5 pb-8 md:pb-5">
          {children}
        </div>
      </div>
    </div>
  )
}
