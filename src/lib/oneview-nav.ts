import {
  BadgeIndianRupee,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShieldCheck,
  UserCog,
  UserRound,
  Users,
  Wallet,
  Workflow,
} from 'lucide-react'
import {
  createNavItemForPath,
  createNavSubItemForPath,
  type DashboardNavConfig,
  type DashboardNavSubItem,
  type DashboardNavItem,
} from '@/lib/dashboard-nav'
import { internalRoles, normalizeRole, type AppRole } from '@/lib/roles'
import { operationsModuleChildren } from '@/lib/operations-nav'

export type OneViewNavSubItem = DashboardNavSubItem
export type OneViewNavItem = DashboardNavItem

export const oneViewNavItems: OneViewNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/oneview',
    icon: LayoutDashboard,
    roles: [
      'superadmin',
      'admin',
      'subject-expert',
      'marketing-manager',
      'hr-manager',
      'accounts',
      'quality-manager',
      'student-consultant',
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    path: '/oneview/operations',
    icon: Workflow,
    roles: ['superadmin'],
    children: operationsModuleChildren,
  },
  {
    id: 'users',
    label: 'Users & Roles',
    path: '/oneview/users',
    icon: UserCog,
    roles: ['superadmin', 'admin'],
  },
  {
    id: 'students',
    label: 'Students',
    path: '/oneview/students',
    icon: GraduationCap,
    roles: ['superadmin', 'admin', 'student-consultant', 'quality-manager'],
  },
  {
    id: 'parents',
    label: 'Parents',
    path: '/oneview/parents',
    icon: UserRound,
    roles: ['superadmin', 'admin', 'student-consultant', 'marketing-manager'],
  },
  {
    id: 'tutors',
    label: 'Tutors',
    path: '/oneview/tutors',
    icon: Users,
    roles: ['superadmin', 'admin', 'hr-manager', 'quality-manager'],
  },
  {
    id: 'enquiries',
    label: 'Enquiries',
    path: '/oneview/enquiries',
    icon: Inbox,
    roles: ['superadmin', 'admin', 'marketing-manager', 'student-consultant'],
  },
  {
    id: 'assessments',
    label: 'Assessments',
    path: '/oneview/assessments',
    icon: ClipboardCheck,
    roles: ['superadmin', 'admin', 'student-consultant', 'quality-manager'],
    children: [
      {
        id: 'assessments-web',
        label: 'Assessment Requests (Web)',
        path: '/oneview/assessments/web',
      },
      {
        id: 'assessments-portal',
        label: 'Assessment Requests (Portal)',
        path: '/oneview/assessments/portal',
      },
    ],
  },
  {
    id: 'admissions',
    label: 'Admissions',
    path: '/oneview/admissions',
    icon: BadgeIndianRupee,
    roles: ['superadmin', 'admin', 'accounts', 'student-consultant'],
  },
  {
    id: 'finance',
    label: 'Finance',
    path: '/oneview/finance',
    icon: Wallet,
    roles: ['superadmin', 'admin', 'accounts'],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    path: '/oneview/marketing',
    icon: Megaphone,
    roles: ['superadmin', 'admin', 'marketing-manager'],
  },
  {
    id: 'hr',
    label: 'HR',
    path: '/oneview/hr',
    icon: Briefcase,
    roles: ['superadmin', 'admin', 'hr-manager'],
    children: [
      {
        id: 'hr-tutor-enquiries',
        label: 'Tutor Enquiries',
        path: '/oneview/hr/tutor-enquiries',
      },
    ],
  },
  {
    id: 'quality',
    label: 'Quality',
    path: '/oneview/quality',
    icon: ShieldCheck,
    roles: ['superadmin', 'admin', 'quality-manager', 'subject-expert'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/oneview/settings',
    icon: Settings,
    roles: ['superadmin', 'admin'],
  },
]

/** Internal team roles with OneView access. */
export const oneViewAccessRoles: AppRole[] = [...internalRoles]

export function canAccessOneView(role?: string | null) {
  const normalized = normalizeRole(role)
  return oneViewAccessRoles.includes(normalized)
}

export function canAccessOneViewNav(role: AppRole | undefined, item: OneViewNavItem) {
  const normalized = normalizeRole(role)
  if (normalized === 'superadmin') return true
  return item.roles.includes(normalized)
}

export function visibleOneViewNav(role?: string | null) {
  const normalized = normalizeRole(role)
  return oneViewNavItems.filter((item) => canAccessOneViewNav(normalized, item))
}

export function oneViewNavItemForPath(pathname: string) {
  const match = oneViewNavItems.find(
    (item) => pathname === item.path || (item.path !== '/oneview' && pathname.startsWith(`${item.path}/`)),
  )
  return match ?? oneViewNavItems[0]
}

export function oneViewNavSubItemForPath(pathname: string) {
  const section = oneViewNavItemForPath(pathname)
  return section.children?.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`))
}

const navItemForPath = createNavItemForPath(oneViewNavItems)
const navSubItemForPath = createNavSubItemForPath(navItemForPath)

export const oneViewDashboardConfig: DashboardNavConfig = {
  brandTitle: 'OneView',
  storageKey: 'oneview-sidebar-collapsed',
  navItems: oneViewNavItems,
  navItemForPath,
  navSubItemForPath,
}
