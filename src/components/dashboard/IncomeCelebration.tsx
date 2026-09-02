import { useEffect, useMemo } from 'react'
import { Check, Coins } from 'lucide-react'
import { formatCurrency } from '@/utils/calculations'

interface CelebrationRule {
  name: string
  amount: number
}

interface IncomeCelebrationProps {
  amount: number
  rules: CelebrationRule[]
  freeAmount: number
  onDone: () => void
}

const PARTICLE_COUNT = 10

// Le temps que met la dernière ligne à apparaître, avant de laisser l'utilisateur
// lire tranquillement le récapitulatif — l'animation ne doit pas se fermer avant ça.
const ROW_BASE_DELAY = 0.6
const ROW_STAGGER = 0.25
const HOLD_AFTER_LAST_ROW = 3200

export function IncomeCelebration({ amount, rules, freeAmount, onDone }: IncomeCelebrationProps) {
  const rows = useMemo(() => [...rules, { name: 'Solde courant', amount: freeAmount }], [rules, freeAmount])

  useEffect(() => {
    const lastRowDelay = ROW_BASE_DELAY + (rows.length - 1) * ROW_STAGGER
    const total = lastRowDelay * 1000 + HOLD_AFTER_LAST_ROW
    const timer = setTimeout(onDone, total)
    return () => clearTimeout(timer)
  }, [rows.length, onDone])

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        left: 8 + ((i * 37) % 84),
        delay: (i % 6) * 0.25,
        duration: 2 + (i % 3) * 0.4,
      })),
    []
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onDone}
      className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-gradient-surface px-6 animate-fade-in"
    >
      {/* Particules flottantes décoratives */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((p, i) => (
          <Coins
            key={i}
            size={14 + (i % 3) * 4}
            className="absolute bottom-0 text-brand-300/40 animate-float-up"
            style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}
          />
        ))}
      </div>

      {/* Icône centrale */}
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-accent-emerald/40 animate-ring-out" />
        <span
          className="absolute inset-0 rounded-full border-2 border-accent-emerald/40 animate-ring-out"
          style={{ animationDelay: '0.4s' }}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand shadow-glow-brand animate-pop-in">
          <Check size={32} className="text-white" strokeWidth={3} />
        </div>
      </div>

      <p className="text-sm font-semibold uppercase tracking-widest text-ink/50 animate-fade-up">
        Revenu distribué
      </p>
      <p
        className="mt-1 text-4xl font-bold text-ink font-mono animate-fade-up"
        style={{ animationDelay: '0.1s' }}
      >
        {formatCurrency(amount)}
      </p>

      <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
        {rows.map((row, i) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-2xl border border-ink/8 bg-surface-2/80 px-4 py-3 opacity-0 animate-fade-up"
            style={{ animationDelay: `${ROW_BASE_DELAY + i * ROW_STAGGER}s`, animationFillMode: 'forwards' }}
          >
            <span className="text-sm text-ink/60">{row.name}</span>
            <span className="font-mono text-sm font-semibold text-accent-emerald">
              {formatCurrency(row.amount)}
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-8 text-[11px] text-ink/35 opacity-0 animate-fade-up"
        style={{ animationDelay: `${ROW_BASE_DELAY + rows.length * ROW_STAGGER}s`, animationFillMode: 'forwards' }}
      >
        Toucher l'écran pour continuer
      </p>
    </div>
  )
}
