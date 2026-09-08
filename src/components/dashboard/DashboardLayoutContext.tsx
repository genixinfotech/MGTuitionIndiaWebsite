import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DashboardNavConfig } from '@/lib/dashboard-nav'

type DashboardLayoutContextValue = {
  config: DashboardNavConfig
  collapsed: boolean
  mobileOpen: boolean
  setCollapsed: (value: boolean) => void
  toggleCollapsed: () => void
  setMobileOpen: (value: boolean) => void
  toggleMobileOpen: () => void
}

const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null)

export function DashboardLayoutProvider({
  config,
  children,
}: {
  config: DashboardNavConfig
  children: ReactNode
}) {
  const [collapsed, setCollapsedState] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(config.storageKey)
      if (stored === 'true') setCollapsedState(true)
    } catch {
      /* ignore */
    }
  }, [config.storageKey])

  function setCollapsed(value: boolean) {
    setCollapsedState(value)
    try {
      localStorage.setItem(config.storageKey, String(value))
    } catch {
      /* ignore */
    }
  }

  const value = useMemo(
    () => ({
      config,
      collapsed,
      mobileOpen,
      setCollapsed,
      toggleCollapsed: () => setCollapsed(!collapsed),
      setMobileOpen,
      toggleMobileOpen: () => setMobileOpen((open) => !open),
    }),
    [collapsed, config, mobileOpen],
  )

  return <DashboardLayoutContext.Provider value={value}>{children}</DashboardLayoutContext.Provider>
}

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext)
  if (!context) {
    throw new Error('useDashboardLayout must be used within DashboardLayoutProvider')
  }
  return context
}
