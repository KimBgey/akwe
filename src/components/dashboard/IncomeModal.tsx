import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { IncomeCelebration } from '@/components/dashboard/IncomeCelebration'
import { DistributionRule, Envelope } from '@/types'
import { formatCurrency } from '@/utils/calculations'
import { Zap } from 'lucide-react'

interface IncomeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (amount: number) => void
  distributionRules: DistributionRule[]
  envelopes: Envelope[]
}

export function IncomeModal({ open, onClose, onSubmit, distributionRules, envelopes }: IncomeModalProps) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [celebrating, setCelebrating] = useState(false)

  const num = parseFloat(amount) || 0

  function getEnvName(id: string) {
    return envelopes.find((e) => e.id === id)?.name ?? id
  }

  function getRuleAmount(rule: DistributionRule) {
    return rule.usePercentage ? (num * rule.percentage) / 100 : rule.amount
  }

  const totalAllocated = distributionRules.reduce((s, r) => s + getRuleAmount(r), 0)
  const freeAmount = Math.max(0, num - totalAllocated)

  function handleSubmit() {
    setError('')
    if (isNaN(num) || num <= 0) return setError('Montant invalide')
    setCelebrating(true)
  }

  function finishCelebration() {
    onSubmit(num)
    setAmount('')
    setCelebrating(false)
    onClose()
  }

  return (
    <>
    <Modal open={open} onClose={() => { setAmount(''); setError(''); onClose() }} title="Saisir un revenu" size="md">
      <div className="flex flex-col gap-5">
        <Input
          label="Montant du revenu"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          suffix="F CFA"
          placeholder="0"
        />

        {num > 0 && (
          <div className="rounded-2xl border border-ink/5 bg-surface-3 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} className="text-brand-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-ink/60">
                Distribution automatique
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {distributionRules.map((rule) => (
                <div key={rule.envelopeId} className="flex justify-between text-sm">
                  <span className="text-ink/60">{getEnvName(rule.envelopeId)}</span>
                  <span className="font-mono font-semibold text-ink">
                    {formatCurrency(getRuleAmount(rule))}
                  </span>
                </div>
              ))}
              <div className="flex justify-between text-sm border-t border-ink/5 pt-2 mt-1">
                <span className="text-ink/60">Solde courant (reste)</span>
                <span className="font-mono font-semibold text-accent-emerald">
                  {formatCurrency(freeAmount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-accent-rose">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={() => { setAmount(''); setError(''); onClose() }}>
            Annuler
          </Button>
          <Button fullWidth onClick={handleSubmit}>
            Distribuer
          </Button>
        </div>
      </div>
    </Modal>
    {celebrating && (
      <IncomeCelebration
        amount={num}
        rules={distributionRules.map((rule) => ({ name: getEnvName(rule.envelopeId), amount: getRuleAmount(rule) }))}
        freeAmount={freeAmount}
        onDone={finishCelebration}
      />
    )}
    </>
  )
}
