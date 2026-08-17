import { useState, useEffect } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { useRightPanel } from '@/contexts/RightPanelContext'
import { getFreeBalance, formatCurrency } from '@/utils/calculations'
import { GoalCard } from '@/components/goals/GoalCard'
import { AddGoalModal } from '@/components/goals/AddGoalModal'
import { TransferModal } from '@/components/goals/TransferModal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Plus, Target, Trophy, TrendingUp } from 'lucide-react'
import { GoalWallet } from '@/types'

function GoalsSummaryPanel({ goals }: { goals: GoalWallet[] }) {
  const active    = goals.filter((g) => g.status === 'active')
  const completed = goals.filter((g) => g.status === 'completed')

  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0)
  const totalTarget = goals.filter((g) => g.targetAmount > 0).reduce((s, g) => s + g.targetAmount, 0)
  const globalPct   = totalTarget > 0 ? Math.min(totalSaved / totalTarget, 1) : 0

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">
        Vue d'ensemble
      </p>

      <Card className="p-4 flex flex-col gap-4">
        {/* Global progress */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink/50 mb-0.5">Total épargné</p>
              <p className="text-xl font-bold font-mono text-ink">{formatCurrency(totalSaved)}</p>
            </div>
            <p className="text-xs font-mono text-ink/60">{Math.round(globalPct * 100)}%</p>
          </div>
          <ProgressBar value={globalPct} color="emerald" />
          {totalTarget > 0 && (
            <p className="text-[10px] text-ink/50 mt-1.5">
              sur {formatCurrency(totalTarget)} visés
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 border-t border-ink/5 pt-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-ink/50">
              <TrendingUp size={11} />
              <span className="text-[10px] uppercase tracking-wider">En cours</span>
            </div>
            <p className="text-lg font-bold text-ink">{active.length}</p>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-ink/50">
              <Trophy size={11} />
              <span className="text-[10px] uppercase tracking-wider">Atteints</span>
            </div>
            <p className="text-lg font-bold text-accent-emerald">{completed.length}</p>
          </div>
        </div>

        {/* Active goals compact list */}
        {active.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-ink/5 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-ink/40 mb-1">Objectifs actifs</p>
            {active.map((g) => {
              const pct = g.targetAmount > 0 ? Math.min(g.currentAmount / g.targetAmount, 1) : 0
              return (
                <div key={g.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{g.icon}</span>
                      <span className="text-xs font-medium text-ink/70 truncate max-w-[110px]">{g.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-ink/60 shrink-0">
                      {Math.round(pct * 100)}%
                    </span>
                  </div>
                  <ProgressBar value={pct} color="emerald" size="sm" />
                </div>
              )
            })}
          </div>
        )}

        {goals.length === 0 && (
          <p className="text-xs text-ink/50 text-center py-2">Aucun objectif créé</p>
        )}
      </Card>
    </div>
  )
}

export function Wallets({ uid }: { uid: string }) {
  const { state, addGoal, updateGoal, deleteGoal, transferToGoal } = useBudget(uid)
  const setRightPanel = useRightPanel()

  const [showAdd, setShowAdd]           = useState(false)
  const [editingGoal, setEditingGoal]   = useState<GoalWallet | null>(null)
  const [showTransfer, setShowTransfer] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<GoalWallet | null>(null)

  const freeBalance  = getFreeBalance(state)
  const activeGoals  = state.goalWallets.filter((g) => g.status === 'active')
  const completedGoals = state.goalWallets.filter((g) => g.status === 'completed')

  useEffect(() => {
    setRightPanel(<GoalsSummaryPanel goals={state.goalWallets} />)
    return () => setRightPanel(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.goalWallets])

  function handleGoalClick(goal: GoalWallet) {
    setSelectedGoal(goal)
    setShowTransfer(true)
  }

  function handleEditGoal(goal: GoalWallet) {
    setEditingGoal(goal)
    setShowAdd(true)
  }

  function closeAddModal() {
    setShowAdd(false)
    setEditingGoal(null)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-ink/50">Portefeuilles</p>
          <h1 className="text-xl font-bold text-ink leading-tight truncate">Objectifs</h1>
        </div>
        <div className="shrink-0">
          <Button onClick={() => { setEditingGoal(null); setShowAdd(true) }} size="sm">
            <Plus size={14} />
            Nouveau
          </Button>
        </div>
      </div>

      {/* Free balance reminder */}
      <Card className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">Solde disponible</p>
          <p className="text-xl font-bold font-mono text-accent-emerald">{formatCurrency(freeBalance)}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowTransfer(true)}>
          <Target size={14} />
          Verser
        </Button>
      </Card>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/50 mb-4">
            En cours ({activeGoals.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeGoals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onClick={() => handleGoalClick(g)}
                onEdit={() => handleEditGoal(g)}
                onMarkAchieved={() => updateGoal({ id: g.id, status: 'completed' })}
                onDelete={() => deleteGoal(g.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-ink/50 mb-4">
            Atteints ({completedGoals.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {completedGoals.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                onEdit={() => handleEditGoal(g)}
                onDelete={() => deleteGoal(g.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {state.goalWallets.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-ink/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-3xl">🎯</div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink/70">Aucun objectif</p>
            <p className="text-xs mt-1">Crée ton premier portefeuille objectif</p>
          </div>
          <Button onClick={() => { setEditingGoal(null); setShowAdd(true) }}>
            <Plus size={14} />
            Créer un objectif
          </Button>
        </div>
      )}

      <AddGoalModal
        open={showAdd}
        onClose={closeAddModal}
        onAdd={addGoal}
        onUpdate={updateGoal}
        goal={editingGoal}
      />
      <TransferModal
        open={showTransfer}
        onClose={() => { setShowTransfer(false); setSelectedGoal(null) }}
        goals={selectedGoal ? [selectedGoal] : state.goalWallets}
        sources={state.envelopes.filter((e) => e.type === 'free' || e.type === 'bonus')}
        onTransfer={transferToGoal}
      />
    </div>
  )
}
