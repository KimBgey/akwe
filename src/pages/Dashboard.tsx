import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBudget } from '@/hooks/useBudget'
import { useRightPanel } from '@/contexts/RightPanelContext'
import {
  getBalance, getFreeBalance, formatCurrency, formatMonth,
  isIncomeAvailable, hasReliquat, nextPayDate,
} from '@/utils/calculations'
import { Card } from '@/components/ui/Card'
import { EnvelopeCard } from '@/components/envelopes/EnvelopeCard'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { IncomeModal } from '@/components/dashboard/IncomeModal'
import { ReliquatModal } from '@/components/dashboard/ReliquatModal'
import { TransferModal } from '@/components/goals/TransferModal'
import { UserMenu } from '@/components/layout/UserMenu'
import { UnexpectedIncomeModal } from '@/components/dashboard/UnexpectedIncomeModal'
import {
  ArrowDownLeft, ArrowRightLeft, TrendingUp,
  Sparkles, Lock, Wallet, Target, Banknote, CalendarClock, Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function Dashboard({ uid }: { uid: string }) {
  const {
    state, syncStatus,
    addIncome, addExpense, transferToGoal,
    handleReliquat, addUnexpectedIncome,
  } = useBudget(uid)

  const setRightPanel = useRightPanel()

  const [showIncome, setShowIncome]         = useState(false)
  const [showUnexpected, setShowUnexpected] = useState(false)
  const [showExpense, setShowExpense]       = useState(false)
  const [showTransfer, setShowTransfer]     = useState(false)
  const [showReliquat, setShowReliquat]     = useState(false)

  const freeBalance   = getFreeBalance(state)
  const totalAssets   = state.envelopes.reduce((s, e) => s + getBalance(e), 0)
                      + state.goalWallets.reduce((s, g) => s + g.currentAmount, 0)
  const lockedBalance = getBalance(state.envelopes.find((e) => e.type === 'locked') ?? state.envelopes[0])
  const totalGoals    = state.goalWallets.reduce((s, g) => s + g.currentAmount, 0)

  const canEnterIncome     = isIncomeAvailable(state)
  const showReliquatBanner = hasReliquat(state)
  const nextPay            = nextPayDate(state.payDay)
  const hasTransactions    = state.transactions.length > 0

  // Injecte le panneau droit (desktop) dans le slot de App.tsx
  useEffect(() => {
    setRightPanel(
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
            Récentes
          </p>
          {hasTransactions && (
            <span className="text-[10px] text-white/20">
              {state.transactions.length} transactions
            </span>
          )}
        </div>

        {hasTransactions ? (
          <>
            <Card className="p-4">
              <TransactionList
                transactions={state.transactions}
                envelopes={state.envelopes}
                goalWallets={state.goalWallets}
                limit={6}
              />
            </Card>
            <Link
              to="/history"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-surface-2 py-3 text-xs font-medium text-white/40 transition hover:bg-surface-3 hover:text-white/70"
            >
              <Clock size={12} />
              Voir tout l'historique
            </Link>
          </>
        ) : (
          <Card className="p-6 flex flex-col items-center gap-3 text-center">
            <p className="text-3xl">📋</p>
            <p className="text-sm text-white/30">Aucune transaction pour le moment</p>
          </Card>
        )}
      </div>
    )
    return () => setRightPanel(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transactions, state.envelopes, state.goalWallets])

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-widest text-white/30 truncate">
            {formatMonth(state.currentMonth)}
          </p>
          <h1 className="text-xl font-bold text-white leading-tight truncate">Tableau de bord</h1>
        </div>
        <div className="shrink-0">
          <UserMenu syncStatus={syncStatus} />
        </div>
      </div>

      {/* Patrimoine mensuel */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-px shadow-glow-brand">
        <div className="relative rounded-2xl bg-surface-1 px-5 py-4 overflow-hidden">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-brand-500/15 blur-2xl pointer-events-none" />
          <p className="text-[11px] uppercase tracking-widest text-white/30 mb-1">Patrimoine mensuel</p>
          <p className="text-3xl font-bold text-white font-mono leading-none mb-1">
            {formatCurrency(totalAssets)}
          </p>
          <p className="text-xs text-white/40 mb-4">
            dont{' '}
            <span className="font-semibold text-accent-emerald">{formatCurrency(freeBalance)}</span>
            {' '}disponible
          </p>
          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
            {[
              { icon: Lock,   label: 'Épargne',    value: formatCurrency(lockedBalance),       color: 'text-accent-violet' },
              { icon: Target, label: 'Objectifs',   value: formatCurrency(totalGoals),          color: 'text-accent-emerald' },
              { icon: Wallet, label: 'Revenu mois', value: formatCurrency(state.monthlyIncome), color: 'text-brand-300' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1 text-white/30">
                  <Icon size={10} />
                  <span className="text-[10px] uppercase tracking-wider">{label}</span>
                </div>
                <p className={`text-sm font-bold font-mono ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions 2×2 */}
      <div className="grid grid-cols-2 gap-2">
        {canEnterIncome ? (
          <button
            onClick={() => setShowIncome(true)}
            className="flex items-center gap-3 rounded-2xl bg-gradient-brand px-4 py-3.5 text-left shadow-glow-brand transition active:scale-[.97]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <ArrowDownLeft size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Revenu mensuel</p>
              <p className="text-[10px] text-white/60">Disponible</p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-surface-2 px-4 py-3.5 opacity-60">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-3">
              <CalendarClock size={16} className="text-white/30" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/40 leading-tight">Revenu mensuel</p>
              <p className="text-[10px] text-white/30">
                Prochain : {format(nextPay, 'd MMM', { locale: fr })}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowUnexpected(true)}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-2 px-4 py-3.5 text-left transition hover:bg-surface-3 active:scale-[.97]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-3">
            <Banknote size={16} className="text-white/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60 leading-tight">Inattendu</p>
            <p className="text-[10px] text-white/30">Bonus, cadeau…</p>
          </div>
        </button>

        <button
          onClick={() => setShowExpense(true)}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-2 px-4 py-3.5 text-left transition hover:bg-surface-3 active:scale-[.97]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-3">
            <TrendingUp size={16} className="text-white/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60 leading-tight">Dépense</p>
            <p className="text-[10px] text-white/30">Enregistrer</p>
          </div>
        </button>

        <button
          onClick={() => setShowTransfer(true)}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-2 px-4 py-3.5 text-left transition hover:bg-surface-3 active:scale-[.97]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-3">
            <ArrowRightLeft size={16} className="text-white/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/60 leading-tight">Objectif</p>
            <p className="text-[10px] text-white/30">Virer vers</p>
          </div>
        </button>
      </div>

      {/* Reliquat banner */}
      {showReliquatBanner && (
        <button
          onClick={() => setShowReliquat(true)}
          className="flex items-center gap-3 rounded-2xl border border-accent-amber/25 bg-accent-amber/5 px-4 py-3 text-left transition hover:bg-accent-amber/10 active:scale-[.99]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-amber/15">
            <Sparkles size={14} className="text-accent-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              Reliquat de {formatMonth(state.lastIncomeMonth || state.currentMonth)}
            </p>
            <p className="text-xs text-white/40 truncate">
              {formatCurrency(freeBalance)} non utilisés — À gérer avant le nouveau revenu
            </p>
          </div>
          <TrendingUp size={13} className="text-accent-amber/50 shrink-0" />
        </button>
      )}

      {/* Enveloppes */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
          Enveloppes
        </p>
        <div className="grid grid-cols-2 gap-3">
          {state.envelopes.map((env) => (
            <EnvelopeCard key={env.id} envelope={env} />
          ))}
        </div>
      </div>

      {/* Récentes — mobile uniquement */}
      {hasTransactions && (
        <Card className="p-4 lg:hidden">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">
            Récentes
          </p>
          <TransactionList
            transactions={state.transactions}
            envelopes={state.envelopes}
            goalWallets={state.goalWallets}
            limit={5}
          />
          <Link
            to="/history"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-surface-3 py-2.5 text-xs font-medium text-white/40 transition hover:text-white/70"
          >
            <Clock size={12} />
            Voir tout l'historique
          </Link>
        </Card>
      )}

      {/* Modals */}
      <IncomeModal
        open={showIncome}
        onClose={() => setShowIncome(false)}
        onSubmit={addIncome}
        distributionRules={state.distributionRules}
        envelopes={state.envelopes}
      />
      <UnexpectedIncomeModal
        open={showUnexpected}
        onClose={() => setShowUnexpected(false)}
        goals={state.goalWallets}
        onSubmit={addUnexpectedIncome}
      />
      <TransactionForm
        open={showExpense}
        onClose={() => setShowExpense(false)}
        envelopes={state.envelopes}
        onSubmit={addExpense}
      />
      <TransferModal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        goals={state.goalWallets}
        sources={state.envelopes.filter((e) => e.type === 'free' || e.type === 'bonus')}
        onTransfer={transferToGoal}
      />
      <ReliquatModal
        open={showReliquat}
        onClose={() => setShowReliquat(false)}
        balance={freeBalance}
        month={formatMonth(state.lastIncomeMonth || state.currentMonth)}
        goals={state.goalWallets}
        onAction={handleReliquat}
      />
    </div>
  )
}
