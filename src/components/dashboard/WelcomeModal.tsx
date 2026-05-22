import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Lock, Wallet, TrendingDown, Coins, X } from 'lucide-react'
import clsx from 'clsx'

const LS_KEY = 'akwe_welcomed'
export function hasSeenWelcome()  { return localStorage.getItem(LS_KEY) === 'true' }
export function markWelcomeSeen() { localStorage.setItem(LS_KEY, 'true') }

/* ── Slide 1 hero — pièces éparpillées ─────────────────────────────────── */
function HeroCoins() {
  return (
    <div className="relative h-48 overflow-hidden bg-surface-0 select-none">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/70 via-surface-0/40 to-accent-violet/20 pointer-events-none" />

      {/* Pièces éparpillées */}
      <img src="/piece.png" alt="" aria-hidden
        className="absolute top-3 left-6 w-16 opacity-55 rotate-[18deg]" />
      <img src="/piece.png" alt="" aria-hidden
        className="absolute top-6 right-8 w-10 opacity-35 -rotate-[22deg]"
        style={{ filter: 'blur(2px)' }} />
      <img src="/piece.png" alt="" aria-hidden
        className="absolute bottom-4 left-4 w-9 opacity-25 rotate-[50deg]"
        style={{ filter: 'blur(4px)' }} />
      <img src="/piece.png" alt="" aria-hidden
        className="absolute bottom-6 right-5 w-14 opacity-45 -rotate-[10deg]"
        style={{ filter: 'blur(1px)' }} />
      <img src="/piece.png" alt="" aria-hidden
        className="absolute top-0 right-28 w-7 opacity-30 rotate-[35deg]"
        style={{ filter: 'blur(3px)' }} />

      {/* Pièce centrale nette */}
      <img src="/piece.png" alt="" aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 opacity-90 drop-shadow-[0_0_24px_rgba(87,125,255,0.5)]" />

      {/* Badge tag */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-white/40">
          Méthode enveloppes
        </span>
      </div>
    </div>
  )
}

/* ── Slide 2 hero — mini UI des enveloppes ─────────────────────────────── */
function HeroEnvelopes() {
  const cards = [
    { Icon: Lock,        color: 'text-accent-violet', bg: 'bg-accent-violet/15', label: 'Épargne',  amount: '70 000 F' },
    { Icon: TrendingDown,color: 'text-accent-amber',  bg: 'bg-accent-amber/15',  label: 'Charges',  amount: '30 000 F' },
    { Icon: Wallet,      color: 'text-brand-400',     bg: 'bg-brand-500/15',     label: 'Courant',  amount: '85 000 F' },
    { Icon: Coins,       color: 'text-accent-cyan',   bg: 'bg-accent-cyan/15',   label: 'Bonus',    amount: '12 000 F' },
  ]
  return (
    <div className="relative h-48 overflow-hidden bg-surface-0">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-emerald/15 to-accent-violet/15 pointer-events-none" />
      <div className="absolute inset-3 grid grid-cols-2 gap-2">
        {cards.map(({ Icon, color, bg, label, amount }) => (
          <div key={label}
            className="rounded-xl border border-white/8 bg-surface-1/80 backdrop-blur-sm px-3 py-2.5 flex items-center gap-2.5">
            <div className={clsx('h-7 w-7 shrink-0 rounded-lg flex items-center justify-center', bg)}>
              <Icon size={13} className={color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-white/80 leading-tight">{label}</p>
              <p className={clsx('text-[11px] font-bold font-mono leading-tight', color)}>{amount}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-4">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-white/30">
          4 enveloppes
        </span>
      </div>
    </div>
  )
}

/* ── Slide 3 hero — objectif avec progress ─────────────────────────────── */
function HeroGoal() {
  return (
    <div className="relative h-48 overflow-hidden bg-surface-0">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-amber/20 to-accent-rose/15 pointer-events-none" />

      {/* Pièce déco */}
      <img src="/piece.png" alt="" aria-hidden
        className="absolute -right-3 -top-3 w-16 opacity-25 rotate-[25deg]"
        style={{ filter: 'blur(4px)' }} />
      <img src="/piece.png" alt="" aria-hidden
        className="absolute bottom-2 left-2 w-10 opacity-20 -rotate-[15deg]"
        style={{ filter: 'blur(3px)' }} />

      {/* Mini goal card */}
      <div className="absolute inset-4 rounded-2xl border border-white/10 bg-surface-1/80 backdrop-blur-sm p-4 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-accent-amber/20 border border-accent-amber/20 flex items-center justify-center text-xl">
            ✈️
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Voyage Tokyo</p>
            <p className="text-[10px] text-white/35 mt-0.5">8 mois restants</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] text-white/30">Objectif</p>
            <p className="text-xs font-bold font-mono text-white/50">500 000 F</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="font-bold font-mono text-accent-amber">150 000 F</span>
            <span className="text-white/30">30%</span>
          </div>
          <div className="h-2 rounded-full bg-white/8">
            <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-accent-amber to-accent-rose" />
          </div>
        </div>
      </div>
    </div>
  )
}

const SLIDE_HEROES = [HeroCoins, HeroEnvelopes, HeroGoal]

const SLIDES = [
  {
    tag: 'La méthode des enveloppes',
    title: 'Prends le contrôle de chaque franc',
    body: "Akwɛ t'aide à allouer ton argent avant de le dépenser — pas après. Chaque franc a un rôle précis dès le jour de ton virement.",
    features: null,
  },
  {
    tag: 'Tes enveloppes',
    title: 'Ton budget, découpé intelligemment',
    body: null,
    features: [
      { emoji: '🔒', label: 'Épargne bloquée',  desc: 'Sécurisée, retrait avec confirmation' },
      { emoji: '📋', label: 'Charges fixes',     desc: 'Loyer, factures, abonnements' },
      { emoji: '💳', label: 'Solde courant',     desc: 'Dépenses quotidiennes libres' },
      { emoji: '✨', label: 'Bonus mensuel',     desc: 'Reliquats & revenus imprévus' },
    ],
  },
  {
    tag: 'Objectifs & Reliquat',
    title: 'Épargne pour tes projets, sans effort',
    body: "Crée des objectifs avec un montant cible. Vire depuis tes enveloppes. À la fin du mois, le solde non utilisé devient ton reliquat — tu choisis quoi en faire.",
    features: null,
  },
]

export function WelcomeModal() {
  const [slide, setSlide] = useState(0)
  const [visible, setVisible] = useState(!hasSeenWelcome())
  const navigate = useNavigate()

  if (!visible) return null

  const current = SLIDES[slide]
  const Hero = SLIDE_HEROES[slide]
  const isLast = slide === SLIDES.length - 1

  function dismiss() { markWelcomeSeen(); setVisible(false) }
  function goGuide() { markWelcomeSeen(); setVisible(false); navigate('/guide') }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={dismiss} />

      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-surface-1 shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-up">

        {/* Bouton fermer */}
        <button onClick={dismiss}
          className="absolute top-3 right-3 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white/50 hover:text-white transition">
          <X size={14} />
        </button>

        {/* Image hero */}
        <Hero />

        {/* Texte */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-white/35 mb-1">
            {current.tag}
          </p>
          <h2 className="text-lg font-bold text-white leading-snug mb-3">{current.title}</h2>

          {current.body ? (
            <p className="text-sm text-white/50 leading-relaxed">{current.body}</p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {current.features!.map((f) => (
                <div key={f.label} className="flex items-start gap-2 rounded-xl bg-surface-3 px-2.5 py-2">
                  <span className="text-sm shrink-0">{f.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white leading-tight">{f.label}</p>
                    <p className="text-[10px] text-white/35 leading-tight mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={clsx('rounded-full transition-all duration-300',
                  i === slide ? 'w-5 h-1.5 bg-brand-400' : 'w-1.5 h-1.5 bg-white/20'
                )} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {!isLast ? (
              <>
                <button onClick={dismiss}
                  className="text-xs text-white/25 hover:text-white/50 transition px-2 py-1.5">
                  Passer
                </button>
                <button onClick={() => setSlide((s) => s + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-500/15 border border-brand-500/20 px-4 py-2 text-sm font-semibold text-brand-300 transition hover:bg-brand-500/25">
                  Suivant <ChevronRight size={14} />
                </button>
              </>
            ) : (
              <>
                <button onClick={dismiss}
                  className="text-xs text-white/25 hover:text-white/50 transition px-2 py-1.5">
                  Commencer
                </button>
                <button onClick={goGuide}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2 text-sm font-semibold text-white shadow-glow-brand transition hover:opacity-90">
                  Voir le guide <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
