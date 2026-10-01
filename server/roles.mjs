export const internalRoles = [
  'superadmin',
  'admin',
  'subject-expert',
  'marketing-manager',
  'hr-manager',
  'accounts',
  'quality-manager',
  'student-consultant',
]

const portalAccountRoles = new Set(['parent', 'tutor', 'student'])

const legacyRoleMap = {
  student_consultant: 'student-consultant',
  hr: 'hr-manager',
}

const appRoles = new Set(['parent', 'student', 'tutor', ...internalRoles])

export function dashedRole(role) {
  if (!role) return 'parent'
  const dashed = String(role).replace(/_/g, '-')
  if (legacyRoleMap[role]) return legacyRoleMap[role]
  if (legacyRoleMap[dashed]) return legacyRoleMap[dashed]
  return dashed
}

export function normalizeRole(role) {
  const dashed = dashedRole(role)
  if (appRoles.has(dashed)) return dashed
  return 'parent'
}

export function isInternalRole(role) {
  const dashed = dashedRole(role)
  return Boolean(dashed) && !portalAccountRoles.has(dashed)
}

export function canEnrolStudents(role) {
  return dashedRole(role) === 'parent' || isInternalRole(role)
}
