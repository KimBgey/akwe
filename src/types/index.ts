export type EnvelopeType = 'locked' | 'fixed' | 'free' | 'goal' | 'bonus'

export type GoalStatus = 'active' | 'completed' | 'paused'

export type TransactionType = 'expense' | 'transfer' | 'income'

export type ReliquatAction = 'carryover' | 'boost_goal' | 'save' | 'bonus_mensuel'

export interface Envelope {
  id: string
  name: string
  type: EnvelopeType
  allocatedAmount: number
  spentAmount: number
  createdAt: string
  lockedSince?: string | null // enveloppe 'locked' uniquement — date du dernier apport, réinitialisée à chaque ajout
}

export interface GoalWallet extends Envelope {
  type: 'goal'
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  deadline: string | null
  status: GoalStatus
  color: string
  icon: string
  archived?: boolean // objectif atteint et rangé, masqué de la vue principale
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  envelopeId: string
  category: string
  label: string
  date: string
}

export interface DistributionRule {
  envelopeId: string
  amount: number
  percentage: number
  usePercentage: boolean
}

export interface MonthlySnapshot {
  month: string
  income: number
  totalAllocated: number
  totalSpent: number
  freeBalance: number
}

export interface BudgetState {
  envelopes: Envelope[]
  goalWallets: GoalWallet[]
  transactions: Transaction[]
  distributionRules: DistributionRule[]
  monthlyIncome: number
  currentMonth: string
  snapshots: MonthlySnapshot[]
  payDay: number        // jour du mois du virement (1-31)
  lastIncomeMonth: string // YYYY-MM du dernier revenu saisi
  lockDurationMonths: number // durée de blocage glissante de l'épargne bloquée
}

export type Category =
  | 'alimentation'
  | 'transport'
  | 'loisirs'
  | 'sante'
  | 'education'
  | 'vetements'
  | 'restaurant'
  | 'abonnement'
  | 'loyer'
  | 'telephone'
  | 'autre'

export const CATEGORIES: Record<Category, { label: string; emoji: string }> = {
  alimentation: { label: 'Alimentation', emoji: '🛒' },
  transport:    { label: 'Transport', emoji: '🚌' },
  loisirs:      { label: 'Loisirs', emoji: '🎮' },
  sante:        { label: 'Santé', emoji: '💊' },
  education:    { label: 'Éducation', emoji: '📚' },
  vetements:    { label: 'Vêtements', emoji: '👕' },
  restaurant:   { label: 'Restaurant', emoji: '🍽️' },
  abonnement:   { label: 'Abonnement', emoji: '📱' },
  loyer:        { label: 'Loyer', emoji: '🏠' },
  telephone:    { label: 'Téléphone', emoji: '📞' },
  autre:        { label: 'Autre', emoji: '💡' },
}
