import { useState, ReactNode } from 'react'
import clsx from 'clsx'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EnvelopeCard } from '@/components/envelopes/EnvelopeCard'
import { formatCurrency } from '@/utils/calculations'
import { Envelope, GoalWallet, CATEGORIES } from '@/types'
import {
  Loader2, Wallet, Target, Lock, Coins, Sparkles, Tags,
  LogIn, SlidersHorizontal, LineChart,
  PlusSquare, WifiOff, RefreshCw, Signal, BatteryFull, PlayCircle,
  LayoutDashboard, Clock, Settings as SettingsIcon,
  ArrowDownLeft, Banknote, TrendingUp, ArrowRightLeft, Sun, Moon,
  TrendingDown, PiggyBank, EyeOff, HelpCircle, Star, User,
  CreditCard, RotateCcw, Users, Mail, MessageCircle,
} from 'lucide-react'

const PAINS_ROW_1 = [
  { icon: TrendingDown, title: 'Le salaire qui s’évapore', text: 'Il arrive le jour J, et une semaine plus tard tu te demandes déjà où il est passé.' },
  { icon: PiggyBank, title: 'L’épargne qui n’arrive jamais', text: 'Tu te dis que ce mois-ci sera différent. Il y a toujours une raison de ne pas mettre de côté.' },
  { icon: EyeOff, title: 'Les dépenses invisibles', text: 'Un café ici, un trajet là. Rien de grave — jusqu’à ce que tu additionnes.' },
  { icon: HelpCircle, title: 'Le reliquat qui se volatilise', text: 'Tu sais qu’il te restait de l’argent. Tu ne sais plus où il est passé.' },
]

const PAINS_ROW_2 = [
  { icon: Target, title: 'Les objectifs qui restent des rêves', text: 'Tu voulais partir en voyage cette année. Le compte à rebours a juste… disparu.' },
  { icon: CreditCard, title: 'La carte qui débite plus vite que prévu', text: 'Un clic, un abonnement de plus. Tu additionnes à la fin du mois, trop tard.' },
  { icon: RotateCcw, title: 'Le mois qui recommence sans plan', text: 'Chaque 1er, tu repars de zéro, sans savoir ce qui a marché le mois d’avant.' },
  { icon: Users, title: 'L’argent prêté qu’on ne revoit jamais', text: 'Tu dépannes, bien sûr. Mais personne ne dépanne ton budget en retour.' },
]

const TESTIMONIALS = [
  { quote: 'Enfin je sais exactement où va mon argent, sans y penser.', role: 'Profil type · jeune actif' },
  { quote: 'Le reliquat qui se transforme en objectif automatiquement, c’est exactement ce qu’il me manquait.', role: 'Profil type · freelance' },
  { quote: 'Simple, rapide, et ça tient enfin mes bonnes résolutions à ma place.', role: 'Profil type · étudiant' },
  { quote: 'Je n’ai jamais tenu un budget plus de deux semaines avant ça.', role: 'Profil type · commerçant' },
  { quote: 'Voir mes enveloppes se remplir automatiquement, ça change tout.', role: 'Profil type · salarié' },
]

