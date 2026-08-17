import { useReducer, useEffect, useCallback, useRef, useState } from 'react'
import { getDoc, setDoc } from 'firebase/firestore'
import { budgetRef } from '@/lib/firebase'
import {
  BudgetState,
  GoalWallet,
  Transaction,
  DistributionRule,
  ReliquatAction,
} from '@/types'
import { computeDistribution, getCurrentMonth, getCycleMonth, getFreeBalance } from '@/utils/calculations'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const DEFAULT_STATE: BudgetState = {
  envelopes: [
    {
      id: 'locked-main',
      name: 'Épargne bloquée',
      type: 'locked',
      allocatedAmount: 0,
      spentAmount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'fixed-main',
      name: 'Charges fixes',
      type: 'fixed',
      allocatedAmount: 0,
      spentAmount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'free-main',
      name: 'Solde courant',
      type: 'free',
      allocatedAmount: 0,
      spentAmount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'bonus-main',
      name: 'Bonus mensuel',
      type: 'bonus',
      allocatedAmount: 0,
      spentAmount: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  goalWallets: [],
  transactions: [],
  distributionRules: [
    { envelopeId: 'locked-main', amount: 70000, percentage: 0, usePercentage: false },
    { envelopeId: 'fixed-main', amount: 30000, percentage: 0, usePercentage: false },
  ],
  monthlyIncome: 0,
  currentMonth: getCurrentMonth(),
  snapshots: [],
  payDay: 25,
  lastIncomeMonth: '',
}

type Action =
  | { type: 'ADD_INCOME'; payload: { amount: number } }
  | { type: 'ADD_EXPENSE'; payload: { envelopeId: string; amount: number; category: string; label: string } }
  | { type: 'TRANSFER_TO_GOAL'; payload: { goalId: string; amount: number; label: string; sourceEnvelopeId: string } }
  | { type: 'ADD_GOAL'; payload: Omit<GoalWallet, 'id' | 'createdAt' | 'spentAmount' | 'allocatedAmount' | 'currentAmount'> }
  | { type: 'UPDATE_GOAL'; payload: Partial<GoalWallet> & { id: string } }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'UPDATE_DISTRIBUTION_RULE'; payload: DistributionRule }
  | { type: 'REMOVE_DISTRIBUTION_RULE'; payload: { envelopeId: string } }
  | { type: 'UPDATE_ENVELOPE_NAME'; payload: { id: string; name: string } }
  | { type: 'HANDLE_RELIQUAT'; payload: { action: ReliquatAction; goalId?: string } }
  | { type: 'UNLOCK_LOCKED'; payload: { envelopeId: string; amount: number } }
  | { type: 'ADD_UNEXPECTED_INCOME'; payload: { amount: number; label: string; allocation: 'bonus' | 'free' | 'locked' | 'goal' | 'distribute'; goalId?: string } }
  | { type: 'SET_PAY_DAY'; payload: { day: number } }
  | { type: 'RESET_MONTH' }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD'; payload: BudgetState }

function reducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case 'LOAD':
      return migrateState(action.payload)

    case 'ADD_INCOME': {
      const { amount } = action.payload
      const cycleMonth = getCycleMonth(state.payDay)

      // Si un reliquat existe (solde courant > 0 d'un cycle précédent),
      // on l'archive automatiquement dans le portefeuille Bonus mensuel
      // avant de traiter le nouveau revenu.
      const reliquat = getFreeBalance(state)
      let stateWithReliquat = state

      if (reliquat > 0 && state.lastIncomeMonth !== cycleMonth) {
        const bonusTx: Transaction = {
          id: generateId(),
          amount: reliquat,
          type: 'transfer',
          envelopeId: 'bonus-main',
          category: 'reliquat',
          label: `Reliquat ${state.lastIncomeMonth || 'précédent'} → Bonus`,
          date: new Date().toISOString(),
        }
        stateWithReliquat = {
          ...state,
          envelopes: state.envelopes.map((e) => {
            if (e.type === 'free') return { ...e, spentAmount: e.spentAmount + reliquat }
            if (e.type === 'bonus') return { ...e, allocatedAmount: e.allocatedAmount + reliquat }
            return e
          }),
          transactions: [bonusTx, ...state.transactions],
        }
      }

      const distribution = computeDistribution(amount, stateWithReliquat.distributionRules)
      const freeAmount = distribution['__free'] ?? 0

      const updatedEnvelopes = stateWithReliquat.envelopes.map((env) => {
        if (env.type === 'free') return { ...env, allocatedAmount: env.allocatedAmount + freeAmount }
        return { ...env, allocatedAmount: env.allocatedAmount + (distribution[env.id] ?? 0) }
      })

      const incomeTransaction: Transaction = {
        id: generateId(),
        amount,
        type: 'income',
        envelopeId: 'free-main',
        category: 'revenu',
        label: 'Revenu mensuel',
        date: new Date().toISOString(),
      }

      return {
        ...stateWithReliquat,
        monthlyIncome: amount,
        currentMonth: cycleMonth,
        lastIncomeMonth: cycleMonth,
        envelopes: updatedEnvelopes,
        transactions: [incomeTransaction, ...stateWithReliquat.transactions],
      }
    }

    case 'ADD_EXPENSE': {
      const { envelopeId, amount, category, label } = action.payload
      const envelope = state.envelopes.find((e) => e.id === envelopeId)
      if (!envelope || envelope.type === 'locked') return state

      const transaction: Transaction = {
        id: generateId(),
        amount,
        type: 'expense',
        envelopeId,
        category,
        label,
        date: new Date().toISOString(),
      }

      return {
        ...state,
        envelopes: state.envelopes.map((e) =>
          e.id === envelopeId ? { ...e, spentAmount: e.spentAmount + amount } : e
        ),
        transactions: [transaction, ...state.transactions],
      }
    }

    case 'TRANSFER_TO_GOAL': {
      const { goalId, amount, label, sourceEnvelopeId } = action.payload
      const sourceEnv = state.envelopes.find((e) => e.id === sourceEnvelopeId)
      const goal = state.goalWallets.find((g) => g.id === goalId)
      if (!sourceEnv || !goal) return state

      const sourceBalance = sourceEnv.allocatedAmount - sourceEnv.spentAmount
      if (sourceBalance < amount) return state

      const transaction: Transaction = {
        id: generateId(),
        amount,
        type: 'transfer',
        envelopeId: goalId,
        category: 'transfert',
        label,
        date: new Date().toISOString(),
      }

      const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
      const completed = newCurrentAmount >= goal.targetAmount

      return {
        ...state,
        envelopes: state.envelopes.map((e) =>
          e.id === sourceEnvelopeId ? { ...e, spentAmount: e.spentAmount + amount } : e
        ),
        goalWallets: state.goalWallets.map((g) =>
          g.id === goalId
            ? { ...g, currentAmount: newCurrentAmount, status: completed ? 'completed' : g.status }
            : g
        ),
        transactions: [transaction, ...state.transactions],
      }
    }

    case 'ADD_GOAL': {
      const goal: GoalWallet = {
        ...action.payload,
        id: generateId(),
        allocatedAmount: 0,
        spentAmount: 0,
        currentAmount: 0,
        createdAt: new Date().toISOString(),
      }
      return { ...state, goalWallets: [...state.goalWallets, goal] }
    }

    case 'UPDATE_GOAL':
      return {
        ...state,
        goalWallets: state.goalWallets.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload } : g
        ),
      }

    case 'DELETE_GOAL':
      return {
        ...state,
        goalWallets: state.goalWallets.filter((g) => g.id !== action.payload.id),
      }

    case 'UPDATE_DISTRIBUTION_RULE': {
      const exists = state.distributionRules.some((r) => r.envelopeId === action.payload.envelopeId)
      return {
        ...state,
        distributionRules: exists
          ? state.distributionRules.map((r) =>
              r.envelopeId === action.payload.envelopeId ? action.payload : r
            )
          : [...state.distributionRules, action.payload],
      }
    }

    case 'REMOVE_DISTRIBUTION_RULE':
      return {
        ...state,
        distributionRules: state.distributionRules.filter(
          (r) => r.envelopeId !== action.payload.envelopeId
        ),
      }

    case 'UPDATE_ENVELOPE_NAME':
      return {
        ...state,
        envelopes: state.envelopes.map((e) =>
          e.id === action.payload.id ? { ...e, name: action.payload.name } : e
        ),
      }

    case 'HANDLE_RELIQUAT': {
      const freeEnv = state.envelopes.find((e) => e.type === 'free')
      if (!freeEnv) return state
      const balance = freeEnv.allocatedAmount - freeEnv.spentAmount
      if (balance <= 0) return state

      if (action.payload.action === 'carryover') {
        return state
      }

      if (action.payload.action === 'save') {
        const lockedEnv = state.envelopes.find((e) => e.type === 'locked')
        if (!lockedEnv) return state
        const tx: Transaction = {
          id: generateId(),
          amount: balance,
          type: 'transfer',
          envelopeId: lockedEnv.id,
          category: 'epargne',
          label: 'Reliquat → Épargne',
          date: new Date().toISOString(),
        }
        return {
          ...state,
          envelopes: state.envelopes.map((e) => {
            if (e.type === 'free') return { ...e, spentAmount: e.spentAmount + balance }
            if (e.type === 'locked') return { ...e, allocatedAmount: e.allocatedAmount + balance }
            return e
          }),
          transactions: [tx, ...state.transactions],
        }
      }

      if (action.payload.action === 'boost_goal' && action.payload.goalId) {
        const { goalId } = action.payload
        const goal = state.goalWallets.find((g) => g.id === goalId)
        if (!goal) return state
        const newCurrentAmount = Math.min(goal.currentAmount + balance, goal.targetAmount)
        const completed = newCurrentAmount >= goal.targetAmount
        const tx: Transaction = {
          id: generateId(),
          amount: balance,
          type: 'transfer',
          envelopeId: goalId,
          category: 'boost',
          label: `Reliquat → ${goal.name}`,
          date: new Date().toISOString(),
        }
        return {
          ...state,
          envelopes: state.envelopes.map((e) =>
            e.type === 'free' ? { ...e, spentAmount: e.spentAmount + balance } : e
          ),
          goalWallets: state.goalWallets.map((g) =>
            g.id === goalId
              ? { ...g, currentAmount: newCurrentAmount, status: completed ? 'completed' : g.status }
              : g
          ),
          transactions: [tx, ...state.transactions],
        }
      }

      if (action.payload.action === 'bonus_mensuel') {
        const bonusEnv = state.envelopes.find((e) => e.type === 'bonus')
        if (!bonusEnv) return state
        const tx: Transaction = {
          id: generateId(),
          amount: balance,
          type: 'transfer',
          envelopeId: bonusEnv.id,
          category: 'reliquat',
          label: 'Reliquat → Bonus mensuel',
          date: new Date().toISOString(),
        }
        return {
          ...state,
          envelopes: state.envelopes.map((e) => {
            if (e.type === 'free') return { ...e, spentAmount: e.spentAmount + balance }
            if (e.type === 'bonus') return { ...e, allocatedAmount: e.allocatedAmount + balance }
            return e
          }),
          transactions: [tx, ...state.transactions],
        }
      }

      return state
    }

    case 'SET_PAY_DAY':
      return { ...state, payDay: action.payload.day }

    case 'UNLOCK_LOCKED': {
      const { envelopeId, amount } = action.payload
      const tx: Transaction = {
        id: generateId(),
        amount,
        type: 'expense',
        envelopeId,
        category: 'deblocage',
        label: 'Retrait exceptionnel épargne',
        date: new Date().toISOString(),
      }
      return {
        ...state,
        envelopes: state.envelopes.map((e) =>
          e.id === envelopeId ? { ...e, spentAmount: e.spentAmount + amount } : e
        ),
        transactions: [tx, ...state.transactions],
      }
    }

    case 'ADD_UNEXPECTED_INCOME': {
      const { amount, label, allocation, goalId } = action.payload
      const baseTx: Transaction = {
        id: generateId(),
        amount,
        type: 'income',
        envelopeId: 'free-main',
        category: 'inattendu',
        label,
        date: new Date().toISOString(),
      }

      if (allocation === 'bonus') {
        const bonusEnv = state.envelopes.find((e) => e.type === 'bonus')
        if (!bonusEnv) return state
        return {
          ...state,
          envelopes: state.envelopes.map((e) =>
            e.type === 'bonus' ? { ...e, allocatedAmount: e.allocatedAmount + amount } : e
          ),
          transactions: [{ ...baseTx, envelopeId: bonusEnv.id, category: 'bonus' }, ...state.transactions],
        }
      }

      if (allocation === 'free') {
        return {
          ...state,
          envelopes: state.envelopes.map((e) =>
            e.type === 'free' ? { ...e, allocatedAmount: e.allocatedAmount + amount } : e
          ),
          transactions: [baseTx, ...state.transactions],
        }
      }

      if (allocation === 'locked') {
        const lockedEnv = state.envelopes.find((e) => e.type === 'locked')
        if (!lockedEnv) return state
        return {
          ...state,
          envelopes: state.envelopes.map((e) =>
            e.type === 'locked' ? { ...e, allocatedAmount: e.allocatedAmount + amount } : e
          ),
          transactions: [{ ...baseTx, envelopeId: lockedEnv.id, category: 'epargne' }, ...state.transactions],
        }
      }

      if (allocation === 'goal' && goalId) {
        const goal = state.goalWallets.find((g) => g.id === goalId)
        if (!goal) return state
        const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
        const completed = newCurrentAmount >= goal.targetAmount
        return {
          ...state,
          goalWallets: state.goalWallets.map((g) =>
            g.id === goalId
              ? { ...g, currentAmount: newCurrentAmount, status: completed ? 'completed' : g.status }
              : g
          ),
          transactions: [{ ...baseTx, envelopeId: goalId, type: 'transfer', category: 'inattendu' }, ...state.transactions],
        }
      }

      if (allocation === 'distribute') {
        const distribution = computeDistribution(amount, state.distributionRules)
        const freeAmount = distribution['__free'] ?? 0
        return {
          ...state,
          envelopes: state.envelopes.map((env) => {
            if (env.type === 'free') return { ...env, allocatedAmount: env.allocatedAmount + freeAmount }
            const allocated = distribution[env.id] ?? 0
            return { ...env, allocatedAmount: env.allocatedAmount + allocated }
          }),
          transactions: [baseTx, ...state.transactions],
        }
      }

      return state
    }

    case 'RESET_MONTH': {
      const snapshot = {
        month: state.currentMonth,
        income: state.monthlyIncome,
        totalAllocated: state.envelopes.reduce((s, e) => s + e.allocatedAmount, 0),
        totalSpent: state.envelopes.reduce((s, e) => s + e.spentAmount, 0),
        freeBalance: 0,
      }
      return {
        ...state,
        envelopes: state.envelopes.map((e) =>
          e.type === 'bonus' ? e : { ...e, allocatedAmount: 0, spentAmount: 0 }
        ),
        monthlyIncome: 0,
        currentMonth: getCurrentMonth(),
        snapshots: [snapshot, ...state.snapshots],
      }
    }

    case 'RESET_ALL':
      return DEFAULT_STATE

    default:
      return state
  }
}

