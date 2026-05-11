import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Target, Clock } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/',        label: 'Tableau',    Icon: LayoutDashboard },
  { to: '/wallets', label: 'Objectifs',  Icon: Target },
  { to: '/history', label: 'Historique', Icon: Clock },
]

export function Navbar() {
  return (
    <>
      {/* ── Desktop : sidebar verticale flottante ──────────────────────────── */}
      <nav className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 w-52 flex-col rounded-3xl border border-white/8 bg-surface-1/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]">

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand shadow-glow-brand">
            <span className="text-base font-black text-white leading-none">A</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight tracking-tight">Akwɛ</p>
            <p className="text-[10px] text-white/30 leading-tight">Budget personnel</p>
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
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-brand-500/15 text-brand-300'
                    : 'text-white/35 hover:text-white/70 hover:bg-white/5'
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

        {/* Bottom accent */}
        <div className="px-5 pb-5 pt-3 border-t border-white/5">
          <p className="text-[10px] text-white/20 text-center">v1.0</p>
        </div>
      </nav>

      {/* ── Mobile : barre de navigation en bas ────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-safe">
        <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-surface-1/90 backdrop-blur-xl p-2 mx-4 mb-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
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
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
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
    </>
  )
}
