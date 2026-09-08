import { BookOpen, GraduationCap, LayoutDashboard, Receipt, UserRound } from 'lucide-react'
import {
  createNavItemForPath,
  createNavSubItemForPath,
  type DashboardNavConfig,
  type DashboardNavItem,
} from '@/lib/dashboard-nav'
import type { AppRole } from '@/lib/roles'

export const portalNavItems: DashboardNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/portal',
    icon: LayoutDashboard,
    roles: ['parent', 'tutor', 'student'],
  },
  {
    id: 'students',
    label: 'Students',
    path: '/portal/students',
    icon: GraduationCap,
    roles: ['parent'],
  },
  {
    id: 'receipts',
    label: 'Receipts',
    path: '/portal/receipts',
    icon: Receipt,
    roles: ['parent'],
  },
  {
    id: 'classes',
    label: 'Classes',
    path: '/portal/classes',
    icon: BookOpen,
    roles: ['student', 'tutor'],
  },
  {
    id: 'profile',
    label: 'Profile',
    path: '/portal/profile',
    icon: UserRound,
    roles: ['parent', 'tutor', 'student'],
  },
]

export const portalAccessRoles: AppRole[] = ['parent', 'tutor', 'student']

const navItemForPath = createNavItemForPath(portalNavItems)
const navSubItemForPath = createNavSubItemForPath(navItemForPath)

export const portalDashboardConfig: DashboardNavConfig = {
  brandTitle: 'Portal',
  storageKey: 'portal-sidebar-collapsed',
  navItems: portalNavItems,
  navItemForPath,
  navSubItemForPath,
}

export { navItemForPath as portalNavItemForPath, navSubItemForPath as portalNavSubItemForPath }
