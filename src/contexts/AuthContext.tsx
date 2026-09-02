import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, signInWithGoogle, signOut as fbSignOut } from '@/lib/firebase'

// uid réservé au mode démo — reconnu par useBudget() pour ne jamais toucher Firestore.
export const DEMO_UID = 'demo-user'

export interface DemoUser {
  uid: string
  displayName: string
  email: string
  photoURL: string | null
}

interface AuthContextValue {
  user: User | DemoUser | null
  authLoading: boolean
  isDemo: boolean
  signInWithGoogle: () => Promise<void>
  enterDemoMode: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Firebase restaure automatiquement la session au refresh (IndexedDB)
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  async function handleSignIn() {
    await signInWithGoogle()
    // onAuthStateChanged met à jour user automatiquement
  }

  // Mode démo/test : aucune connexion réelle, aucune donnée envoyée à Firestore —
  // uniquement proposé en développement local (voir Landing.tsx).
  function enterDemoMode() {
    setDemoUser({ uid: DEMO_UID, displayName: 'Compte démo', email: 'demo@akwe.app', photoURL: null })
  }

  async function handleSignOut() {
    if (demoUser) {
      setDemoUser(null)
      return
    }
    await fbSignOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user: firebaseUser ?? demoUser,
        authLoading,
        isDemo: demoUser !== null,
        signInWithGoogle: handleSignIn,
        enterDemoMode,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
