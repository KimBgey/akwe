import { useState } from 'react'
import { DistributionRule, Envelope } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pencil, Check, CalendarDays, Trash2, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'

const PAY_DAY_OPTIONS = [1, 5, 10, 15, 20, 25, 28, 30]

interface DistributionSettingsProps {
  open: boolean
  onClose: () => void
  rules: DistributionRule[]
  envelopes: Envelope[]
  payDay: number
  onUpdate: (rule: DistributionRule) => void
  onPayDayChange: (day: number) => void
  onReset: () => void
}

export function DistributionSettings({
  open, onClose, rules, envelopes, payDay, onUpdate, onPayDayChange, onReset,
}: DistributionSettingsProps) {
  const [editing, setEditing]       = useState<string | null>(null)
  const [value, setValue]           = useState('')
  const [confirming, setConfirming] = useState(false)

  const nonFreeEnvelopes = envelopes.filter((e) => e.type !== 'free' && e.type !== 'bonus')

  function getRule(envId: string) {
    return rules.find((r) => r.envelopeId === envId)
  }

  function startEdit(envId: string) {
    const rule = getRule(envId)
    setValue(rule ? String(rule.amount) : '')
    setEditing(envId)
  }

  function commitEdit(envId: string) {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      onUpdate({ envelopeId: envId, amount: num, percentage: 0, usePercentage: false })
    }
    setEditing(null)
    setValue('')
  }

  function handleReset() {
    onReset()
    setConfirming(false)
    onClose()
  }

  function handleClose() {
    setConfirming(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Réglages" size="md">
      <div className="flex flex-col gap-5">

        {/* Jour de virement */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-brand-400" />
            <p className="text-xs font-semibold uppercase tracking-widest text-ink/60">
              Jour de virement salaire
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PAY_DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => onPayDayChange(d)}
                className={clsx(
                  'rounded-xl border py-2.5 text-sm font-bold transition',
                  payDay === d
                    ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                    : 'border-ink/8 bg-surface-3 text-ink/60 hover:border-ink/20 hover:text-ink/70'
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink/50">
            Le bouton "Revenu mensuel" se débloque le{' '}
            <span className="text-ink/70 font-semibold">{payDay}</span> de chaque mois.
          </p>
        </div>

        {/* Règles de distribution */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/60 mb-3">
            Répartition automatique
          </p>
          <div className="flex flex-col gap-2">
            {nonFreeEnvelopes.map((env) => {
              const rule = getRule(env.id)
              const isEditing = editing === env.id
              return (
                <Card key={env.id} className="!p-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{env.name}</p>
                      <p className="text-xs text-ink/50 capitalize">{env.type}</p>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-28">
                          <Input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            suffix="F"
                            placeholder="0"
                          />
                        </div>
                        <button
                          onClick={() => commitEdit(env.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-emerald/10 text-accent-emerald hover:bg-accent-emerald/20 transition"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold font-mono text-ink">
                          {rule ? `${rule.amount.toLocaleString('fr-FR')} F` : '— F'}
                        </span>
                        <button
                          onClick={() => startEdit(env.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-3 text-ink/60 hover:text-ink transition"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-ink/50">
            Le reste va automatiquement dans le solde courant.
          </p>
        </div>

        {/* Zone danger — Réinitialisation */}
        <div className="border-t border-ink/5 pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink/40 mb-3">
            Zone de danger
          </p>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="flex w-full items-center gap-3 rounded-2xl border border-accent-rose/20 bg-accent-rose/5 px-4 py-3.5 text-left transition hover:bg-accent-rose/10"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-rose/10">
                <Trash2 size={15} className="text-accent-rose" />
              </div>
              <div>
                <p className="text-sm font-semibold text-accent-rose leading-tight">
                  Réinitialiser toutes les données
                </p>
                <p className="text-[10px] text-ink/50 mt-0.5">
                  Enveloppes, transactions, objectifs — tout sera effacé
                </p>
              </div>
            </button>
          ) : (
            <div className="rounded-2xl border border-accent-rose/30 bg-accent-rose/8 p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-accent-rose shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-ink">Confirmer la réinitialisation</p>
                  <p className="text-xs text-ink/60 mt-0.5">
                    Cette action est irréversible. Toutes tes enveloppes, transactions et objectifs seront définitivement supprimés.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" fullWidth onClick={() => setConfirming(false)}>
                  Annuler
                </Button>
                <button
                  onClick={handleReset}
                  className="rounded-2xl bg-accent-rose py-2.5 text-sm font-semibold text-white transition hover:bg-accent-rose/80 active:scale-[.98]"
                >
                  Tout effacer
                </button>
              </div>
            </div>
          )}
        </div>

        <Button fullWidth variant="secondary" onClick={handleClose}>Fermer</Button>
      </div>
    </Modal>
  )
}
