import type { LucideIcon } from 'lucide-react'
import { normalizeRole, type AppRole } from '@/lib/roles'

export type DashboardNavSubItem = {
  id: string
  label: string
  path: string
}

export type DashboardNavItem = {
  id: string
  label: string
  path: string
  icon: LucideIcon
  roles: AppRole[]
  children?: DashboardNavSubItem[]
}

export type DashboardNavConfig = {
  brandTitle: string
  storageKey: string
  navItems: DashboardNavItem[]
  navItemForPath: (pathname: string) => DashboardNavItem
  navSubItemForPath?: (pathname: string) => DashboardNavSubItem | undefined
}

export function visibleDashboardNav(role: AppRole | undefined, items: DashboardNavItem[]) {
  const normalized = normalizeRole(role)
  if (normalized === 'superadmin') return items
  return items.filter((item) => item.roles.includes(normalized))
}

export function createNavItemForPath(items: DashboardNavItem[], fallbackIndex = 0) {
  return function navItemForPath(pathname: string) {
    const match = items.find(
      (item) =>
        pathname === item.path ||
        (item.path !== items[fallbackIndex]?.path && pathname.startsWith(`${item.path}/`)),
    )
    return match ?? items[fallbackIndex]
  }
}

export function createNavSubItemForPath(
  navItemForPath: (pathname: string) => DashboardNavItem,
) {
  return function navSubItemForPath(pathname: string) {
    const section = navItemForPath(pathname)
    return section.children?.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    )
  }
}

export function canAccessDashboardNavPath(
  role: AppRole | undefined,
  pathname: string,
  navItemForPath: (pathname: string) => DashboardNavItem,
) {
  const normalized = normalizeRole(role)
  if (normalized === 'superadmin') return true
  const section = navItemForPath(pathname)
  return section.roles.includes(normalized)
}
