import {
  isDashboardRole,
  isStudentConsultantRole,
  roleLabel,
  type AppRole,
} from '@/lib/roles'
import { canAccessOneView } from '@/lib/oneview-nav'

export { isDashboardRole, isStudentConsultantRole, roleLabel }
export type { AppRole }

export function homePathForRole(role?: string | null) {
  if (canAccessOneView(role)) {
    if (isStudentConsultantRole(role)) return '/oneview/assessments/web'
    return '/oneview'
  }
  return '/portal'
}

export const dashboardPaths = ['/portal', '/student', '/oneview'] as const

export function isDashboardRoute(pathname: string) {
  return dashboardPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
