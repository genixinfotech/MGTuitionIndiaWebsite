import type { ReactNode } from 'react'
import type { DashboardNavConfig } from '@/lib/dashboard-nav'
import { DashboardLayoutProvider, useDashboardLayout } from '@/components/dashboard/DashboardLayoutContext'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar'
import { cn } from '@/lib/utils'

function DashboardFrame({ children }: { children: ReactNode }) {
  const { collapsed } = useDashboardLayout()

  return (
    <div className="min-h-screen bg-gray-50 text-charcoal">
      <DashboardSidebar />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-300 ease-out',
          collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64',
        )}
      >
        <DashboardTopBar />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  )
}

export function DashboardShell({
  config,
  children,
}: {
  config: DashboardNavConfig
  children: ReactNode
}) {
  return (
    <DashboardLayoutProvider config={config}>
      <DashboardFrame>{children}</DashboardFrame>
    </DashboardLayoutProvider>
  )
}