function Marquee({ children, reverse, duration = 34 }: { children: ReactNode; reverse?: boolean; duration?: number }) {
  return (
    <div
      className="group/marquee relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
    >
      <div
        className={clsx(
          'flex w-max gap-4 group-hover/marquee:[animation-play-state:paused]',
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        )}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

const PREVIEW_FIXED: Envelope = { id: 'preview-fixed', name: 'Charges fixes', type: 'fixed', allocatedAmount: 180000, spentAmount: 96000, createdAt: '' }
const PREVIEW_FREE: Envelope  = { id: 'preview-free',  name: 'Solde courant',  type: 'free',  allocatedAmount: 120000, spentAmount: 45000, createdAt: '' }
const PREVIEW_GOAL: GoalWallet = {
  id: 'preview-goal', name: 'Voyage à Abidjan', type: 'goal', allocatedAmount: 0, spentAmount: 0, createdAt: '',
  targetAmount: 500000, currentAmount: 210000, monthlyContribution: 50000, deadline: null, status: 'active',
  color: '', icon: '',
}

const FAKE_TRANSACTIONS = [
  { emoji: CATEGORIES.alimentation.emoji, label: 'Supermarché', sub: CATEGORIES.alimentation.label, amount: -12000 },
  { emoji: CATEGORIES.transport.emoji,    label: 'Essence',     sub: CATEGORIES.transport.label,    amount: -25000 },
  { emoji: CATEGORIES.restaurant.emoji,   label: 'Restaurant',  sub: CATEGORIES.restaurant.label,   amount: -8000 },
  { emoji: '💰', label: 'Revenu mensuel', sub: 'Salaire', amount: 350000 },
]

const CATEGORY_COUNT = Object.keys(CATEGORIES).length

const STEPS = [
  {
    icon: LogIn, number: '01', title: 'Connecte-toi',
    text: 'Un compte Google suffit, aucune inscription à remplir.',
    card: 'bg-gradient-brand', iconBox: 'bg-white/15', iconColor: 'text-white',
    numberColor: 'text-white/15', titleColor: 'text-white', textColor: 'text-white/70',
  },
  {
    icon: SlidersHorizontal, number: '02', title: 'Distribue ton revenu',
    text: 'Définis tes règles une fois, elles s’appliquent chaque mois.',
    card: 'border border-ink/8 bg-surface-2', iconBox: 'border border-ink/10 bg-ink/[0.03]', iconColor: 'text-brand-400',
    numberColor: 'text-ink/[0.04]', titleColor: 'text-ink', textColor: 'text-ink/65',
  },
  {
    icon: LineChart, number: '03', title: 'Suis ta progression',
    text: 'Objectifs, dépenses et reliquat, au même endroit.',
    card: 'bg-accent-emerald', iconBox: 'bg-surface-0/15', iconColor: 'text-surface-0',
    numberColor: 'text-surface-0/15', titleColor: 'text-surface-0', textColor: 'text-surface-0/70',
  },
]

const INSTALL_POINTS = [
  { icon: PlusSquare, text: "Ajoute l'icône à ton écran d'accueil, comme une app native" },
  { icon: WifiOff, text: 'Consulte ton budget même sans connexion internet' },
  { icon: RefreshCw, text: 'Mises à jour automatiques, rien à faire de ton côté' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

const PHONE_QUICK_ACTIONS = [
  { icon: ArrowDownLeft, title: 'Revenu mensuel', sub: 'Prochain : 25 juil.' },
  { icon: Banknote, title: 'Inattendu', sub: 'Bonus, cadeau…' },
  { icon: TrendingUp, title: 'Dépense', sub: 'Enregistrer' },
  { icon: ArrowRightLeft, title: 'Objectif', sub: 'Virer vers' },
]

const PHONE_NAV = [
  { icon: LayoutDashboard, label: 'Tableau', active: true },
  { icon: Target, label: 'Objectifs', active: false },
  { icon: Clock, label: 'Historique', active: false },
  { icon: SettingsIcon, label: 'Réglages', active: false },
]

function PhoneDashboardPreview() {
  return (
    <div className="flex h-full w-full flex-col gap-2.5 overflow-hidden bg-surface-0 px-3 pb-2.5 pt-2 text-ink">
      {/* Status bar */}
      <div className="flex items-center justify-between px-1 text-[9px] text-ink/60">
        <span className="font-medium">9:41</span>
        <div className="flex items-center gap-1">
          <Signal size={9} />
          <BatteryFull size={9} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <p className="text-[7px] uppercase tracking-widest text-ink/50">Juin 2026</p>
          <p className="text-[13px] font-bold leading-tight text-ink">Tableau de bord</p>
        </div>
        <div className="h-6 w-6 rounded-full bg-gradient-brand" />
      </div>

      {/* Patrimoine mini card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-brand p-px shadow-glow-brand shrink-0">
        <div className="relative rounded-xl bg-surface-1 px-3 py-2.5">
          <p className="text-[7px] uppercase tracking-widest text-ink/50">Patrimoine mensuel</p>
          <p className="mt-0.5 font-mono text-lg font-bold leading-none text-ink">{formatCurrency(261000)}</p>
          <p className="mt-1 text-[8px] text-ink/60">
            dont <span className="font-semibold text-accent-emerald">{formatCurrency(41000)}</span> disponible
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1 border-t border-ink/5 pt-2">
            {[
              { icon: Lock, label: 'Épargne', value: formatCurrency(100000), color: 'text-accent-violet' },
              { icon: Target, label: 'Objectifs', value: formatCurrency(90000), color: 'text-accent-emerald' },
              { icon: Wallet, label: 'Revenu', value: formatCurrency(175000), color: 'text-brand-300' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-0.5 text-ink/50">
                  <Icon size={7} />
                  <span className="text-[6px] uppercase tracking-wider">{label}</span>
                </div>
                <p className={`font-mono text-[9px] font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions 2x2 */}
      <div className="grid shrink-0 grid-cols-2 gap-1.5">
        {PHONE_QUICK_ACTIONS.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-1.5 rounded-lg border border-ink/10 bg-surface-2 px-2 py-1.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-3">
              <Icon size={10} className="text-ink/60" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[8px] font-semibold leading-tight text-ink/70">{title}</p>
              <p className="truncate text-[6.5px] leading-tight text-ink/50">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enveloppes */}
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="mb-1 text-[7px] font-semibold uppercase tracking-widest text-ink/50">Enveloppes</p>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: Lock, label: 'Épargne bloquée', value: formatCurrency(100000), color: 'text-accent-violet', iconBg: 'bg-accent-violet/10' },
            { icon: Coins, label: 'Charges fixes', value: formatCurrency(30000), color: 'text-ink', iconBg: 'bg-accent-amber/10' },
          ].map(({ icon: Icon, label, value, color, iconBg }) => (
            <div key={label} className="rounded-lg border border-ink/5 bg-surface-2 p-2">
              <div className={`mb-1.5 flex h-5 w-5 items-center justify-center rounded-md ${iconBg}`}>
                <Icon size={10} className={color} />
              </div>
              <p className="truncate text-[7.5px] font-semibold text-ink/70">{label}</p>
              <p className={`mt-1 font-mono text-[10px] font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex shrink-0 items-center justify-around rounded-xl border border-ink/10 bg-surface-2 py-1.5">
        {PHONE_NAV.map(({ icon: Icon, label, active }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <Icon size={12} className={active ? 'text-brand-400' : 'text-ink/45'} />
            <span className={`text-[6px] font-medium ${active ? 'text-brand-300' : 'text-ink/45'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[240px] sm:w-[260px]">
      <div className="absolute inset-0 -z-10 rounded-[3rem] bg-brand-500/25 blur-3xl" style={{ opacity: 'var(--ambient-opacity)' }} />
      <div className="relative rotate-[-6deg] rounded-[2.75rem] border-[6px] border-[#1a1d26] bg-[#050608] p-1.5 shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
        {/* Side buttons */}
        <div className="absolute -left-[7px] top-20 h-8 w-1 rounded-full bg-[#1a1d26]" />
        <div className="absolute -left-[7px] top-32 h-8 w-1 rounded-full bg-[#1a1d26]" />
        <div className="absolute -right-[7px] top-24 h-12 w-1 rounded-full bg-[#1a1d26]" />

        {/* Notch */}
        <div className="absolute left-1/2 top-3 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-[#050608]" />

        {/* Screen */}
        <div className="relative h-[500px] w-full overflow-hidden rounded-[2.25rem] bg-surface-0 sm:h-[540px]">
          <PhoneDashboardPreview />
        </div>
      </div>
    </div>
  )
}

function BrowserMockup() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="absolute inset-0 -z-10 translate-y-6 rounded-[2rem] bg-brand-500/15 blur-3xl" style={{ opacity: 'var(--ambient-opacity)' }} />
      <div className="rounded-2xl border border-ink/10 bg-surface-1 shadow-[0_50px_120px_rgb(var(--shadow-ambient)/calc(0.7*var(--shadow-scale)))] overflow-hidden">

        {/* Browser top bar */}
        <div className="flex items-center gap-2 border-b border-ink/5 bg-surface-2 px-4 py-3">
          <div className="flex gap-1.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-rose/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-emerald/70" />
          </div>
          <div className="mx-auto flex items-center gap-1.5 rounded-full bg-surface-3 px-4 py-1 text-[11px] text-ink/50">
            <Lock size={10} />
            akwe.app
          </div>
          <div className="w-[42px] shrink-0" />
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">

          {/* Mini sidebar */}
          <div className="hidden lg:flex w-[76px] shrink-0 flex-col items-center gap-5 border-r border-ink/5 bg-surface-1 py-6">
            <div className="h-7 w-7 rounded-lg bg-gradient-brand" />
            {[LayoutDashboard, Target, Clock, SettingsIcon].map((Icon, i) => (
              <div
                key={i}
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-xl',
                  i === 0 ? 'bg-brand-500/15 text-brand-300' : 'text-ink/45'
                )}
              >
                <Icon size={16} />
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink/50">Juin 2026</p>
                <p className="text-base sm:text-lg font-bold text-ink">Tableau de bord</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-brand" />
            </div>

            <div className="relative overflow-hidden rounded-xl bg-gradient-brand p-px shadow-glow-brand">
              <div className="relative rounded-xl bg-surface-1 px-4 py-3.5 sm:px-5 sm:py-4">
                <p className="mb-1 text-[10px] uppercase tracking-widest text-ink/50">Patrimoine mensuel</p>
                <p className="mb-1 font-mono text-2xl font-bold leading-none text-ink sm:text-3xl">{formatCurrency(845000)}</p>
                <p className="mb-3 text-[11px] text-ink/60">
                  dont <span className="font-semibold text-accent-emerald">{formatCurrency(75000)}</span> disponible
                </p>
                <div className="grid grid-cols-3 gap-2 border-t border-ink/5 pt-3">
                  {[
                    { icon: Lock, label: 'Épargne', value: formatCurrency(280000), color: 'text-accent-violet' },
                    { icon: Target, label: 'Objectifs', value: formatCurrency(210000), color: 'text-accent-emerald' },
                    { icon: Wallet, label: 'Revenu', value: formatCurrency(350000), color: 'text-brand-300' },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1 text-ink/50">
                        <Icon size={10} />
                        <span className="text-[9px] uppercase tracking-wider">{label}</span>
                      </div>
                      <p className={`font-mono text-xs font-bold sm:text-sm ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PHONE_QUICK_ACTIONS.map(({ icon: Icon, title }) => (
                <div key={title} className="flex items-center gap-2 rounded-lg border border-ink/10 bg-surface-2 px-3 py-2">
                  <Icon size={12} className="text-ink/70 shrink-0" />
                  <span className="truncate text-[10px] font-medium text-ink/60">{title}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <EnvelopeCard envelope={PREVIEW_FIXED} />
              <EnvelopeCard envelope={PREVIEW_FREE} />
              <div className="hidden sm:block">
                <EnvelopeCard envelope={PREVIEW_GOAL} />
              </div>
            </div>
          </div>

          {/* Right panel — transactions */}
          <div className="hidden lg:flex w-[240px] shrink-0 flex-col gap-1 border-l border-ink/5 bg-surface-1 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-ink/50">Récentes</p>
            {FAKE_TRANSACTIONS.map((t) => (
              <div key={t.label} className="flex items-center justify-between gap-2 border-b border-ink/5 py-2 last:border-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="text-sm">{t.emoji}</span>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-ink/70">{t.label}</p>
                    <p className="truncate text-[9px] text-ink/50">{t.sub}</p>
                  </div>
                </div>
                <p className={clsx('shrink-0 font-mono text-[11px] font-semibold', t.amount > 0 ? 'text-accent-emerald' : 'text-ink/60')}>
                  {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function Landing() {
  const { signInWithGoogle } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ opacity: 'var(--ambient-opacity)' }}>
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-900/40 blur-3xl" />
        <div className="absolute -right-20 top-1/4 h-72 w-72 rounded-full bg-accent-violet/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent-emerald/10 blur-3xl" />
      </div>

      {/* Scattered coins */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden select-none" style={{ opacity: 'var(--ambient-opacity)' }}>
        <img src="/piece.png" alt="" aria-hidden className="absolute top-[6%] left-[4%] w-20 opacity-30 rotate-[22deg]" style={{ filter: 'blur(5px)' }} />
        <img src="/piece.png" alt="" aria-hidden className="absolute top-[12%] right-[9%] w-14 opacity-60 -rotate-[14deg]" />
        <img src="/piece.png" alt="" aria-hidden className="absolute top-[42%] left-[2%] w-11 opacity-25 rotate-[48deg]" style={{ filter: 'blur(4px)' }} />
        <img src="/piece.png" alt="" aria-hidden className="absolute bottom-[18%] right-[6%] w-16 opacity-30 -rotate-[30deg]" style={{ filter: 'blur(3px)' }} />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-6 lg:px-10">

        {/* ── Nav ──────────────────────────────────────────────────────────── */}
        <nav className="flex w-full items-center justify-between py-4">
          <img src={theme === 'light' ? '/logo_noir.png' : '/logo.png'} alt="Akwɛ" className="h-6 w-auto object-contain" />
          <div className="hidden md:flex items-center gap-8 text-sm text-ink/70">
            <a href="#fonctionnalites" className="transition hover:text-ink">Fonctionnalités</a>
            <a href="#comment-ca-marche" className="transition hover:text-ink">Comment ça marche</a>
          </div>
          <Button variant="secondary" size="sm" onClick={handleGoogle} disabled={loading}>
            {loading ? <Loader2 size={14} className="animate-spin" /> : <GoogleIcon />}
            <span className="hidden sm:inline">Continuer avec Google</span>
            <span className="sm:hidden">Connexion</span>
          </Button>
        </nav>

        {/* Toggle thème — flottant */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-ink/60 shadow-card-hover transition hover:-translate-y-0.5 hover:text-ink"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Hero backdrop glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[700px] w-[1400px] -translate-x-1/2 rounded-full bg-gradient-brand blur-[100px]"
          style={{ opacity: 'calc(0.12 * var(--ambient-opacity))' }}
        />

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center gap-5 max-w-3xl mt-10 sm:mt-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ink/5 px-4 py-1.5 text-xs text-ink/60">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse-slow" />
            Nouveau · Budget par enveloppes, simplifié
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight tracking-tight">
            Reprends le contrôle de ton budget,{' '}
            <span className="bg-gradient-brand bg-clip-text text-transparent">enveloppe par enveloppe.</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-ink/70 max-w-lg lg:max-w-xl">
            Akwɛ répartit ton revenu, suit tes objectifs d'épargne et gère ton reliquat de fin de mois — automatiquement, sur tous tes appareils.
          </p>

          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGoogle}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                {loading ? 'Connexion…' : 'Continuer avec Google'}
              </Button>
              <a href="#comment-ca-marche" className="inline-flex">
                <Button variant="secondary" size="lg">
                  <PlayCircle size={18} />
                  Voir comment ça marche
                </Button>
              </a>
            </div>
            <p className="text-xs text-ink/45">Gratuit · Connexion sécurisée · Aucune carte requise</p>
            {error && <p className="text-xs text-accent-rose">{error}</p>}
          </div>
        </div>

        {/* ── Aperçu produit ───────────────────────────────────────────────── */}
        <div className="w-full mt-16 sm:mt-20">
          <BrowserMockup />
        </div>

        {/* ── Douleurs ──────────────────────────────────────────────────────── */}
        <div className="w-full mt-24 sm:mt-32">
          <div className="flex flex-col items-center text-center gap-4 mb-10 sm:mb-14 px-6">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/50">
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              Tu te reconnais ?
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight max-w-xl">
              Ce qui arrive à ton salaire, chaque mois.
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <Marquee duration={38}>
              {PAINS_ROW_1.map(({ icon: Icon, title, text }) => (
                <div key={title} className="w-72 shrink-0 rounded-2xl border border-ink/5 bg-surface-2 p-6 shadow-card">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-rose/10">
                    <Icon size={18} className="text-accent-rose/80" />
                  </div>
                  <p className="text-sm font-bold text-ink mb-1.5">{title}</p>
                  <p className="text-xs text-ink/65 leading-relaxed">{text}</p>
                </div>
              ))}
            </Marquee>
            <Marquee reverse duration={38}>
              {PAINS_ROW_2.map(({ icon: Icon, title, text }) => (
                <div key={title} className="w-72 shrink-0 rounded-2xl border border-ink/5 bg-surface-2 p-6 shadow-card">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-rose/10">
                    <Icon size={18} className="text-accent-rose/80" />
                  </div>
                  <p className="text-sm font-bold text-ink mb-1.5">{title}</p>
                  <p className="text-xs text-ink/65 leading-relaxed">{text}</p>
                </div>
              ))}
            </Marquee>
          </div>
        </div>

        {/* ── Bénéfices ─────────────────────────────────────────────────────── */}
        <div id="fonctionnalites" className="w-full mt-24 sm:mt-32 scroll-mt-8">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/50 mb-3">
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              Fonctionnalités
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight">
              L'essentiel, sans le bruit.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4">
            {/* Featured — budget par enveloppes */}
            <Card glow="brand" className="lg:col-span-2 lg:row-span-2 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 bg-ink/[0.03]">
                  <Wallet size={20} className="text-brand-400" />
                </div>
                <p className="text-lg font-bold text-ink mb-2">Budget par enveloppes</p>
                <p className="text-sm text-ink/65 leading-relaxed max-w-xs">
                  Ton revenu se répartit automatiquement entre charges fixes, épargne et dépenses libres.
                </p>
              </div>
              <div className="mt-10">
                <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full">
                  <span className="h-full bg-accent-violet" style={{ width: '30%' }} />
                  <span className="h-full bg-accent-amber" style={{ width: '25%' }} />
                  <span className="h-full bg-brand-500" style={{ width: '30%' }} />
                  <span className="h-full bg-accent-cyan" style={{ width: '15%' }} />
                </div>
                <p className="mt-2 text-[11px] text-ink/50">4 enveloppes prédéfinies</p>
              </div>
            </Card>

            {/* Objectifs d'épargne — wide */}
            <Card className="lg:col-span-2 p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-ink/[0.03]">
                <Target size={18} className="text-accent-emerald" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink mb-1">Objectifs d'épargne</p>
                <p className="text-xs text-ink/65 leading-relaxed">
                  Fixe un montant et une échéance, suis ta progression mois après mois.
                </p>
              </div>
            </Card>

            {/* Reliquat */}
            <Card className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 bg-ink/[0.03]">
                <Sparkles size={18} className="text-accent-amber" />
              </div>
              <p className="text-sm font-bold text-ink mb-1">Reliquat géré</p>
              <p className="text-xs text-ink/65 leading-relaxed">Le solde non dépensé ne se perd jamais.</p>
            </Card>

            {/* Catégorisation */}
            <Card className="p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-ink/10 bg-ink/[0.03]">
                <Tags size={18} className="text-accent-violet" />
              </div>
              <p className="text-sm font-bold text-ink mb-1">Catégorisation auto</p>
              <p className="text-xs text-ink/65 leading-relaxed">{CATEGORY_COUNT} catégories reconnues à la saisie.</p>
            </Card>
          </div>
        </div>

        {/* ── Comment ça marche ────────────────────────────────────────────── */}
        <div id="comment-ca-marche" className="w-full mt-24 sm:mt-32 scroll-mt-8">
          <div className="flex flex-col items-center text-center gap-4 mb-10 sm:mb-14">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/50">
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              Comment ça marche
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight max-w-xl">
              Prends le contrôle en quelques clics, et laisse Akwɛ s'occuper du reste chaque mois.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map(({ icon: Icon, number, title, text, card, iconBox, iconColor, numberColor, titleColor, textColor }) => (
              <div key={title} className={clsx('relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl p-6 shadow-card sm:p-8', card)}>
                <span className={clsx('pointer-events-none absolute -right-3 -top-8 select-none font-mono text-[7rem] font-bold leading-none sm:text-[8rem]', numberColor)}>
                  {number}
                </span>
                <div className={clsx('relative mb-6 flex h-10 w-10 items-center justify-center rounded-xl', iconBox)}>
                  <Icon size={18} className={iconColor} />
                </div>
                <div className="relative">
                  <p className={clsx('text-lg sm:text-xl font-bold mb-2', titleColor)}>{title}</p>
                  <p className={clsx('text-sm leading-relaxed max-w-[90%]', textColor)}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Installable sur mobile ───────────────────────────────────────── */}
        <div className="w-full mt-24 sm:mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 flex flex-col items-center lg:items-start gap-5 text-center lg:text-left">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/50">
                <span className="h-1 w-1 rounded-full bg-ink/30" />
                Application installable
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight max-w-md">
                Comme une app, sans passer par un store.
              </h2>
              <p className="text-sm text-ink/70 max-w-md">
                Ajoute Akwɛ à ton écran d'accueil en un geste. Ouverture instantanée, interface fluide, et toujours à jour.
              </p>
              <div className="flex flex-col gap-3 mt-1 w-full max-w-md">
                {INSTALL_POINTS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-left">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10">
                      <Icon size={14} className="text-brand-400" />
                    </div>
                    <p className="text-xs text-ink/70">{text}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-3">
                <Button variant="primary" size="lg" onClick={handleGoogle} disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                  {loading ? 'Connexion…' : 'Continuer avec Google'}
                </Button>
                <a
                  href="#comment-ca-marche"
                  className="text-sm font-medium text-ink/60 underline underline-offset-4 transition hover:text-ink whitespace-nowrap"
                >
                  Voir comment ça marche
                </a>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative flex justify-center">
              <img src="/piece.png" alt="" aria-hidden className="pointer-events-none absolute -left-4 top-6 w-14 -rotate-12 select-none opacity-70" />
              <img src="/piece.png" alt="" aria-hidden className="pointer-events-none absolute -right-2 top-1/3 w-10 rotate-[20deg] select-none opacity-50" style={{ filter: 'blur(1px)' }} />
              <img src="/piece.png" alt="" aria-hidden className="pointer-events-none absolute -bottom-4 left-1/4 w-16 rotate-[8deg] select-none opacity-60" />
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* ── Témoignages ───────────────────────────────────────────────────── */}
        <div className="w-full mt-24 sm:mt-32">
          <div className="flex flex-col items-center text-center gap-3 mb-10 sm:mb-14 px-6">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-ink/50">
              <span className="h-1 w-1 rounded-full bg-ink/30" />
              Aperçu
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink leading-tight max-w-xl">
              Ce qu'on veut que tu ressentes.
            </h2>
            <p className="text-xs text-ink/55 max-w-md italic">
              Akwɛ démarre tout juste — voici le ressentie qu'on attend après adoption de la solution.
            </p>
          </div>

          <Marquee duration={40}>
            {TESTIMONIALS.map(({ quote, role }) => (
              <Card key={role} className="w-80 shrink-0 p-6 flex flex-col gap-4">
                <div className="flex gap-0.5 text-accent-amber">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-sm text-ink/70 leading-relaxed italic">"{quote}"</p>
                <div className="mt-auto flex items-center gap-2 border-t border-ink/5 pt-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-3 text-ink/60">
                    <User size={14} />
                  </div>
                  <span className="text-xs text-ink/60">{role}</span>
                </div>
              </Card>
            ))}
          </Marquee>
        </div>

        {/* ── CTA final ─────────────────────────────────────────────────────── */}
        <div className="w-full mt-24 sm:mt-32">
          <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-brand px-6 py-14 text-center sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-white/5 blur-3xl" />

            <p className="relative text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
              Prêt à voir où va ton argent ?
            </p>
            <p className="relative text-sm sm:text-base text-white/70 mb-8 max-w-md mx-auto">
              Rejoins Akwɛ et reprends le contrôle de ton budget dès aujourd'hui, gratuitement.
            </p>
            <div className="relative flex flex-col items-center gap-3">
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-[#0A0B0F] shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
                {loading ? 'Connexion…' : 'Continuer avec Google'}
              </button>
              {error && <p className="text-xs text-white/80">{error}</p>}
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="w-full mt-24 sm:mt-32 border-t border-ink/5 pt-8 pb-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <img
              src={theme === 'light' ? '/logo_noir.png' : '/logo.png'}
              alt="Akwɛ"
              className="h-5 w-auto object-contain opacity-80"
            />

            <div className="flex items-center gap-6 text-xs text-ink/60">
              <a href="#fonctionnalites" className="transition hover:text-ink">Fonctionnalités</a>
              <a href="#comment-ca-marche" className="transition hover:text-ink">Comment ça marche</a>
              <a href="#" className="transition hover:text-ink">Retour en haut ↑</a>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="mailto:andrekimgbaguidi01@gmail.com"
                aria-label="Nous écrire par email"
                className="text-ink/60 transition hover:text-ink"
              >
                <Mail size={15} />
              </a>
              <a
                href="https://wa.me/22966337219"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Nous contacter sur WhatsApp"
                className="text-ink/60 transition hover:text-ink"
              >
                <MessageCircle size={15} />
              </a>
              <p className="text-xs text-ink/50">© 2026 Akwɛ · Budget personnel</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
