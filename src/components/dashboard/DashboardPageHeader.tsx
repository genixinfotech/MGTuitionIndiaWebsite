import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useDashboardLayout } from '@/components/dashboard/DashboardLayoutContext'

export function DashboardPageHeader({
  title,
  icon,
  children,
}: {
  title?: string
  icon?: LucideIcon
  children?: ReactNode
}) {
  const { pathname } = useLocation()
  const { config } = useDashboardLayout()
  const section = config.navItemForPath(pathname)
  const subSection = config.navSubItemForPath?.(pathname)
  const Icon = icon ?? section.icon
  const pageTitle = title ?? subSection?.label ?? section.label

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-crimson/[0.08] text-crimson">
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <h1 className="truncate text-xl font-extrabold tracking-tight text-charcoal md:text-2xl">
          {pageTitle}
        </h1>
      </div>
      {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
    </div>
  )
}
