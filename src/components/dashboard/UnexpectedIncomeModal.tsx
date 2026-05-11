import { useState } from 'react'
import { GoalWallet } from '@/types'
import { formatCurrency, getProgress } from '@/utils/calculations'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Coins, Wallet, Lock, Rocket, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'

type Allocation = 'bonus' | 'free' | 'locked' | 'goal' | 'distribute'

const ALT_OPTIONS = [
  {
    id: 'free' as Allocation,
    icon: Wallet,
    label: 'Solde courant',
    description: 'Disponible immédiatement',
    iconClass: 'text-brand-400',
    bgClass: 'bg-brand-500/10 border-brand-500/20',
  },
  {
    id: 'locked' as Allocation,
    icon: Lock,
    label: 'Épargne bloquée',
    description: 'Mis de côté',
    iconClass: 'text-accent-violet',
    bgClass: 'bg-accent-violet/10 border-accent-violet/20',
  },
  {
    id: 'goal' as Allocation,
    icon: Rocket,
    label: 'Booster un objectif',
    description: 'Choisir un portefeuille',
    iconClass: 'text-accent-emerald',
    bgClass: 'bg-accent-emerald/10 border-accent-emerald/20',
  },
  {
    id: 'distribute' as Allocation,
    icon: Zap,
    label: 'Distribuer',
    description: 'Selon tes règles',
    iconClass: 'text-accent-amber',
    bgClass: 'bg-accent-amber/10 border-accent-amber/20',
  },
]

interface UnexpectedIncomeModalProps {
  open: boolean
  onClose: () => void
  goals: GoalWallet[]
  onSubmit: (amount: number, label: string, allocation: Allocation, goalId?: string) => void
}

export function UnexpectedIncomeModal({ open, onClose, goals, onSubmit }: UnexpectedIncomeModalProps) {
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [showAlternative, setShowAlternative] = useState(false)
  const [allocation, setAllocation] = useState<Allocation>('free')
  const [step, setStep] = useState<'main' | 'goal'>('main')
  const [goalId, setGoalId] = useState('')
  const [error, setError] = useState('')

  const activeGoals = goals.filter((g) => g.status === 'active')
  const num = parseFloat(amount)

  function reset() {
    setAmount('')
    setLabel('')
    setShowAlternative(false)
    setAllocation('free')
    setStep('main')
    setGoalId('')
    setError('')
  }

  function validate(): boolean {
    if (isNaN(num) || num <= 0) { setError('Montant invalide'); return false }
    if (!label.trim()) { setError('Libellé requis'); return false }
    return true
  }

  function handleBonus() {
    if (!validate()) return
    onSubmit(num, label.trim(), 'bonus')
    reset()
    onClose()
  }

  function handleAlternative() {
    if (!validate()) return
    if (allocation === 'goal') {
      if (activeGoals.length === 0) { setError('Aucun objectif actif'); return }
      setStep('goal')
      return
    }
    onSubmit(num, label.trim(), allocation)
    reset()
    onClose()
  }

  function handleGoalSubmit() {
    if (!goalId) { setError('Sélectionne un objectif'); return }
    onSubmit(num, label.trim(), 'goal', goalId)
    reset()
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => { reset(); onClose() }}
      title="Revenu inattendu"
    >
      {step === 'main' ? (
        <div className="flex flex-col gap-4">
          {/* Champs */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Montant"
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError('') }}
              suffix="F"
              placeholder="0"
            />
            <Input
              label="Libellé"
              type="text"
              value={label}
              onChange={(e) => { setLabel(e.target.value); setError('') }}
              placeholder="Ex: Bonus client"
            />
          </div>

          {error && <p className="text-xs text-accent-rose -mt-1">{error}</p>}

          {/* Option principale — Bonus mensuel */}
          <button
            onClick={handleBonus}
            className="flex items-center gap-3 rounded-2xl border border-accent-cyan/20 bg-accent-cyan/5 px-4 py-3.5 text-left transition hover:bg-accent-cyan/10 active:scale-[.98]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/10">
              <Coins size={18} className="text-accent-cyan" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Stocker dans Bonus mensuel</p>
              <p className="text-xs text-white/40">Disponible librement, sans règle</p>
            </div>
            <div className="rounded-full bg-accent-cyan/15 px-2.5 py-0.5">
              <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-wider">Défaut</span>
            </div>
          </button>

          {/* Option secondaire — Affecter autrement */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowAlternative((v) => !v)}
              className="flex items-center gap-2 self-start text-xs text-white/40 hover:text-white/60 transition"
            >
              {showAlternative ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Affecter autrement
            </button>

            {showAlternative && (
              <div className="flex flex-col gap-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  {ALT_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const selected = allocation === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAllocation(opt.id)}
                        className={clsx(
                          'flex flex-col gap-2 rounded-2xl border p-3 text-left transition',
                          selected ? opt.bgClass : 'border-white/5 bg-surface-3 hover:border-white/10'
                        )}
                      >
                        <Icon size={15} className={selected ? opt.iconClass : 'text-white/30'} />
                        <div>
                          <p className={clsx('text-xs font-semibold leading-tight', selected ? 'text-white' : 'text-white/50')}>
                            {opt.label}
                          </p>
                          <p className="text-[10px] text-white/30 mt-0.5">{opt.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <Button fullWidth onClick={handleAlternative}>
                  {allocation === 'goal' ? 'Choisir un objectif →' : 'Confirmer'}
                </Button>
              </div>
            )}
          </div>

          <Button variant="secondary" fullWidth onClick={() => { reset(); onClose() }}>
            Annuler
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setStep('main')}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition self-start"
          >
            ← Retour
          </button>

          <div className="rounded-xl bg-surface-3 border border-white/5 px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs text-white/40">À verser vers objectif</span>
            <span className="text-sm font-bold font-mono text-accent-emerald">{formatCurrency(num)}</span>
          </div>

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
                    <span className="text-base">{g.icon}</span>
                    <span className="text-sm font-medium text-white">{g.name}</span>
                  </div>
                  <span className="text-xs font-mono text-white/40">
                    {Math.round(getProgress(g) * 100)}%
                  </span>
                </div>
                <ProgressBar value={getProgress(g)} color="emerald" size="sm" />
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                  <span>{formatCurrency(g.currentAmount)}</span>
                  <span>{formatCurrency(g.targetAmount)}</span>
                </div>
              </button>
            ))}
          </div>

          {error && <p className="text-xs text-accent-rose">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" fullWidth onClick={() => setStep('main')}>
              Retour
            </Button>
            <Button fullWidth onClick={handleGoalSubmit} disabled={!goalId}>
              Booster
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
