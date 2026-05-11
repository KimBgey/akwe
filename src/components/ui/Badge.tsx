import clsx from 'clsx'

type BadgeVariant = 'locked' | 'fixed' | 'free' | 'goal' | 'bonus' | 'active' | 'completed' | 'paused'

const VARIANTS: Record<BadgeVariant, string> = {
  locked:    'bg-accent-violet/10 text-accent-violet border-accent-violet/20',
  fixed:     'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  free:      'bg-brand-500/10 text-brand-400 border-brand-500/20',
  goal:      'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
  bonus:     'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20',
  active:    'bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20',
  completed: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  paused:    'bg-white/5 text-white/40 border-white/10',
}

const LABELS: Record<BadgeVariant, string> = {
  locked:    'Bloquée',
  fixed:     'Fixe',
  free:      'Courant',
  goal:      'Objectif',
  bonus:     'Bonus',
  active:    'Actif',
  completed: 'Atteint',
  paused:    'En pause',
}

export function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest',
        VARIANTS[variant]
      )}
    >
      {LABELS[variant]}
    </span>
  )
}
