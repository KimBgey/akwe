import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { updateProfile } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useBudget } from '@/hooks/useBudget'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRightPanel } from '@/contexts/RightPanelContext'
import {
  CalendarDays, Pencil, Check, X, Trash2, AlertTriangle,
  LogOut, CheckCircle2, AlertCircle, Loader2, Database,
  ReceiptText, Target, Layers, BookOpen, ChevronDown,
} from 'lucide-react'
import clsx from 'clsx'

const FAQ = [
  {
    q: 'C\'est quoi une enveloppe ?',
    a: 'Une enveloppe représente une catégorie budgétaire. Tu alloues un montant à chaque enveloppe lors de ton virement, et tu dépenses uniquement depuis celle qui correspond. Tu ne peux pas dépenser ce qui n\'est pas alloué.',
  },
  {
    q: 'Comment distribuer mon revenu ?',
    a: 'Dans "Répartition automatique" ci-dessus, définis combien va dans chaque enveloppe. Quand tu saisiras ton revenu mensuel, Akwɛ appliquera ces règles automatiquement. Le reste atterrit dans le Solde courant.',
  },
  {
    q: 'Qu\'est-ce que le reliquat ?',
    a: 'C\'est le solde non dépensé à la fin du cycle. Quand tu saisis un nouveau revenu, Akwɛ te propose d\'en faire quelque chose : le reporter, l\'épargner, l\'envoyer vers un objectif ou le stocker dans le Bonus mensuel.',
  },
  {
    q: 'À quoi sert le Bonus mensuel ?',
    a: 'C\'est une enveloppe libre qui accumule les reliquats et les revenus imprévus (bonus, cadeaux, remboursements). Contrairement à l\'Épargne bloquée, tu peux en disposer librement à tout moment.',
  },
  {
    q: 'Comment créer et alimenter un objectif ?',
    a: 'Va sur la page "Objectifs" et clique sur "Nouveau". Définis un montant cible et une contribution mensuelle. Pour alimenter, utilise le bouton "Virer vers" sur le tableau de bord — tu choisis la source (Solde courant ou Bonus).',
  },
  {
    q: 'L\'épargne bloquée est vraiment bloquée ?',
    a: 'Oui — chaque retrait demande une confirmation explicite. C\'est voulu : cette friction t\'évite de puiser dans ton épargne impulsivement. Utile pour un fond d\'urgence ou une épargne long terme.',
  },
]

const PAY_DAY_OPTIONS = [1, 5, 10, 15, 20, 25, 28, 30]

