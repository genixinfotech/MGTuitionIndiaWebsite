import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'oneview-sidebar-collapsed'

type OneViewContextValue = {
  collapsed: boolean
  mobileOpen: boolean
  setCollapsed: (value: boolean) => void
  toggleCollapsed: () => void
  setMobileOpen: (value: boolean) => void
  toggleMobileOpen: () => void
}

const OneViewContext = createContext<OneViewContextValue | null>(null)

export function OneViewProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') setCollapsedState(true)
    } catch {
      /* ignore */
    }
  }, [])

  function setCollapsed(value: boolean) {
    setCollapsedState(value)
    try {
      localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      /* ignore */
    }
  }

  const value = useMemo(
    () => ({
      collapsed,
      mobileOpen,
      setCollapsed,
      toggleCollapsed: () => setCollapsed(!collapsed),
      setMobileOpen,
      toggleMobileOpen: () => setMobileOpen((open) => !open),
    }),
    [collapsed, mobileOpen],
  )

  return <OneViewContext.Provider value={value}>{children}</OneViewContext.Provider>
}

export function useOneViewLayout() {
  const context = useContext(OneViewContext)
  if (!context) {
    throw new Error('useOneViewLayout must be used within OneViewProvider')
  }
  return context
}
