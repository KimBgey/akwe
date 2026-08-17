import { useState, useRef, useEffect } from 'react'
import { GoalWallet } from '@/types'
import { getProgress, getMonthsLeft, formatCurrency } from '@/utils/calculations'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Calendar, TrendingUp, MoreVertical, Pencil, CheckCircle2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface GoalCardProps {
  goal: GoalWallet
  onClick?: () => void
  onEdit?: () => void
  onMarkAchieved?: () => void
  onDelete?: () => void
}

function GoalCardMenu({ goal, onEdit, onMarkAchieved, onDelete }: {
  goal: GoalWallet
  onEdit?: () => void
  onMarkAchieved?: () => void
  onDelete?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/40 transition hover:bg-ink/5 hover:text-ink/70"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-ink/10 bg-surface-2 shadow-card-hover overflow-hidden animate-fade-up"
        >
          {!confirmDelete ? (
            <div className="p-1.5">
              {onEdit && (
                <button
                  onClick={() => { setOpen(false); onEdit() }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                >
                  <Pencil size={13} />
                  Modifier
                </button>
              )}
              {onMarkAchieved && goal.status !== 'completed' && (
                <button
                  onClick={() => { setOpen(false); onMarkAchieved() }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-ink/70 transition hover:bg-accent-emerald/10 hover:text-accent-emerald"
                >
                  <CheckCircle2 size={13} />
                  Marquer comme atteint
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-accent-rose/80 transition hover:bg-accent-rose/10 hover:text-accent-rose"
                >
                  <Trash2 size={13} />
                  Supprimer
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              <p className="text-xs text-ink/60">Supprimer définitivement cet objectif ?</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-ink/10 bg-surface-3 py-1.5 text-[11px] font-medium text-ink/60 transition hover:text-ink"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { setOpen(false); setConfirmDelete(false); onDelete?.() }}
                  className="rounded-lg bg-accent-rose py-1.5 text-[11px] font-semibold text-white transition hover:bg-accent-rose/80"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function GoalCard({ goal, onClick, onEdit, onMarkAchieved, onDelete }: GoalCardProps) {
  const progress = getProgress(goal)
  const monthsLeft = getMonthsLeft(goal)
  const remaining = goal.targetAmount - goal.currentAmount
  const hasMenu = Boolean(onEdit || onMarkAchieved || onDelete)

  return (
    <Card glow="emerald" onClick={onClick}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-emerald/10 text-xl">
              {goal.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{goal.name}</p>
              <Badge variant={goal.status} />
            </div>
          </div>
          <div className="flex items-start gap-1 shrink-0">
            <div className="text-right">
              <p className="text-xs text-ink/60">Mensuel</p>
              <p className="text-sm font-semibold text-accent-emerald font-mono whitespace-nowrap">
                +{formatCurrency(goal.monthlyContribution)}
              </p>
            </div>
            {hasMenu && (
              <GoalCardMenu goal={goal} onEdit={onEdit} onMarkAchieved={onMarkAchieved} onDelete={onDelete} />
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-ink/60 mb-2">
            <span className="font-mono text-ink font-semibold">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="font-mono">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <ProgressBar value={progress} color="emerald" />
          <div className="flex items-center justify-between mt-2 text-xs text-ink/60">
            <span>{Math.round(progress * 100)}% atteint</span>
            <span className="font-mono">{formatCurrency(remaining)} restants</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1 border-t border-ink/5">
          {monthsLeft !== null && (
            <div className="flex items-center gap-1.5 text-xs text-ink/60">
              <TrendingUp size={12} className="text-accent-emerald/70" />
              <span>{monthsLeft === 0 ? 'Objectif atteint !' : `${monthsLeft} mois`}</span>
            </div>
          )}
          {goal.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-ink/60">
              <Calendar size={12} className="text-accent-amber/70" />
              <span>{format(new Date(goal.deadline), 'd MMM yyyy', { locale: fr })}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
