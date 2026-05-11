import { createContext, useContext, ReactNode } from 'react'

type SetPanel = (node: ReactNode) => void

const Ctx = createContext<SetPanel>(() => {})

export function RightPanelProvider({
  children,
  onPanel,
}: {
  children: ReactNode
  onPanel: SetPanel
}) {
  return <Ctx.Provider value={onPanel}>{children}</Ctx.Provider>
}

export function useRightPanel() {
  return useContext(Ctx)
}
