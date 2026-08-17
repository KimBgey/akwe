import { useState, ReactNode } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { RightPanelProvider } from '@/contexts/RightPanelContext'
import { Dashboard } from '@/pages/Dashboard'
import { Wallets } from '@/pages/Wallets'
import { History } from '@/pages/History'
import { Settings } from '@/pages/Settings'
import { Guide } from '@/pages/Guide'
import { Landing } from '@/pages/Landing'
import { LayoutDashboard, Target, Clock, Settings as SettingsIcon, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/',         label: 'Tableau',    Icon: LayoutDashboard },
  { to: '/wallets',  label: 'Objectifs',  Icon: Target },
  { to: '/history',  label: 'Historique', Icon: Clock },
  { to: '/settings', label: 'Réglages',   Icon: SettingsIcon },
]

function Sidebar() {
  return (
    <nav className="flex flex-col rounded-3xl border border-ink/8 bg-surface-1/90 backdrop-blur-xl shadow-[0_8px_40px_rgb(var(--shadow-ambient)/calc(0.6*var(--shadow-scale)))] overflow-hidden h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-ink/5 shrink-0">
        <div>
          <img src="/logo.png" alt="Akwɛ" className="h-7 w-auto object-contain mb-0.5" />
          <p className="text-[10px] text-ink/50 leading-tight">Budget personnel</p>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-500/15 text-brand-300'
                  : 'text-ink/55 hover:text-ink/70 hover:bg-ink/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-brand-400' : 'text-current'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-safe">
      <div className="flex items-center gap-1 rounded-2xl border border-ink/10 bg-surface-1/90 backdrop-blur-xl p-2 mx-4 mb-4 shadow-[0_8px_32px_rgb(var(--shadow-ambient)/calc(0.5*var(--shadow-scale)))]">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-1 rounded-xl px-5 py-2.5 transition-all text-xs font-medium',
                isActive
                  ? 'bg-brand-500/15 text-brand-300'
                  : 'text-ink/50 hover:text-ink/60 hover:bg-ink/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-brand-400' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function AppShell() {
  const { user, authLoading } = useAuth()
  const [rightPanel, setRightPanel] = useState<ReactNode>(null)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </div>
    )
  }

  if (!user) return <Landing />

  return (
    <BrowserRouter>
      {/* Sombre forcé le temps de finaliser le contraste en mode clair sur l'app */}
      <div data-theme="dark" className="min-h-screen bg-surface-0 text-ink selection:bg-brand-500/30">

        {/* Ambient background blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ opacity: 'var(--ambient-opacity)' }}>
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-900/30 blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-accent-violet/10 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-48 w-48 rounded-full bg-accent-emerald/5 blur-3xl" />
        </div>

        {/* ── Desktop : grille 3 colonnes ──────────────────────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-[220px_1fr_300px] lg:gap-6 lg:px-6 lg:py-6 lg:min-h-screen lg:items-start relative">

          {/* Col 1 — Sidebar (sticky) */}
          <div className="sticky top-6 self-start">
            <Sidebar />
          </div>

          {/* Col 2 — Contenu principal */}
          <RightPanelProvider onPanel={setRightPanel}>
            <main className="min-w-0">
              <Routes>
                <Route path="/"         element={<Dashboard uid={user.uid} />} />
                <Route path="/wallets"  element={<Wallets   uid={user.uid} />} />
                <Route path="/history"  element={<History   uid={user.uid} />} />
                <Route path="/settings" element={<Settings  uid={user.uid} />} />
                <Route path="/guide"    element={<Guide />} />
              </Routes>
            </main>
          </RightPanelProvider>

          {/* Col 3 — Panneau droit (sticky, même hauteur que la sidebar) */}
          <div className="sticky top-6 self-start">
            {rightPanel}
          </div>
        </div>

        {/* ── Mobile : layout simple ───────────────────────────────────────── */}
        <div className="lg:hidden">
          <RightPanelProvider onPanel={setRightPanel}>
            <main className="relative px-4 pt-5 pb-28">
              <Routes>
                <Route path="/"         element={<Dashboard uid={user.uid} />} />
                <Route path="/wallets"  element={<Wallets   uid={user.uid} />} />
                <Route path="/history"  element={<History   uid={user.uid} />} />
                <Route path="/settings" element={<Settings  uid={user.uid} />} />
                <Route path="/guide"    element={<Guide />} />
              </Routes>
            </main>
          </RightPanelProvider>
        </div>

        <MobileNav />
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}
