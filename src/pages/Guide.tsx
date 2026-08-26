import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useRightPanel } from '@/contexts/RightPanelContext'
import { Card } from '@/components/ui/Card'
import {
  ArrowLeft, Lock, TrendingDown, Wallet, Coins, Target,
  Sparkles, CalendarClock, ArrowRightLeft, Banknote,
  Settings, ArrowDown,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Lock,
    iconBg: 'bg-accent-violet/10',
    iconColor: 'text-accent-violet',
    title: 'Épargne bloquée',
    tag: 'Enveloppe',
    tagColor: 'bg-accent-violet/10 text-accent-violet/70',
    desc: "Argent mis de côté pour une durée fixe que tu choisis (ex: 6 mois). La date de déblocage ne bouge plus ensuite, même si tu continues d'épargner. Un retrait exceptionnel reste possible avant l'échéance, avec confirmation renforcée.",
  },
  {
    icon: TrendingDown,
    iconBg: 'bg-accent-amber/10',
    iconColor: 'text-accent-amber',
    title: 'Charges fixes',
    tag: 'Enveloppe',
    tagColor: 'bg-accent-amber/10 text-accent-amber/70',
    desc: "Loyer, électricité, abonnements, crédits. Ces montants sont réservés chaque mois avant tout. Tu sais toujours si tes charges sont couvertes.",
  },
  {
    icon: Wallet,
    iconBg: 'bg-brand-500/10',
    iconColor: 'text-brand-400',
    title: 'Solde courant',
    tag: 'Enveloppe',
    tagColor: 'bg-brand-500/10 text-brand-400/70',
    desc: "L'enveloppe libre pour tes dépenses quotidiennes — restaurants, courses, sorties. Le surplus après distribution atterrit ici.",
  },
  {
    icon: Coins,
    iconBg: 'bg-accent-cyan/10',
    iconColor: 'text-accent-cyan',
    title: 'Bonus mensuel',
    tag: 'Enveloppe libre',
    tagColor: 'bg-accent-cyan/10 text-accent-cyan/70',
    desc: "Reçoit automatiquement les reliquats et les revenus imprévus. Disponible sans contrainte, contrairement à l'épargne bloquée.",
  },
  {
    icon: Target,
    iconBg: 'bg-accent-emerald/10',
    iconColor: 'text-accent-emerald',
    title: 'Objectifs',
    tag: 'Projets',
    tagColor: 'bg-accent-emerald/10 text-accent-emerald/70',
    desc: "Crée un objectif avec un montant cible et une contribution mensuelle. Vire depuis le Solde courant ou le Bonus. Suis ta progression en temps réel.",
  },
  {
    icon: Sparkles,
    iconBg: 'bg-accent-amber/10',
    iconColor: 'text-accent-amber',
    title: 'Reliquat',
    tag: 'Fin de cycle',
    tagColor: 'bg-accent-amber/10 text-accent-amber/70',
    desc: "Solde non dépensé à la fin du mois. Tu peux le reporter, l'envoyer en épargne, le booster vers un objectif ou le stocker dans le Bonus.",
  },
  {
    icon: Banknote,
    iconBg: 'bg-accent-rose/10',
    iconColor: 'text-accent-rose',
    title: 'Revenus imprévus',
    tag: 'Inattendu',
    tagColor: 'bg-accent-rose/10 text-accent-rose/70',
    desc: "Bonus, cadeau, remboursement ? Tu choisis où allouer : Bonus mensuel, Solde courant, Épargne ou directement vers un objectif.",
  },
  {
    icon: ArrowRightLeft,
    iconBg: 'bg-brand-500/10',
    iconColor: 'text-brand-400',
    title: 'Virements objectifs',
    tag: 'Transfert',
    tagColor: 'bg-brand-500/10 text-brand-400/70',
    desc: "Transfère un montant depuis le Solde courant ou le Bonus vers un de tes objectifs. Simple, traçable, avec historique.",
  },
  {
    icon: Settings,
    iconBg: 'bg-ink/5',
    iconColor: 'text-ink/60',
    title: 'Répartition automatique',
    tag: 'Réglages',
    tagColor: 'bg-ink/5 text-ink/50',
    desc: "Définis une fois combien va dans chaque enveloppe à chaque virement. Ex : 70 000 F → Épargne, 30 000 F → Charges. Le reste va en Solde courant.",
  },
  {
    icon: CalendarClock,
    iconBg: 'bg-ink/5',
    iconColor: 'text-ink/60',
    title: 'Jour de virement',
    tag: 'Réglages',
    tagColor: 'bg-ink/5 text-ink/50',
    desc: "Choisis le jour où ton salaire arrive (ex : 25). Le bouton Revenu mensuel se débloque ce jour-là seulement.",
  },
]

const PROCESS = [
  {
    n: '01',
    emoji: '📅',
    title: 'Ton salaire arrive',
    body: "Le jour J défini dans tes réglages, le bouton Revenu mensuel se débloque. Tu saisis le montant reçu.",
    accent: 'brand',
    border: 'border-brand-500/25',
    bg: 'bg-brand-500/8',
    num: 'text-brand-400',
    connector: true,
  },
  {
    n: '02',
    emoji: '📦',
    title: 'Akwɛ distribue automatiquement',
    body: "Selon tes règles de répartition, chaque enveloppe reçoit sa part. Le reste va dans ton Solde courant.",
    accent: 'emerald',
    border: 'border-accent-emerald/25',
    bg: 'bg-accent-emerald/8',
    num: 'text-accent-emerald',
    connector: true,
  },
  {
    n: '03',
    emoji: '💳',
    title: 'Tu dépenses depuis les enveloppes',
    body: "À chaque dépense, tu choisis quelle enveloppe débiter. Tu vois en temps réel ce qui reste dans chacune.",
    accent: 'amber',
    border: 'border-accent-amber/25',
    bg: 'bg-accent-amber/8',
    num: 'text-accent-amber',
    connector: true,
  },
  {
    n: '04',
    emoji: '🔄',
    title: 'Le reliquat passe en Bonus',
    body: "À la fin du cycle, le solde non utilisé devient automatiquement ton reliquat. Tu décides quoi en faire.",
    accent: 'violet',
    border: 'border-accent-violet/25',
    bg: 'bg-accent-violet/8',
    num: 'text-accent-violet',
    connector: false,
  },
]

