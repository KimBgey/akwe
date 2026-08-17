import { useMemo, useState } from 'react'
import { Transaction, Envelope, GoalWallet, CATEGORIES, Category, TransactionType } from '@/types'
import { TransactionRow } from './TransactionRow'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/utils/calculations'
import { Search, ChevronDown, ArrowLeftRight } from 'lucide-react'
import { format, startOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

interface TransactionHistoryProps {
  transactions: Transaction[]
  envelopes: Envelope[]
  goalWallets: GoalWallet[]
  categoryFilter: Category | 'all'
  onCategoryFilterChange: (category: Category | 'all') => void
}

const TYPE_FILTERS: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'expense', label: 'Dépenses' },
  { value: 'income', label: 'Revenus' },
  { value: 'transfer', label: 'Transferts' },
]

function monthKey(date: string) {
  return format(startOfMonth(new Date(date)), 'yyyy-MM')
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number)
  const label = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: fr })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function TransactionHistory({
  transactions,
  envelopes,
  goalWallets,
  categoryFilter,
  onCategoryFilterChange,
}: TransactionHistoryProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')

  const currentMonthKey = useMemo(() => format(startOfMonth(new Date()), 'yyyy-MM'), [])
  const [openMonths, setOpenMonths] = useState<Set<string>>(() => new Set([currentMonthKey]))

  const usedCategories = useMemo(() => {
    const present = new Set(transactions.map((t) => t.category))
    return (Object.keys(CATEGORIES) as Category[]).filter((c) => present.has(c))
  }, [transactions])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      if (q) {
        const catLabel = CATEGORIES[t.category as Category]?.label.toLowerCase() ?? ''
        if (!t.label.toLowerCase().includes(q) && !catLabel.includes(q)) return false
      }
      return true
    })
  }, [transactions, search, typeFilter, categoryFilter])

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const t of filtered) {
      const key = monthKey(t.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([key, items]) => ({
        key,
        items: [...items].sort((a, b) => (a.date < b.date ? 1 : -1)),
        income: items.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }))
  }, [filtered])

  function toggleMonth(key: string) {
    setOpenMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const hasActiveFilters = search.trim() !== '' || typeFilter !== 'all' || categoryFilter !== 'all'

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Rechercher une transaction…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        prefix={<Search size={14} />}
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTypeFilter(value)}
            className={clsx(
              'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition',
              typeFilter === value
                ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                : 'border-ink/10 bg-surface-3 text-ink/60 hover:text-ink/70'
            )}
          >
            {label}
          </button>
        ))}

        {usedCategories.length > 0 && (
          <>
            <span className="w-px my-1 bg-ink/10 shrink-0" />
            {usedCategories.map((key) => {
              const cat = CATEGORIES[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCategoryFilterChange(categoryFilter === key ? 'all' : key)}
                  className={clsx(
                    'shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    categoryFilter === key
                      ? 'border-brand-500/40 bg-brand-500/10 text-brand-300'
                      : 'border-ink/10 bg-surface-3 text-ink/60 hover:text-ink/70'
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-ink/50">
          <ArrowLeftRight size={32} className="opacity-30" />
          <p className="text-sm">
            {hasActiveFilters ? 'Aucun résultat pour ces filtres' : 'Aucune transaction'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {groups.map(({ key, items, income, expense }) => {
            const isOpen = openMonths.has(key)
            const net = income - expense
            return (
              <div key={key} className="rounded-xl border border-ink/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleMonth(key)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-3 transition hover:bg-ink/[0.02]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronDown
                      size={14}
                      className={clsx('shrink-0 text-ink/50 transition-transform', isOpen && 'rotate-180')}
                    />
                    <span className="text-sm font-semibold text-ink truncate">{monthLabel(key)}</span>
                    <span className="text-xs text-ink/50 shrink-0">· {items.length}</span>
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-bold font-mono shrink-0',
                      net >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
                    )}
                  >
                    {net >= 0 ? '+' : '-'}{formatCurrency(Math.abs(net))}
                  </span>
                </button>

                {isOpen && (
                  <div className="flex flex-col divide-y divide-ink/[0.04] px-3 pb-1 border-t border-ink/5">
                    {items.map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} envelopes={envelopes} goalWallets={goalWallets} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
