import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { SyncStatus } from '@/hooks/useBudget'
import { LogOut, Cloud, CloudOff, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const SYNC_DOT: Record<SyncStatus, string> = {
  local:   'bg-white/20',
  syncing: 'bg-brand-400 animate-pulse',
  synced:  'bg-accent-emerald',
  error:   'bg-accent-amber',
}

const SYNC_LABEL: Record<SyncStatus, string> = {
  local:   'Local uniquement',
  syncing: 'Synchronisation…',
  synced:  'Sauvegardé',
  error:   'Hors ligne',
}

interface UserMenuProps {
  syncStatus: SyncStatus
}

export function UserMenu({ syncStatus }: UserMenuProps) {
  const { user, signOut } = useAuth()
  const [open, setOpen]                     = useState(false)
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setConfirmingSignOut(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div ref={ref} className="relative">
      {/* Avatar + dot de sync */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-white/10 transition hover:border-white/20"
      >
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        )}
        {/* Dot de sync — seul indicateur visible, 8px en bas à droite */}
        <span
          className={clsx(
            'absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full border border-surface-1',
            SYNC_DOT[syncStatus]
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-white/10 bg-surface-1 shadow-[0_16px_48px_rgba(0,0,0,0.5)] animate-fade-up">
          {/* Infos utilisateur */}
          <div className="border-b border-white/5 px-4 py-3">
            <p className="text-sm font-semibold text-white truncate">
              {user?.displayName ?? 'Utilisateur'}
            </p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>

          {/* Statut sync */}
          <div className="border-b border-white/5 px-4 py-3 flex items-center gap-2.5">
            {syncStatus === 'syncing' ? (
              <Loader2 size={13} className="text-brand-400 animate-spin shrink-0" />
            ) : syncStatus === 'synced' ? (
              <Cloud size={13} className="text-accent-emerald shrink-0" />
            ) : (
              <CloudOff size={13} className="text-accent-amber shrink-0" />
            )}
            <span className="text-xs text-white/50">{SYNC_LABEL[syncStatus]}</span>
          </div>

          {/* Déconnexion */}
          <div className="p-2">
            {!confirmingSignOut ? (
              <button
                onClick={() => setConfirmingSignOut(true)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-accent-rose/80 transition hover:bg-accent-rose/10 hover:text-accent-rose"
              >
                <LogOut size={14} />
                Se déconnecter
              </button>
            ) : (
              <div className="flex flex-col gap-2 px-1 py-1">
                <p className="text-xs text-white/40 px-2">Tu seras redirigé vers la page de connexion.</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setConfirmingSignOut(false)}
                    className="rounded-xl border border-white/10 bg-surface-3 py-2 text-xs font-medium text-white/50 transition hover:text-white/80"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={signOut}
                    className="rounded-xl bg-accent-rose py-2 text-xs font-semibold text-white transition hover:bg-accent-rose/80"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
