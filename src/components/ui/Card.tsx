import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: 'brand' | 'emerald' | 'amber' | 'none'
  onClick?: () => void
}

export function Card({ children, className, glow = 'none', onClick }: CardProps) {
  const glowClass = {
    brand: 'shadow-glow-brand border-brand-500/20',
    emerald: 'shadow-glow-emerald border-accent-emerald/20',
    amber: 'shadow-glow-amber border-accent-amber/20',
    none: 'border-ink/5',
  }[glow]

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative rounded-2xl border bg-surface-2 p-4 shadow-card transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-card-hover hover:border-ink/10 hover:-translate-y-0.5',
        glowClass,
        className
      )}
    >
      <div
        className="absolute inset-0 rounded-2xl bg-card-glow pointer-events-none"
        style={{ opacity: 'calc(0.5 * var(--ambient-opacity))' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-widest text-ink/60">{label}</span>
      <span className={clsx('text-2xl font-bold tracking-tight', accent ?? 'text-ink')}>{value}</span>
      {sub && <span className="text-xs text-ink/60">{sub}</span>}
    </div>
  )
}
