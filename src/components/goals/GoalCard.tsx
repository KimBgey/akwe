import { GoalWallet } from '@/types'
import { getProgress, getMonthsLeft, formatCurrency } from '@/utils/calculations'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'
import { Calendar, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface GoalCardProps {
  goal: GoalWallet
  onClick?: () => void
}

export function GoalCard({ goal, onClick }: GoalCardProps) {
  const progress = getProgress(goal)
  const monthsLeft = getMonthsLeft(goal)
  const remaining = goal.targetAmount - goal.currentAmount

  return (
    <Card glow="emerald" onClick={onClick}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-emerald/10 text-xl">
              {goal.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{goal.name}</p>
              <Badge variant={goal.status} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Mensuel</p>
            <p className="text-sm font-semibold text-accent-emerald font-mono">
              +{formatCurrency(goal.monthlyContribution)}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span className="font-mono text-white font-semibold">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="font-mono">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <ProgressBar value={progress} color="emerald" />
          <div className="flex items-center justify-between mt-2 text-xs text-white/40">
            <span>{Math.round(progress * 100)}% atteint</span>
            <span className="font-mono">{formatCurrency(remaining)} restants</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-1 border-t border-white/5">
          {monthsLeft !== null && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <TrendingUp size={12} className="text-accent-emerald/70" />
              <span>{monthsLeft === 0 ? 'Objectif atteint !' : `${monthsLeft} mois`}</span>
            </div>
          )}
          {goal.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Calendar size={12} className="text-accent-amber/70" />
              <span>{format(new Date(goal.deadline), 'd MMM yyyy', { locale: fr })}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