export function Guide() {
  const setRightPanel = useRightPanel()

  useEffect(() => {
    setRightPanel(
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">
          Navigation rapide
        </p>
        <Card className="p-4 flex flex-col gap-0.5">
          {[
            { label: 'La méthode',           href: '#method' },
            { label: 'Processus mensuel',    href: '#process' },
            { label: 'Fonctionnalités',      href: '#features' },
          ].map(({ label, href }) => (
            <a key={href} href={href}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-ink/70 transition hover:bg-surface-3 hover:text-ink/80">
              <span className="h-1 w-1 rounded-full bg-white/20 shrink-0" />
              {label}
            </a>
          ))}
        </Card>
        <Link to="/"
          className="flex items-center justify-center gap-2 rounded-2xl border border-ink/8 bg-surface-2 py-3 text-xs font-medium text-ink/60 transition hover:bg-surface-3 hover:text-ink/70">
          <ArrowLeft size={12} />
          Retour au tableau
        </Link>
      </div>
    )
    return () => setRightPanel(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="min-w-0">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-ink/60 transition mb-3">
          <ArrowLeft size={12} /> Tableau de bord
        </Link>
        <p className="text-[11px] uppercase tracking-widest text-ink/50">Documentation</p>
        <h1 className="text-xl font-bold text-ink leading-tight">Comment ça marche</h1>
      </div>

      {/* ── Hero méthode ──────────────────────────────────────────────────────── */}
      <section id="method">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-px shadow-glow-brand">
          <div className="relative rounded-2xl bg-surface-1 overflow-hidden">

            {/* Coins déco */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <img src="/piece.png" alt="" aria-hidden
                className="absolute -right-4 -top-4 w-24 opacity-20 rotate-[15deg]"
                style={{ filter: 'blur(3px)' }} />
              <img src="/piece.png" alt="" aria-hidden
                className="absolute right-8 bottom-0 w-14 opacity-15 -rotate-[20deg]"
                style={{ filter: 'blur(5px)' }} />
            </div>

            <div className="relative px-5 py-5">
              <div className="flex items-start gap-4">
                <img src="/piece.png" alt="" aria-hidden className="h-14 w-14 shrink-0 object-contain drop-shadow-[0_0_16px_rgba(87,125,255,0.6)]" />
                <div>
                  <h2 className="text-base font-bold text-ink mb-1.5">La méthode des enveloppes</h2>
                  <p className="text-sm text-ink/70 leading-relaxed">
                    Avant de dépenser, tu alloues chaque franc à une enveloppe. Chaque enveloppe a un rôle précis.
                    Tu ne dépenses que ce qui est alloué — jamais au-delà.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink/8 pt-4">
                {[
                  { value: '4',      label: 'Enveloppes' },
                  { value: '∞',      label: 'Objectifs' },
                  { value: '100%',   label: 'Alloué' },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-xl font-bold font-mono text-brand-300">{value}</p>
                    <p className="text-[10px] text-ink/50 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Processus mensuel ─────────────────────────────────────────────────── */}
      <section id="process" className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">
          Processus mensuel
        </p>

        <div className="flex flex-col gap-0">
          {PROCESS.map((step) => (
            <div key={step.n}>
              <div className={`flex items-start gap-4 rounded-2xl border ${step.border} ${step.bg} px-4 py-4`}>
                {/* Numéro + emoji */}
                <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                  <div className="text-xl leading-none">{step.emoji}</div>
                  <span className={`text-[10px] font-bold font-mono ${step.num}`}>{step.n}</span>
                </div>
                <div>
                  <p className={`text-sm font-semibold text-ink mb-1`}>{step.title}</p>
                  <p className="text-xs text-ink/65 leading-relaxed">{step.body}</p>
                </div>
              </div>
              {step.connector && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={14} className="text-ink/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Toutes les fonctionnalités ────────────────────────────────────────── */}
      <section id="features" className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink/50">
          Toutes les fonctionnalités
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.title} className="!p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${f.iconBg}`}>
                    <Icon size={16} className={f.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="text-sm font-semibold text-ink">{f.title}</p>
                      <span className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md ${f.tagColor}`}>
                        {f.tag}
                      </span>
                    </div>
                    <p className="text-xs text-ink/65 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-ink/8 bg-surface-2 px-5 py-6 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img src="/piece.png" alt="" aria-hidden
            className="absolute -left-4 top-0 w-16 opacity-15 rotate-[20deg]"
            style={{ filter: 'blur(4px)' }} />
          <img src="/piece.png" alt="" aria-hidden
            className="absolute -right-3 bottom-0 w-14 opacity-15 -rotate-[15deg]"
            style={{ filter: 'blur(4px)' }} />
        </div>
        <p className="relative text-sm text-ink/70 mb-4">
          Tu as tout compris — place à la pratique 🎯
        </p>
        <Link to="/"
          className="relative inline-flex items-center gap-2 rounded-2xl bg-gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-glow-brand transition hover:opacity-90">
          <ArrowLeft size={14} />
          Aller au tableau de bord
        </Link>
      </div>

    </div>
  )
}
