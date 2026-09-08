/** Portal roles — lowercase with hyphens in code. */
export const appRoles = [
  'superadmin',
  'admin',
  'subject-expert',
  'marketing-manager',
  'hr-manager',
  'accounts',
  'quality-manager',
  'student-consultant',
  'student',
  'tutor',
  'parent',
] as const

export type AppRole = (typeof appRoles)[number]

/** Internal team roles with dashboard access. */
export const internalRoles = [
  'superadmin',
  'admin',
  'subject-expert',
  'marketing-manager',
  'hr-manager',
  'accounts',
  'quality-manager',
  'student-consultant',
] as const

export type InternalRole = (typeof internalRoles)[number]

export const roleLabels: Record<AppRole, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  'subject-expert': 'Subject Expert',
  'marketing-manager': 'Marketing Manager',
  'hr-manager': 'HR Manager',
  accounts: 'Accounts',
  'quality-manager': 'Quality Manager',
  'student-consultant': 'Student Consultant',
  student: 'Student',
  tutor: 'Tutor',
  parent: 'Parent',
}

const internalRoleSet = new Set<string>(internalRoles)

const legacyRoleMap: Record<string, AppRole> = {
  staff: 'admin',
  student_consultant: 'student-consultant',
  hr: 'hr-manager',
}

export function normalizeRole(role?: string | null): AppRole {
  if (!role) return 'parent'
  if (legacyRoleMap[role]) return legacyRoleMap[role]
  if (appRoles.includes(role as AppRole)) return role as AppRole
  return 'parent'
}

export function isInternalRole(role?: string | null) {
  const normalized = normalizeRole(role)
  return internalRoleSet.has(normalized)
}

export function isStudentConsultantRole(role?: string | null) {
  return normalizeRole(role) === 'student-consultant'
}

export function isDashboardRole(role?: string | null) {
  return isInternalRole(role)
}

export function canEnrolStudents(role?: string | null) {
  const normalized = normalizeRole(role)
  return normalized === 'parent' || isInternalRole(normalized)
}

export function roleLabel(role?: string | null) {
  return roleLabels[normalizeRole(role)]
}

/** Roles that can be assigned from OneView → Users (students use enrolment). */
export const creatableUserRoles = [
  'superadmin',
  'admin',
  'subject-expert',
  'marketing-manager',
  'hr-manager',
  'accounts',
  'quality-manager',
  'student-consultant',
  'tutor',
  'parent',
] as const satisfies readonly AppRole[]

export type CreatableUserRole = (typeof creatableUserRoles)[number]

/** Dedicated entity table synced when a user is created with this role. */
export const roleEntityTables: Partial<Record<AppRole, string>> = {
  tutor: 'tutors',
  parent: 'parents',
  'quality-manager': 'quality_managers',
  'student-consultant': 'student_consultants',
}

export function roleEntityTableLabel(role?: string | null) {
  const table = roleEntityTables[normalizeRole(role)]
  return table?.replace(/_/g, ' ') ?? null
}

export function creatableRolesForCaller(callerRole?: string | null) {
  const normalized = normalizeRole(callerRole)
  if (normalized === 'superadmin') return [...creatableUserRoles]
  if (normalized === 'admin') {
    return creatableUserRoles.filter((role) => role !== 'superadmin')
  }
  return []
}