const LS_KEY = 'akwe_v1'

function migrateState(raw: BudgetState): BudgetState {
  const legacyBonus = raw.goalWallets.find((g) => g.id === 'bonus-mensuel')
  const legacyAmount = legacyBonus ? (legacyBonus as { currentAmount: number }).currentAmount : 0

  const hasBonusEnv = raw.envelopes.some((e) => e.type === 'bonus')
  let envelopes = hasBonusEnv
    ? raw.envelopes
    : [
        ...raw.envelopes,
        {
          id: 'bonus-main',
          name: 'Bonus mensuel',
          type: 'bonus' as const,
          allocatedAmount: 0,
          spentAmount: 0,
          createdAt: new Date().toISOString(),
        },
      ]

  if (legacyAmount > 0) {
    envelopes = envelopes.map((e) =>
      e.type === 'bonus' ? { ...e, allocatedAmount: e.allocatedAmount + legacyAmount } : e
    )
  }

  return {
    ...raw,
    envelopes,
    goalWallets: raw.goalWallets.filter((g) => g.id !== 'bonus-mensuel'),
  }
}

function readLocalStorage(): BudgetState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? migrateState(JSON.parse(raw) as BudgetState) : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error'

// uid : UID Firebase de l'utilisateur connecté (fourni par AuthContext)
export function useBudget(uid: string) {
  // Lecture synchrone du localStorage → pas de scintillement au refresh
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE, readLocalStorage)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing')

  // Vrai une fois le getDoc initial terminé — évite d'écraser Firestore avant lecture
  const firestoreReadyRef = useRef(false)

  // ── 1. localStorage — cache local immédiat ───────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }, [state])

  // ── 2. Firestore — chargement initial quand l'uid est connu ─────────────────
  useEffect(() => {
    setSyncStatus('syncing')
    getDoc(budgetRef(uid))
      .then(async (snap) => {
        if (snap.exists()) {
          // Firestore prime sur localStorage (source de vérité multi-appareils)
          dispatch({ type: 'LOAD', payload: snap.data() as BudgetState })
        } else {
          // Nouveau compte Google : on migre les données localStorage existantes
          await setDoc(budgetRef(uid), readLocalStorage())
        }
        firestoreReadyRef.current = true
        setSyncStatus('synced')
      })
      .catch((err: Error) => {
        console.error('[Akwɛ] Firestore read failed:', err.message)
        firestoreReadyRef.current = true
        setSyncStatus('error')
      })
  // uid ne change pas pendant la session — on lance une seule fois
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  // ── 3. Firestore — écriture à chaque changement d'état ──────────────────────
  useEffect(() => {
    if (!firestoreReadyRef.current) return
    setSyncStatus('syncing')
    setDoc(budgetRef(uid), state)
      .then(() => setSyncStatus('synced'))
      .catch((err: Error) => {
        console.error('[Akwɛ] Firestore write failed:', err.message)
        setSyncStatus('error')
      })
  }, [state, uid])

  const addIncome = useCallback((amount: number) => {
    dispatch({ type: 'ADD_INCOME', payload: { amount } })
  }, [])

  const addExpense = useCallback(
    (envelopeId: string, amount: number, category: string, label: string) => {
      dispatch({ type: 'ADD_EXPENSE', payload: { envelopeId, amount, category, label } })
    },
    []
  )

  const transferToGoal = useCallback((goalId: string, amount: number, label: string, sourceEnvelopeId: string) => {
    dispatch({ type: 'TRANSFER_TO_GOAL', payload: { goalId, amount, label, sourceEnvelopeId } })
  }, [])

  const addGoal = useCallback(
    (goal: Omit<GoalWallet, 'id' | 'createdAt' | 'spentAmount' | 'allocatedAmount' | 'currentAmount'>) => {
      dispatch({ type: 'ADD_GOAL', payload: goal })
    },
    []
  )

  const updateGoal = useCallback((update: Partial<GoalWallet> & { id: string }) => {
    dispatch({ type: 'UPDATE_GOAL', payload: update })
  }, [])

  const deleteGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: { id } })
  }, [])

  const updateDistributionRule = useCallback((rule: DistributionRule) => {
    dispatch({ type: 'UPDATE_DISTRIBUTION_RULE', payload: rule })
  }, [])

  const removeDistributionRule = useCallback((envelopeId: string) => {
    dispatch({ type: 'REMOVE_DISTRIBUTION_RULE', payload: { envelopeId } })
  }, [])

  const handleReliquat = useCallback((action: ReliquatAction, goalId?: string) => {
    dispatch({ type: 'HANDLE_RELIQUAT', payload: { action, goalId } })
  }, [])

  const unlockLocked = useCallback((envelopeId: string, amount: number) => {
    dispatch({ type: 'UNLOCK_LOCKED', payload: { envelopeId, amount } })
  }, [])

  const setPayDay = useCallback((day: number) => {
    dispatch({ type: 'SET_PAY_DAY', payload: { day } })
  }, [])

  const addUnexpectedIncome = useCallback(
    (amount: number, label: string, allocation: 'bonus' | 'free' | 'locked' | 'goal' | 'distribute', goalId?: string) => {
      dispatch({ type: 'ADD_UNEXPECTED_INCOME', payload: { amount, label, allocation, goalId } })
    },
    []
  )

  const resetMonth = useCallback(() => {
    dispatch({ type: 'RESET_MONTH' })
  }, [])

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' })
  }, [])

  return {
    state,
    syncStatus,
    addIncome,
    addExpense,
    transferToGoal,
    addGoal,
    updateGoal,
    deleteGoal,
    updateDistributionRule,
    removeDistributionRule,
    handleReliquat,
    unlockLocked,
    addUnexpectedIncome,
    setPayDay,
    resetMonth,
    resetAll,
  }
}
