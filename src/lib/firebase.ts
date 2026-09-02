import { initializeApp } from 'firebase/app'
import { initializeFirestore, doc, type DocumentReference } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

// ignoreUndefinedProperties : un champ `undefined` glissé par erreur dans l'état
// (ex. lockedSince sur une enveloppe qui n'en a pas besoin) ne doit jamais faire
// planter setDoc() — Firestore l'ignore simplement plutôt que de lever une erreur.
export const db   = initializeFirestore(app, { ignoreUndefinedProperties: true })
export const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signOut() {
  await fbSignOut(auth)
}

export function budgetRef(uid: string): DocumentReference {
  return doc(db, 'budgets', uid)
}

// ─── Règles Firestore (console Firebase > Firestore > Rules) ──────────────────
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /budgets/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────