export function Settings({ uid }: { uid: string }) {
  const { user, signOut } = useAuth()
  const {
    state, syncStatus,
    updateDistributionRule, setPayDay, resetAll,
  } = useBudget(uid)

  const setRightPanel = useRightPanel()

  const [editingName, setEditingName]   = useState(false)
  const [nameValue, setNameValue]       = useState(user?.displayName ?? '')
  const [savingName, setSavingName]     = useState(false)
  const [confirming, setConfirming]         = useState(false)
  const [openFaq, setOpenFaq]               = useState<number | null>(null)
  const [editingRule, setEditingRule]         = useState<string | null>(null)
  const [ruleValue, setRuleValue]             = useState('')
  const [confirmingSignOut, setConfirmingSignOut] = useState(false)

  const nonFreeEnvelopes = state.envelopes.filter((e) => e.type !== 'free' && e.type !== 'bonus')

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  function getRule(envId: string) {
    return state.distributionRules.find((r) => r.envelopeId === envId)
  }

  async function saveName() {
    if (!auth.currentUser || !nameValue.trim()) return
    setSavingName(true)
    try {
      await updateProfile(auth.currentUser, { displayName: nameValue.trim() })
    } finally {
      setSavingName(false)
      setEditingName(false)
    }
  }

  function startEditRule(envId: string) {
    const rule = getRule(envId)
    setRuleValue(rule ? String(rule.amount) : '')
    setEditingRule(envId)
  }

  function commitRule(envId: string) {
    const num = parseFloat(ruleValue)
    if (!isNaN(num) && num >= 0) {
      updateDistributionRule({ envelopeId: envId, amount: num, percentage: 0, usePercentage: false })
    }
    setEditingRule(null)
    setRuleValue('')
  }

  function handleReset() {
    resetAll()
    setConfirming(false)
  }

  useEffect(() => {
    const txCount  = state.transactions.length
    const envCount = state.envelopes.length
    const gCount   = state.goalWallets.length

    const syncIcon = syncStatus === 'synced'
      ? <CheckCircle2 size={13} className="text-accent-emerald" />
      : syncStatus === 'error'
      ? <AlertCircle size={13} className="text-accent-rose" />
      : <Loader2 size={13} className="text-brand-400 animate-spin" />

    const syncLabel = syncStatus === 'synced'
      ? 'Synchronisé'
      : syncStatus === 'error'
      ? 'Erreur de sync'
      : 'Synchronisation…'

    setRightPanel(
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
          Compte
        </p>

        {/* Account card */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                className="h-11 w-11 rounded-xl object-cover shrink-0"
                alt="avatar"
              />
            ) : (
              <div className="h-11 w-11 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-brand-300">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.displayName || 'Utilisateur'}
              </p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Sync status */}
          <div className="flex items-center gap-2 rounded-xl bg-surface-3 px-3 py-2.5">
            {syncIcon}
            <span className="text-xs text-white/50">{syncLabel}</span>
          </div>
        </Card>

        {/* Data overview */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database size={13} className="text-white/30" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
              Données
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { icon: Layers,      label: 'Enveloppes',    value: envCount },
              { icon: ReceiptText, label: 'Transactions',  value: txCount },
              { icon: Target,      label: 'Objectifs',     value: gCount },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/40">
                  <Icon size={12} />
                  <span className="text-xs">{label}</span>
                </div>
                <span className="text-xs font-bold font-mono text-white/60">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-white/5 pt-3">
            {!confirmingSignOut ? (
              <button
                onClick={() => setConfirmingSignOut(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-surface-3 px-3 py-2.5 text-left transition hover:border-accent-rose/25 hover:bg-accent-rose/5 group"
              >
                <LogOut size={14} className="text-white/30 group-hover:text-accent-rose transition shrink-0" />
                <span className="text-sm text-white/50 group-hover:text-white/70 transition">
                  Se déconnecter
                </span>
              </button>
            ) : (
              <div className="rounded-xl border border-accent-rose/25 bg-accent-rose/5 p-3 flex flex-col gap-3">
                <p className="text-xs text-white/60 leading-relaxed">
                  Tu seras redirigé vers la page de connexion.
                </p>
                <div className="grid grid-cols-2 gap-2">
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
                    Déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    )
    return () => setRightPanel(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, syncStatus, confirmingSignOut, state.transactions.length, state.envelopes.length, state.goalWallets.length])

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-white/30">Configuration</p>
        <h1 className="text-2xl font-bold text-white leading-tight">Réglages</h1>
      </div>

      {/* ── Profil ─────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Profil</p>

        <Card className="p-5">
          {/* Avatar + name + email */}
          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                className="h-16 w-16 rounded-2xl object-cover shrink-0"
                alt="avatar"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-brand-500/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-brand-300">{initials}</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      placeholder="Ton prénom"
                      onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={saveName}
                    disabled={savingName}
                    className="h-9 w-9 shrink-0 rounded-xl bg-accent-emerald/10 text-accent-emerald flex items-center justify-center hover:bg-accent-emerald/20 transition disabled:opacity-50"
                  >
                    {savingName
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Check size={14} />
                    }
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="h-9 w-9 shrink-0 rounded-xl bg-surface-3 text-white/40 flex items-center justify-center hover:text-white transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-white truncate">
                    {user?.displayName || 'Utilisateur'}
                  </p>
                  <button
                    onClick={() => { setNameValue(user?.displayName ?? ''); setEditingName(true) }}
                    className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg bg-surface-3 text-white/30 hover:text-white transition"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              )}
              <p className="text-xs text-white/40 mt-0.5 truncate">{user?.email}</p>
            </div>
          </div>

        </Card>
      </section>

      {/* ── Jour de virement ───────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Budget</p>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-brand-400" />
            <p className="text-xs font-semibold text-white/60">Jour de virement salaire</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PAY_DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setPayDay(d)}
                className={clsx(
                  'rounded-xl border py-2.5 text-sm font-bold transition',
                  state.payDay === d
                    ? 'border-brand-500/40 bg-brand-500/15 text-brand-300'
                    : 'border-white/8 bg-surface-3 text-white/40 hover:border-white/20 hover:text-white/70'
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-white/30">
            Le bouton "Revenu mensuel" se débloque le{' '}
            <span className="font-semibold text-white/50">{state.payDay}</span> de chaque mois.
          </p>
        </Card>
      </section>

      {/* ── Répartition automatique ────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
          Répartition automatique
        </p>

        <div className="flex flex-col gap-2">
          {nonFreeEnvelopes.map((env) => {
            const rule      = getRule(env.id)
            const isEditing = editingRule === env.id
            return (
              <Card key={env.id} className="!p-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{env.name}</p>
                    <p className="text-xs text-white/30 capitalize">{env.type}</p>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-28">
                        <Input
                          type="number"
                          value={ruleValue}
                          onChange={(e) => setRuleValue(e.target.value)}
                          suffix="F"
                          placeholder="0"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') commitRule(env.id) }}
                        />
                      </div>
                      <button
                        onClick={() => commitRule(env.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-accent-emerald/10 text-accent-emerald hover:bg-accent-emerald/20 transition"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold font-mono text-white">
                        {rule ? `${rule.amount.toLocaleString('fr-FR')} F` : '— F'}
                      </span>
                      <button
                        onClick={() => startEditRule(env.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-surface-3 text-white/40 hover:text-white transition"
                      >
                        <Pencil size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
        <p className="text-[11px] text-white/30">
          Le reste va automatiquement dans le solde courant.
        </p>
      </section>

      {/* ── Comment ça marche ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
            Comment ça marche
          </p>
          <Link
            to="/guide"
            className="flex items-center gap-1.5 text-[11px] text-brand-400 hover:text-brand-300 transition"
          >
            <BookOpen size={11} />
            Guide complet
          </Link>
        </div>

        <div className="flex flex-col gap-1.5">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/8 bg-surface-2 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium text-white/70">{item.q}</span>
                <ChevronDown
                  size={14}
                  className={clsx(
                    'shrink-0 text-white/30 transition-transform duration-200',
                    openFaq === i && 'rotate-180'
                  )}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-white/45 leading-relaxed border-t border-white/5 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Zone de danger ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 pt-2 border-t border-white/5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/20">
          Zone de danger
        </p>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-accent-rose/20 bg-accent-rose/5 px-4 py-3.5 text-left transition hover:bg-accent-rose/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-rose/10">
              <Trash2 size={15} className="text-accent-rose" />
            </div>
            <div>
              <p className="text-sm font-semibold text-accent-rose leading-tight">
                Réinitialiser toutes les données
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">
                Enveloppes, transactions, objectifs — tout sera effacé
              </p>
            </div>
          </button>
        ) : (
          <div className="rounded-2xl border border-accent-rose/30 bg-accent-rose/8 p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-accent-rose shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">Confirmer la réinitialisation</p>
                <p className="text-xs text-white/40 mt-0.5">
                  Cette action est irréversible. Toutes tes enveloppes, transactions et objectifs
                  seront définitivement supprimés.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" fullWidth onClick={() => setConfirming(false)}>
                Annuler
              </Button>
              <button
                onClick={handleReset}
                className="rounded-2xl bg-accent-rose py-2.5 text-sm font-semibold text-white transition hover:bg-accent-rose/80 active:scale-[.98]"
              >
                Tout effacer
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
