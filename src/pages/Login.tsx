import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export function Login() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue'
      // popup fermée volontairement par l'utilisateur — pas une vraie erreur
      if (!msg.includes('popup-closed')) setError('Connexion annulée ou échouée.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-900/40 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-accent-violet/15 blur-3xl" />
      </div>

      {/* Scattered coins */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none">
        {/* Top-left — flou fort, loin */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute top-[6%] left-[4%] w-20 opacity-30 rotate-[22deg]"
          style={{ filter: 'blur(5px)' }} />
        {/* Top-right — net, proche */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute top-[12%] right-[9%] w-14 opacity-60 -rotate-[14deg]" />
        {/* Mid-left — flou léger */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute top-[42%] left-[2%] w-11 opacity-25 rotate-[48deg]"
          style={{ filter: 'blur(4px)' }} />
        {/* Mid-right — flou moyen */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute top-[38%] right-[4%] w-16 opacity-40 -rotate-[30deg]"
          style={{ filter: 'blur(3px)' }} />
        {/* Bottom-left — flou fort */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute bottom-[18%] left-[10%] w-24 opacity-20 rotate-[12deg]"
          style={{ filter: 'blur(7px)' }} />
        {/* Bottom-right — net, proche */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute bottom-[22%] right-[6%] w-18 opacity-55 -rotate-[8deg]" />
        {/* Top-center-right — petit, net */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute top-[3%] right-[30%] w-10 opacity-45 rotate-[60deg]" />
        {/* Bottom-center-left — flou léger */}
        <img src="/piece.png" alt="" aria-hidden
          className="absolute bottom-[8%] left-[30%] w-12 opacity-30 -rotate-[20deg]"
          style={{ filter: 'blur(3px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-3">
              {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4  shrink-0">
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Akwɛ" className="h-7 w-auto object-contain mb-0.5" />
          <div className="text-center">
            <p className="text-sm text-white/40 mt-1">Budget personnel — Système d'enveloppes</p>
          </div>
        </div>
      </div>

        {/* Card */}
        <div className="w-full rounded-3xl border border-white/10 bg-surface-1 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <p className="text-center text-sm text-white/50 mb-6">
            Connecte-toi pour accéder à ton budget sur tous tes appareils.
          </p>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin text-white/60" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Connexion…' : 'Continuer avec Google'}
          </button>

          {error && (
            <p className="mt-4 text-center text-xs text-accent-rose">{error}</p>
          )}
        </div>

        <p className="text-center text-xs text-white/20 max-w-xs">
          Tes données sont chiffrées et liées à ton compte Google. Aucun accès tiers.
        </p>
      </div>
    </div>
  )
}
