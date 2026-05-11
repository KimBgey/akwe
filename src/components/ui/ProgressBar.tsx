import clsx from 'clsx'

interface ProgressBarProps {
  value: number
  color?: 'brand' | 'emerald' | 'amber' | 'rose' | 'violet'
  size?: 'sm' | 'md'
  animated?: boolean
}

const GRADIENTS = {
  brand:   'from-brand-400 to-accent-violet',
  emerald: 'from-accent-emerald to-accent-cyan',
  amber:   'from-accent-amber to-accent-rose',
  rose:    'from-accent-rose to-accent-violet',
  violet:  'from-accent-violet to-brand-400',
}

export function ProgressBar({ value, color = 'brand', size = 'md', animated }: ProgressBarProps) {
  const pct = Math.min(Math.max(value * 100, 0), 100)
  return (
    <div
      className={clsx(
        'w-full overflow-hidden rounded-full bg-surface-3',
        size === 'sm' ? 'h-1.5' : 'h-2.5'
      )}
    >
      <div
        className={clsx(
          'h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out',
          GRADIENTS[color],
          animated && 'animate-pulse-slow'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
