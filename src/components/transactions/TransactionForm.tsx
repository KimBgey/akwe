import { useState } from 'react'
import { Envelope, CATEGORIES, Category } from '@/types'
import { getBalance, formatCurrency } from '@/utils/calculations'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  envelopes: Envelope[]
  onSubmit: (envelopeId: string, amount: number, category: string, label: string) => void
  defaultEnvelopeId?: string
}

export function TransactionForm({
  open,
  onClose,
  envelopes,
  onSubmit,
  defaultEnvelopeId,
}: TransactionFormProps) {
  const [envelopeId, setEnvelopeId] = useState(defaultEnvelopeId ?? '')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Category>('autre')
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')

  const spendable = envelopes.filter((e) => e.type !== 'locked')
  const selected = spendable.find((e) => e.id === envelopeId)
  const balance = selected ? getBalance(selected) : null

  function reset() {
    setAmount('')
    setLabel('')
    setError('')
    setEnvelopeId(defaultEnvelopeId ?? '')
    setCategory('autre')
  }

  function handleSubmit() {
    setError('')
    const num = parseFloat(amount)
    if (!envelopeId) return setError('Sélectionne une enveloppe')
    if (isNaN(num) || num <= 0) return setError('Montant invalide')
    if (!label.trim()) return setError('Libellé requis')
    onSubmit(envelopeId, num, category, label.trim())
    reset()
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={() => { reset(); onClose() }} title="Nouvelle dépense">
      <div className="flex flex-col gap-5">

        {/* Enveloppe + Montant côte à côte */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest text-white/40">
              Enveloppe
            </label>
            <div className="relative">
              <select
                value={envelopeId}
                onChange={(e) => setEnvelopeId(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-surface-3 px-3 py-3 text-sm text-white outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30"
              >
                <option value="" disabled>Choisir…</option>
                {spendable.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
            {balance !== null && (
              <p className="text-[11px] text-white/30">
                Dispo: <span className="text-white/60 font-semibold">{formatCurrency(balance)}</span>
              </p>
            )}
          </div>

          <Input
            label="Montant"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            suffix="F"
            placeholder="0"
          />
        </div>

        {/* Catégorie — chips horizontales scrollables */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-widest text-white/40">
            Catégorie
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {(Object.entries(CATEGORIES) as [Category, { label: string; emoji: string }][]).map(
              ([key, { label: lbl, emoji }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={clsx(
                    'shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    category === key
                      ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                      : 'border-white/10 bg-surface-3 text-white/40 hover:text-white/70'
                  )}
                >
                  <span>{emoji}</span>
                  <span>{lbl}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Libellé */}
        <Input
          label="Libellé"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Courses marché"
        />

        {error && <p className="text-xs text-accent-rose">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="secondary" fullWidth onClick={() => { reset(); onClose() }}>
            Annuler
          </Button>
          <Button fullWidth onClick={handleSubmit}>
            Enregistrer
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
