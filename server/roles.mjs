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

const internalRoleSet = new Set(internalRoles)

const legacyRoleMap = {
  staff: 'admin',
  student_consultant: 'student-consultant',
  hr: 'hr-manager',
}

export function normalizeRole(role) {
  if (!role) return 'parent'
  if (legacyRoleMap[role]) return legacyRoleMap[role]
  if (internalRoleSet.has(role) || role === 'parent' || role === 'student' || role === 'tutor') {
    return role
  }
  return 'parent'
}

export function isInternalRole(role) {
  return internalRoleSet.has(normalizeRole(role))
}

export function canEnrolStudents(role) {
  const normalized = normalizeRole(role)
  return normalized === 'parent' || isInternalRole(normalized)
}
