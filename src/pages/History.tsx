import { useEffect, useState } from 'react'
import { useBudget } from '@/hooks/useBudget'
import { useRightPanel } from '@/contexts/RightPanelContext'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatCurrency } from '@/utils/calculations'
import { CATEGORIES, Category, Transaction } from '@/types'
import { ArrowDownLeft, TrendingUp, Wallet } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const COLORS = ['#577DFF', '#00E5A0', '#FFB547', '#FF4D6D', '#9B5DE5', '#00CFFF', '#FF6B6B', '#4ECDC4']

function StatPanel({ transactions }: { transactions: Transaction[] }) {
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const byCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
        Statistiques
      </p>

      <Card className="p-4 flex flex-col gap-4">
        {/* Income / Expenses / Balance */}
        <div className="flex flex-col gap-2.5">
          {[
            { icon: ArrowDownLeft, label: 'Revenus',  value: totalIncome,   color: 'text-accent-emerald' },
            { icon: TrendingUp,    label: 'Dépenses', value: totalExpenses,  color: 'text-accent-rose' },
            { icon: Wallet,        label: 'Solde net', value: balance,       color: balance >= 0 ? 'text-brand-300' : 'text-accent-rose' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/40">
                <Icon size={13} />
                <span className="text-xs">{label}</span>
              </div>
              <span className={`text-sm font-bold font-mono ${color}`}>
                {value >= 0 ? '' : '-'}{formatCurrency(Math.abs(value))}
              </span>
            </div>
          ))}
        </div>

        {/* Top categories */}
        {topCategories.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-1">
              Top catégories
            </p>
            {topCategories.map(([key, amount], i) => {
              const cat = CATEGORIES[key as Category]
              const pct = totalExpenses > 0 ? amount / totalExpenses : 0
              return (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{cat?.emoji ?? '💡'}</span>
                      <span className="text-xs text-white/60 truncate max-w-[110px]">
                        {cat?.label ?? key}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40 shrink-0">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <ProgressBar
                    value={pct}
                    color={(['brand', 'emerald', 'amber', 'rose', 'violet'] as const)[i % 5]}
                    size="sm"
                  />
                </div>
              )
            })}
          </div>
        )}

        {transactions.length === 0 && (
          <p className="text-xs text-white/30 text-center py-2">Aucune transaction</p>
        )}
      </Card>
    </div>
  )
}

export function History({ uid }: { uid: string }) {
  const { state } = useBudget(uid)
  const setRightPanel = useRightPanel()
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all')

  const expensesByCategory = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount
      return acc
    }, {})

  const chartData = Object.entries(expensesByCategory)
    .map(([key, total]) => ({
      key: key as Category,
      name: CATEGORIES[key as Category]?.label ?? key,
      emoji: CATEGORIES[key as Category]?.emoji ?? '💡',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  const totalExpenses = state.transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  useEffect(() => {
    setRightPanel(<StatPanel transactions={state.transactions} />)
    return () => setRightPanel(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transactions])

  return (
    <div className="flex flex-col gap-8">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-widest text-white/30">Historique</p>
        <h1 className="text-xl font-bold text-white leading-tight truncate">Transactions</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Total dépensé</p>
          <p className="text-xl font-bold font-mono text-accent-rose">{formatCurrency(totalExpenses)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Transactions</p>
          <p className="text-xl font-bold text-white">{state.transactions.length}</p>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
              Dépenses par catégorie
            </h2>
            {categoryFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className="text-[11px] font-medium text-brand-300 hover:text-brand-200"
              >
                Réinitialiser
              </button>
            )}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{
                  background: '#1A1D26',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatCurrency(value), 'Dépenses']}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={COLORS[idx % COLORS.length]}
                    fillOpacity={categoryFilter === 'all' || categoryFilter === entry.key ? 1 : 0.25}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setCategoryFilter(categoryFilter === entry.key ? 'all' : entry.key)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-[11px] text-white/25">
            Clique une barre pour filtrer la liste ci-dessous
          </p>
        </Card>
      )}

      {/* Full transaction list */}
      <Card>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-4">
          Toutes les transactions
        </h2>
        <TransactionHistory
          transactions={state.transactions}
          envelopes={state.envelopes}
          goalWallets={state.goalWallets}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
        />
      </Card>
    </div>
  )
}
