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

// Date de déblocage de l'épargne bloquée : dernier apport + durée glissante.
// null si aucun apport n'a encore été fait (rien à débloquer).
export function getLockUnlockDate(envelope: Envelope, lockDurationMonths: number): Date | null {
  if (!envelope.lockedSince) return null
  const since = new Date(envelope.lockedSince)
  const unlock = new Date(since)
  unlock.setMonth(unlock.getMonth() + lockDurationMonths)
  return unlock
}

export function isLockUnlocked(envelope: Envelope, lockDurationMonths: number): boolean {
  const unlockDate = getLockUnlockDate(envelope, lockDurationMonths)
  if (!unlockDate) return true // rien de bloqué, rien à attendre
  return new Date() >= unlockDate
}

// Nombre de mois pleins restants avant déblocage (0 si déjà débloquée)
export function getLockMonthsRemaining(envelope: Envelope, lockDurationMonths: number): number {
  const unlockDate = getLockUnlockDate(envelope, lockDurationMonths)
  if (!unlockDate) return 0
  const now = new Date()
  if (now >= unlockDate) return 0
  const months =
    (unlockDate.getFullYear() - now.getFullYear()) * 12 +
    (unlockDate.getMonth() - now.getMonth()) +
    (unlockDate.getDate() > now.getDate() ? 1 : 0)
  return Math.max(1, months)
}

// Progression du blocage : mois écoulés depuis le début / durée totale — pour l'affichage "X mois / N"
export function getLockProgress(envelope: Envelope, lockDurationMonths: number): { elapsed: number; total: number } {
  if (!envelope.lockedSince) return { elapsed: 0, total: lockDurationMonths }
  const since = new Date(envelope.lockedSince)
  const now = new Date()
  let months = (now.getFullYear() - since.getFullYear()) * 12 + (now.getMonth() - since.getMonth())
  if (now.getDate() < since.getDate()) months -= 1
  months = Math.max(0, Math.min(months, lockDurationMonths))
  return { elapsed: months, total: lockDurationMonths }
}
