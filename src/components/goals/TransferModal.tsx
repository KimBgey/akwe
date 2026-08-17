import { useState } from 'react'
import { Envelope, GoalWallet } from '@/types'
import { formatCurrency, getProgress } from '@/utils/calculations'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Wallet, Coins } from 'lucide-react'
import clsx from 'clsx'

interface TransferModalProps {
  open: boolean
  onClose: () => void
  goals: GoalWallet[]
  sources: Envelope[]
  onTransfer: (goalId: string, amount: number, label: string, sourceEnvelopeId: string) => void
}

const SOURCE_CONFIG: Record<string, { icon: typeof Wallet; iconClass: string; selectedClass: string }> = {
  free:  { icon: Wallet, iconClass: 'text-brand-400',  selectedClass: 'border-brand-500/30 bg-brand-500/8' },
  bonus: { icon: Coins,  iconClass: 'text-accent-cyan', selectedClass: 'border-accent-cyan/30 bg-accent-cyan/8' },
}

export function TransferModal({ open, onClose, goals, sources, onTransfer }: TransferModalProps) {
  const [sourceId, setSourceId] = useState('')
  const [goalId, setGoalId]     = useState('')
  const [amount, setAmount]     = useState('')
  const [error, setError]       = useState('')

  const activeGoals    = goals.filter((g) => g.status !== 'completed')
  const selectedSource = sources.find((s) => s.id === sourceId)
  const selectedGoal   = activeGoals.find((g) => g.id === goalId)
  const sourceBalance  = selectedSource
    ? selectedSource.allocatedAmount - selectedSource.spentAmount
    : 0

  function reset() {
    setSourceId('')
    setGoalId('')
    setAmount('')
    setError('')
  }

  function handleSubmit() {
    setError('')
    if (!sourceId) return setError('Sélectionne une source')
    if (!goalId)   return setError('Sélectionne un objectif')
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) return setError('Montant invalide')
    if (num > sourceBalance)
      return setError(`Solde insuffisant (${formatCurrency(sourceBalance)} disponible)`)
    onTransfer(goalId, num, `Versement → ${selectedGoal?.name}`, sourceId)
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose() }}
      title="Transférer vers un objectif"
    >
      <div className="flex flex-col gap-5">

        {/* Source selector */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/60">Source</p>
          <div className="grid grid-cols-2 gap-2">
            {sources.map((src) => {
              const cfg = SOURCE_CONFIG[src.type] ?? SOURCE_CONFIG['free']
              const Icon = cfg.icon
              const balance = src.allocatedAmount - src.spentAmount
              const selected = sourceId === src.id
              return (
                <button
                  key={src.id}
                  type="button"
                  onClick={() => { setSourceId(src.id); setError('') }}
                  className={clsx(
                    'flex flex-col gap-2 rounded-2xl border p-3.5 text-left transition',
                    selected
                      ? cfg.selectedClass
                      : 'border-ink/5 bg-surface-3 hover:border-ink/10'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={selected ? cfg.iconClass : 'text-ink/50'} />
                    <span className={clsx('text-xs font-semibold', selected ? 'text-ink' : 'text-ink/70')}>
                      {src.name}
                    </span>
                  </div>
                  <p className={clsx('text-base font-bold font-mono', selected ? 'text-ink' : 'text-ink/60')}>
                    {formatCurrency(balance)}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Goal selector */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/60">Objectif</p>
          {activeGoals.length === 0 ? (
            <p className="text-sm text-ink/50 py-4 text-center">Aucun objectif actif</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
              {activeGoals.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => { setGoalId(g.id); setError('') }}
                  className={clsx(
                    'w-full text-left rounded-xl border p-3.5 transition',
                    goalId === g.id
                      ? 'border-accent-emerald/40 bg-accent-emerald/5'
                      : 'border-ink/5 bg-surface-3 hover:border-ink/10'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{g.icon}</span>
                      <span className="text-sm font-medium text-ink">{g.name}</span>
                    </div>
                    <span className="text-xs font-mono text-ink/70">
                      {formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}
                    </span>
                  </div>
                  <ProgressBar value={getProgress(g)} color="emerald" size="sm" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <Input
          label="Montant"
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          suffix="F"
          placeholder="0"
        />

        {error && <p className="text-xs text-accent-rose">{error}</p>}

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => { reset(); onClose() }}>
            Annuler
          </Button>
          <Button fullWidth onClick={handleSubmit} disabled={activeGoals.length === 0}>
            Transférer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
