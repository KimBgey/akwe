import { useState } from 'react'
import { GoalWallet } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import clsx from 'clsx'

const ICONS = ['🏠', '✈️', '🚗', '💻', '📱', '🎓', '💍', '🏥', '🌍', '💰', '🎵', '🎮']
const COLORS = [
  '#00E5A0', '#577DFF', '#FFB547', '#FF4D6D', '#9B5DE5',
  '#00CFFF', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
]

interface AddGoalModalProps {
  open: boolean
  onClose: () => void
  onAdd: (goal: Omit<GoalWallet, 'id' | 'createdAt' | 'spentAmount' | 'allocatedAmount' | 'currentAmount'>) => void
}

export function AddGoalModal({ open, onClose, onAdd }: AddGoalModalProps) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [monthlyContribution, setMonthlyContribution] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState('')

  function reset() {
    setName('')
    setTargetAmount('')
    setMonthlyContribution('')
    setDeadline('')
    setIcon('🎯')
    setColor(COLORS[0])
    setError('')
  }

  function handleSubmit() {
    setError('')
    if (!name.trim()) return setError('Nom requis')
    const target = parseFloat(targetAmount)
    const contribution = parseFloat(monthlyContribution)
    if (isNaN(target) || target <= 0) return setError('Montant cible invalide')
    if (isNaN(contribution) || contribution <= 0) return setError('Contribution mensuelle invalide')

    onAdd({
      name: name.trim(),
      type: 'goal',
      targetAmount: target,
      monthlyContribution: contribution,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      status: 'active',
      icon,
      color,
    })
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={() => { reset(); onClose() }} title="Nouvel objectif" size="lg">
      <div className="flex flex-col gap-5">
        {/* Icône + Couleur */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-xs font-medium uppercase tracking-widest text-white/40">Icône</label>
            <div className="grid grid-cols-4 gap-1.5">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={clsx(
                    'flex h-9 items-center justify-center rounded-lg text-lg transition',
                    icon === ic
                      ? 'bg-brand-500/20 border border-brand-500/40'
                      : 'bg-surface-3 border border-transparent hover:border-white/10'
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest text-white/40">Couleur</label>
            <div className="grid grid-cols-2 gap-1.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={clsx(
                    'h-8 w-8 rounded-lg transition ring-offset-surface-1',
                    color === c && 'ring-2 ring-white/50 ring-offset-2'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <Input
          label="Nom de l'objectif"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Voyage Tokyo"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Montant cible"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            suffix="F"
            placeholder="500 000"
          />
          <Input
            label="Contribution / mois"
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(e.target.value)}
            suffix="F"
            placeholder="50 000"
          />
        </div>

        <Input
          label="Échéance (optionnel)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        {error && <p className="text-xs text-accent-rose">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={() => { reset(); onClose() }}>
            Annuler
          </Button>
          <Button fullWidth onClick={handleSubmit}>
            Créer l'objectif
          </Button>
        </div>
      </div>
    </Modal>
  )
}
