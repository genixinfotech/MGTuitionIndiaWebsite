import type { ReactNode } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { oneViewDashboardConfig } from '@/lib/oneview-nav'

export function OneViewShell({ children }: { children: ReactNode }) {
  return <DashboardShell config={oneViewDashboardConfig}>{children}</DashboardShell>
}
