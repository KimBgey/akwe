import { Envelope, GoalWallet } from '@/types'
import { getBalance, getProgress, getMonthsLeft, formatCurrency } from '@/utils/calculations'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Lock, TrendingDown, Wallet, Target, AlertTriangle, Coins } from 'lucide-react'
import clsx from 'clsx'

const TYPE_CONFIG = {
  locked: {
    icon: Lock,
    iconBg: 'bg-accent-violet/10',
    iconColor: 'text-accent-violet',
    glow: 'none' as const,
    progressColor: 'violet' as const,
  },
  fixed: {
    icon: TrendingDown,
    iconBg: 'bg-accent-amber/10',
    iconColor: 'text-accent-amber',
    glow: 'amber' as const,
    progressColor: 'amber' as const,
  },
  free: {
    icon: Wallet,
    iconBg: 'bg-brand-500/10',
    iconColor: 'text-brand-400',
    glow: 'brand' as const,
    progressColor: 'brand' as const,
  },
  goal: {
    icon: Target,
    iconBg: 'bg-accent-emerald/10',
    iconColor: 'text-accent-emerald',
    glow: 'emerald' as const,
    progressColor: 'emerald' as const,
  },
  bonus: {
    icon: Coins,
    iconBg: 'bg-accent-cyan/10',
    iconColor: 'text-accent-cyan',
    glow: 'none' as const,
    progressColor: 'brand' as const,
  },
}

interface EnvelopeCardProps {
  envelope: Envelope | GoalWallet
  onClick?: () => void
}

export function EnvelopeCard({ envelope, onClick }: EnvelopeCardProps) {
  const cfg = TYPE_CONFIG[envelope.type]
  const Icon = cfg.icon
  const balance = getBalance(envelope)
  const isGoal = envelope.type === 'goal'
  const goal = isGoal ? (envelope as GoalWallet) : null
  const isOverdrawn = balance < 0 && envelope.type !== 'locked' && !isGoal

  const displayProgress = isGoal
    ? getProgress(goal!)
    : envelope.allocatedAmount > 0
    ? Math.min(envelope.spentAmount / envelope.allocatedAmount, 1)
    : 0

  return (
    <Card glow={isOverdrawn ? 'none' : cfg.glow} onClick={onClick} className="group">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', cfg.iconBg)}>
              <Icon size={18} className={cfg.iconColor} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{envelope.name}</p>
              <Badge
                variant={
                  isGoal
                    ? (goal!.status as 'active' | 'completed' | 'paused')
                    : (envelope.type as 'locked' | 'fixed' | 'free' | 'bonus')
                }
              />
            </div>
          </div>

          {isOverdrawn && (
            <div className="flex items-center gap-1.5 rounded-full bg-accent-rose/10 px-2.5 py-1 text-xs font-semibold text-accent-rose">
              <AlertTriangle size={12} />
              Dépassé
            </div>
          )}
        </div>

        {isGoal ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-ink/60 mb-0.5">Épargné</p>
                <p className="text-xl font-bold text-ink font-mono">
                  {formatCurrency(goal!.currentAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink/60 mb-0.5">Objectif</p>
                <p className="text-sm font-semibold text-ink/60 font-mono">
                  {formatCurrency(goal!.targetAmount)}
                </p>
              </div>
            </div>
            <ProgressBar value={displayProgress} color={cfg.progressColor} />
            <div className="flex items-center justify-between text-xs text-ink/60">
              <span>{Math.round(displayProgress * 100)}% atteint</span>
              {getMonthsLeft(goal!) !== null && (
                <span>{getMonthsLeft(goal!)} mois restants</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-ink/60 mb-0.5">Solde</p>
              <p className={clsx('text-xl font-bold font-mono whitespace-nowrap', isOverdrawn ? 'text-accent-rose' : 'text-ink')}>
                {formatCurrency(balance)}
              </p>
              {envelope.type !== 'locked' && (
                <p className="text-[11px] text-ink/55 mt-0.5 whitespace-nowrap">
                  Dépensé&nbsp;
                  <span className="font-semibold text-ink/70">{formatCurrency(envelope.spentAmount)}</span>
                </p>
              )}
            </div>

            {envelope.type !== 'locked' && envelope.allocatedAmount > 0 && (
              <>
                <ProgressBar value={displayProgress} color={isOverdrawn ? 'rose' : cfg.progressColor} />
                <div className="flex justify-between text-xs text-ink/60">
                  <span>{Math.round(displayProgress * 100)}% utilisé</span>
                  <span>Alloué : {formatCurrency(envelope.allocatedAmount)}</span>
                </div>
              </>
            )}

            {envelope.type === 'locked' && (
              <div className="flex items-center gap-2 rounded-xl bg-accent-violet/5 border border-accent-violet/15 px-3 py-2">
                <Lock size={12} className="text-accent-violet/70" />
                <span className="text-xs text-ink/60">Retrait avec confirmation uniquement</span>
              </div>
            )}

            {envelope.type === 'bonus' && envelope.allocatedAmount === 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-accent-cyan/5 border border-accent-cyan/10 px-3 py-2">
                <Coins size={12} className="text-accent-cyan/60" />
                <span className="text-xs text-ink/60">Revenus imprévus et reliquats</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
