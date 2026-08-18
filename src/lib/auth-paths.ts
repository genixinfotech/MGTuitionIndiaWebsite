export function homePathForRole(role?: string | null) {
  if (role === 'staff' || role === 'student_consultant') return '/dashboard'
  if (role === 'student') return '/student'
  return '/portal'
}

export function isDashboardRole(role?: string | null) {
  return role === 'staff' || role === 'student_consultant'
}

export const dashboardPaths = ['/dashboard', '/portal', '/student'] as const

export function isDashboardRoute(pathname: string) {
  return dashboardPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function roleLabel(role?: string | null) {
  if (role === 'staff') return 'Staff'
  if (role === 'student_consultant') return 'Student consultant'
  if (role === 'student') return 'Student'
  if (role === 'tutor') return 'Tutor'
  return 'Parent'
}
