import {
  isDashboardRole,
  isStudentConsultantRole,
  normalizeRole,
  roleLabel,
  type AppRole,
} from '@/lib/roles'
import { canAccessOneView } from '@/lib/oneview-nav'

export { isDashboardRole, isStudentConsultantRole, roleLabel }
export type { AppRole }

export function homePathForRole(role?: string | null) {
  const normalized = normalizeRole(role)
  if (canAccessOneView(normalized)) {
    if (isStudentConsultantRole(normalized)) return '/oneview/assessments/web'
    return '/oneview'
  }
  if (normalized === 'student') return '/portal'
  return '/portal'
}

export const dashboardPaths = ['/portal', '/student', '/oneview'] as const

export function isDashboardRoute(pathname: string) {
  return dashboardPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
