import { Component, ReactNode } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[Akwɛ] Erreur non interceptée :', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-0 px-6 text-center text-ink">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-rose/10">
          <AlertTriangle size={22} className="text-accent-rose" />
        </div>
        <div>
          <p className="text-base font-semibold">Un problème est survenu</p>
          <p className="mt-1 text-sm text-ink/60">
            Tes données sont en sécurité. Recharge la page pour continuer.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white transition active:scale-[.97]"
        >
          <RefreshCw size={14} />
          Recharger
        </button>
      </div>
    )
  }
}
