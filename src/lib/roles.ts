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

const portalAccountRoles = new Set(['parent', 'tutor', 'student'])

const legacyRoleMap: Record<string, AppRole> = {
  student_consultant: 'student-consultant',
  hr: 'hr-manager',
}

export function dashedRole(role?: string | null) {
  if (!role) return 'parent'
  const dashed = role.replace(/_/g, '-')
  if (legacyRoleMap[role]) return legacyRoleMap[role]
  if (legacyRoleMap[dashed]) return legacyRoleMap[dashed]
  return dashed
}

export function normalizeRole(role?: string | null): AppRole {
  const dashed = dashedRole(role)
  if (appRoles.includes(dashed as AppRole)) return dashed as AppRole
  return 'parent'
}

export function isInternalRole(role?: string | null) {
  const dashed = dashedRole(role)
  return Boolean(dashed) && !portalAccountRoles.has(dashed)
}

export function isStudentConsultantRole(role?: string | null) {
  return dashedRole(role) === 'student-consultant'
}

export function isDashboardRole(role?: string | null) {
  return isInternalRole(role)
}

export function canEnrolStudents(role?: string | null) {
  return dashedRole(role) === 'parent' || isInternalRole(role)
}

export function roleLabel(role?: string | null) {
  const dashed = dashedRole(role)
  if (dashed in roleLabels) return roleLabels[dashed as AppRole]
  return dashed
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
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

export function roleEntityTable(role?: string | null) {
  const dashed = dashedRole(role)
  if (dashed === 'student') return null
  if (dashed === 'tutor') return 'tutors'
  if (dashed === 'parent') return 'parents'
  return 'system_users'
}

export function roleEntityTableLabel(role?: string | null) {
  const table = roleEntityTable(role)
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
