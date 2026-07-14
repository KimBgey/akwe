import { Transaction, Envelope, GoalWallet, CATEGORIES, Category } from '@/types'
import { formatCurrency } from '@/utils/calculations'
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

const TYPE_ICON = {
  expense:  { Icon: ArrowUpRight,    color: 'text-accent-rose',    sign: '-' },
  income:   { Icon: ArrowDownLeft,   color: 'text-accent-emerald', sign: '+' },
  transfer: { Icon: ArrowLeftRight,  color: 'text-brand-400',      sign: '→' },
}

function getEnvelopeName(
  id: string,
  envelopes: Envelope[],
  goals: GoalWallet[]
): string {
  return (
    envelopes.find((e) => e.id === id)?.name ??
    goals.find((g) => g.id === id)?.name ??
    id
  )
}

export function TransactionRow({
  tx,
  envelopes,
  goalWallets,
}: {
  tx: Transaction
  envelopes: Envelope[]
  goalWallets: GoalWallet[]
}) {
  const { Icon, color, sign } = TYPE_ICON[tx.type]
  const catInfo = CATEGORIES[tx.category as Category]
  const envName = getEnvelopeName(tx.envelopeId, envelopes, goalWallets)

  return (
    <div className="flex items-center gap-4 py-3.5 transition hover:bg-white/[0.02] -mx-2 px-2 rounded-xl">
      <div
        className={clsx(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          `${color}/10`.replace('text-', 'bg-')
        )}
      >
        {catInfo ? (
          <span className="text-base">{catInfo.emoji}</span>
        ) : (
          <Icon size={15} className={color} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{tx.label}</p>
        <p className="text-xs text-white/30 truncate">
          {envName} ·{' '}
          {format(new Date(tx.date), 'd MMM yyyy', { locale: fr })}
        </p>
      </div>

      <p
        className={clsx(
          'text-sm font-bold font-mono shrink-0',
          tx.type === 'expense'
            ? 'text-accent-rose'
            : tx.type === 'income'
            ? 'text-accent-emerald'
            : 'text-brand-400'
        )}
      >
        {sign}{formatCurrency(tx.amount)}
      </p>
    </div>
  )
}
