import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/utils/calculations'
import { AlertTriangle } from 'lucide-react'

interface UnlockSavingsModalProps {
  open: boolean
  onClose: () => void
  balance: number
  monthsRemaining: number
  onConfirm: (amount: number, label: string) => void
}

export function UnlockSavingsModal({ open, onClose, balance, monthsRemaining, onConfirm }: UnlockSavingsModalProps) {
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const isEarly = monthsRemaining > 0

  function reset() { setAmount(''); setLabel(''); setError('') }

  function handleSubmit() {
    setError('')
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) return setError('Montant invalide')
    if (num > balance) return setError(`Solde insuffisant (${formatCurrency(balance)} disponible)`)
    if (!label.trim()) return setError('Motif requis')
    onConfirm(num, label.trim())
    reset()
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={() => { reset(); onClose() }}
      title={isEarly ? 'Retrait exceptionnel' : "Retirer de l'épargne"}
    >
      <div className="flex flex-col gap-4">
        {isEarly && (
          <div className="flex items-start gap-3 rounded-2xl border border-accent-amber/25 bg-accent-amber/5 px-4 py-3">
            <AlertTriangle size={16} className="text-accent-amber shrink-0 mt-0.5" />
            <p className="text-xs text-ink/70 leading-relaxed">
              Il reste {monthsRemaining} mois avant la fin de la période de blocage. Ce retrait casse la
              discipline d'épargne — réserve-le à une vraie urgence.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-surface-3 px-4 py-2.5">
          <span className="text-xs text-ink/60">Disponible</span>
          <span className="text-sm font-bold font-mono text-ink">{formatCurrency(balance)}</span>
        </div>

        <Input
          label="Montant"
          type="number"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          suffix="F"
          placeholder="0"
        />
        <Input
          label="Motif"
          type="text"
          value={label}
          onChange={(e) => { setLabel(e.target.value); setError('') }}
          placeholder="Ex: Urgence médicale"
        />

        {error && <p className="text-xs text-accent-rose">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" fullWidth onClick={() => { reset(); onClose() }}>
            Annuler
          </Button>
          <Button fullWidth onClick={handleSubmit}>
            Confirmer le retrait
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
