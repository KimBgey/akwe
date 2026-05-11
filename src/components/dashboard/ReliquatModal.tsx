import { useState } from 'react'
import { GoalWallet, ReliquatAction } from '@/types'
import { formatCurrency, getProgress } from '@/utils/calculations'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Landmark, Rocket, ArrowRight, Coins } from 'lucide-react'
import clsx from 'clsx'

interface ReliquatModalProps {
  open: boolean
  onClose: () => void
  balance: number
  month: string
  goals: GoalWallet[]
  onAction: (action: ReliquatAction, goalId?: string) => void
}

const OPTIONS = [
  {
    action: 'carryover' as ReliquatAction,
    icon: ArrowRight,
    label: 'Reporter au mois prochain',
    sub: 'Le solde reste dans Courant',
    hoverClass: 'hover:border-brand-500/30 hover:bg-brand-500/5',
    iconClass: 'bg-brand-500/10 text-brand-400',
  },
  {
    action: 'bonus_mensuel' as ReliquatAction,
    icon: Coins,
    label: 'Bonus mensuel',
    sub: 'Archivé dans le portefeuille Bonus',
    hoverClass: 'hover:border-accent-amber/30 hover:bg-accent-amber/5',
    iconClass: 'bg-accent-amber/10 text-accent-amber',
  },
  {
    action: 'boost_goal' as ReliquatAction,
    icon: Rocket,
    label: 'Booster un objectif',
    sub: 'Choisir un portefeuille cible',
    hoverClass: 'hover:border-accent-emerald/30 hover:bg-accent-emerald/5',
    iconClass: 'bg-accent-emerald/10 text-accent-emerald',
  },
  {
    action: 'save' as ReliquatAction,
    icon: Landmark,
    label: 'Verser en épargne',
    sub: 'Ajouté à l\'enveloppe bloquée',
    hoverClass: 'hover:border-accent-violet/30 hover:bg-accent-violet/5',
    iconClass: 'bg-accent-violet/10 text-accent-violet',
  },
]

export function ReliquatModal({ open, onClose, balance, month, goals, onAction }: ReliquatModalProps) {
  const [step, setStep] = useState<'choice' | 'goal'>('choice')
  const [goalId, setGoalId] = useState('')

  const activeGoals = goals.filter((g) => g.status === 'active')

  function reset() { setStep('choice'); setGoalId('') }

  function handleChoice(action: ReliquatAction) {
    if (action === 'boost_goal') {
      if (activeGoals.length === 0) return
      setStep('goal')
      return
    }
    onAction(action)
    reset()
    onClose()
  }

  function handleBoost() {
    if (!goalId) return
    onAction('boost_goal', goalId)
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Gérer le reliquat">
      {step === 'choice' ? (
        <div className="flex flex-col gap-4">
          {/* Montant reliquat */}
          <div className="rounded-2xl bg-gradient-brand p-px">
            <div className="rounded-2xl bg-surface-2 px-4 py-3 text-center">
              <p className="text-[11px] uppercase tracking-widest text-white/30 mb-0.5">
                Reliquat de {month}
              </p>
              <p className="text-2xl font-bold font-mono text-white">{formatCurrency(balance)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {OPTIONS.map(({ action, icon: Icon, label, sub, hoverClass, iconClass }) => (
              <button
                key={action}
                onClick={() => handleChoice(action)}
                disabled={action === 'boost_goal' && activeGoals.length === 0}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border border-white/8 bg-surface-3 p-3.5 text-left transition disabled:opacity-40',
                  hoverClass
                )}
              >
                <div className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconClass)}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-white/40">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setStep('choice')}
            className="self-start text-xs text-white/40 hover:text-white/60 transition"
          >
            ← Retour
          </button>

          <p className="text-sm text-white/50">
            Booster avec{' '}
            <span className="font-semibold text-accent-emerald">{formatCurrency(balance)}</span>
          </p>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {activeGoals.map((g) => (
              <button
                key={g.id}
                onClick={() => setGoalId(g.id)}
                className={clsx(
                  'w-full text-left rounded-xl border p-3 transition',
                  goalId === g.id
                    ? 'border-accent-emerald/40 bg-accent-emerald/5'
                    : 'border-white/5 bg-surface-3 hover:border-white/10'
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{g.icon}</span>
                    <span className="text-sm font-medium text-white">{g.name}</span>
                  </div>
                  <span className="text-xs font-mono text-white/40">
                    {Math.round(getProgress(g) * 100)}%
                  </span>
                </div>
                <ProgressBar value={getProgress(g)} color="emerald" size="sm" />
              </button>
            ))}
          </div>

          <Button fullWidth onClick={handleBoost} disabled={!goalId}>
            Booster cet objectif
          </Button>
        </div>
      )}
    </Modal>
  )
}
