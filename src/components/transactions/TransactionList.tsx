import { Transaction, Envelope, GoalWallet } from '@/types'
import { TransactionRow } from './TransactionRow'
import { ArrowLeftRight } from 'lucide-react'

interface TransactionListProps {
  transactions: Transaction[]
  envelopes: Envelope[]
  goalWallets: GoalWallet[]
  limit?: number
}

export function TransactionList({
  transactions,
  envelopes,
  goalWallets,
  limit,
}: TransactionListProps) {
  const items = limit ? transactions.slice(0, limit) : transactions

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-white/30">
        <ArrowLeftRight size={32} className="opacity-30" />
        <p className="text-sm">Aucune transaction</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-white/[0.04]">
      {items.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} envelopes={envelopes} goalWallets={goalWallets} />
      ))}
    </div>
  )
}
