import { Envelope, GoalWallet, DistributionRule, BudgetState } from '@/types'

export function getBalance(envelope: Envelope): number {
  return envelope.allocatedAmount - envelope.spentAmount
}

export function getProgress(goal: GoalWallet): number {
  if (goal.targetAmount === 0) return 0
  return Math.min(goal.currentAmount / goal.targetAmount, 1)
}

export function getMonthsLeft(goal: GoalWallet): number | null {
  if (goal.monthlyContribution <= 0) return null
  const remaining = goal.targetAmount - goal.currentAmount
  if (remaining <= 0) return 0
  return Math.ceil(remaining / goal.monthlyContribution)
}

export function computeDistribution(
  income: number,
  rules: DistributionRule[]
): Record<string, number> {
  const result: Record<string, number> = {}
  let totalFixed = 0

  for (const rule of rules) {
    const amount = rule.usePercentage
      ? (income * rule.percentage) / 100
      : rule.amount
    result[rule.envelopeId] = amount
    totalFixed += amount
  }

  return { ...result, __free: Math.max(0, income - totalFixed) }
}

export function getFreeEnvelope(state: BudgetState): Envelope | undefined {
  return state.envelopes.find((e) => e.type === 'free')
}

export function getFreeBalance(state: BudgetState): number {
  const free = getFreeEnvelope(state)
  return free ? getBalance(free) : 0
}

export function formatCurrency(amount: number, currency = 'F'): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(amount))} ${currency}`
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1)
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

// Mois du cycle en cours selon le jour de virement.
// Si aujourd'hui >= payDay  → cycle du mois actuel
// Si aujourd'hui < payDay   → cycle du mois précédent
export function getCycleMonth(payDay: number): string {
  const today = new Date()
  if (today.getDate() >= payDay) {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  }
  const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
}

// Le bouton revenu est disponible si on est >= payDay ET que le revenu n'a pas encore été saisi ce cycle
export function isIncomeAvailable(state: BudgetState): boolean {
  const today = new Date()
  if (today.getDate() < state.payDay) return false
  return state.lastIncomeMonth !== getCycleMonth(state.payDay)
}

// Date du prochain virement (affichage)
export function nextPayDate(payDay: number): Date {
  const today = new Date()
  if (today.getDate() < payDay) {
    return new Date(today.getFullYear(), today.getMonth(), payDay)
  }
  return new Date(today.getFullYear(), today.getMonth() + 1, payDay)
}

// Reliquat = on est à la date de virement, solde > 0, revenu pas encore saisi ce cycle
export function hasReliquat(state: BudgetState): boolean {
  return isIncomeAvailable(state) && getFreeBalance(state) > 0
}
