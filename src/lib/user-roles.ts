import { getSupabase } from '@/lib/supabase'
import { dashedRole, roleLabel } from '@/lib/roles'

export type UserRoleKind = 'account' | 'system'

export type UserRole = {
  id: number
  slug: string
  label: string
  kind: UserRoleKind
  locked: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type UserRoleInput = {
  slug: string
  label: string
}

function slugFromLabel(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeRoleSlug(value: string) {
  return slugFromLabel(value)
}

export function isValidRoleSlug(value: string) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
}

export function catalogRoleLabel(slug: string | null | undefined, roles: UserRole[]) {
  const dashed = dashedRole(slug)
  return roles.find((role) => role.slug === dashed)?.label ?? roleLabel(dashed)
}

export function assignableUserRoles(roles: UserRole[], callerRole?: string | null) {
  const caller = dashedRole(callerRole)
  return roles.filter((role) => {
    if (role.slug === 'student') return false
    if (role.slug === 'superadmin' && caller !== 'superadmin') return false
    return true
  })
}

export async function listUserRoles() {
  const { data, error } = await getSupabase()
    .from('user_roles')
    .select('id, slug, label, kind, locked, sort_order, created_at, updated_at')
    .order('sort_order', { ascending: true })
    .order('label', { ascending: true })
  if (error) throw new Error(error.message || 'Unable to load user types.')
  return (data ?? []) as UserRole[]
}

export async function createUserRole(input: UserRoleInput) {
  const label = input.label.trim()
  const slug = normalizeRoleSlug(input.slug || label)
  if (!label) throw new Error('Enter a name for this user type.')
  if (!isValidRoleSlug(slug)) {
    throw new Error('Use a lowercase slug with letters, numbers, and dashes only.')
  }

  const { data: existing } = await getSupabase()
    .from('user_roles')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data, error } = await getSupabase()
    .from('user_roles')
    .insert({
      slug,
      label,
      kind: 'system',
      locked: false,
      sort_order: (Number(existing?.sort_order) || 100) + 10,
    })
    .select('id, slug, label, kind, locked, sort_order, created_at, updated_at')
    .single()
  if (error || !data) {
    if (/duplicate|unique/i.test(error?.message || '')) {
      throw new Error('That user type already exists.')
    }
    throw new Error(error?.message || 'Unable to add this user type.')
  }
  return data as UserRole
}

export async function updateUserRole(id: number, input: { label: string }) {
  const label = input.label.trim()
  if (!label) throw new Error('Enter a name for this user type.')
  const { data, error } = await getSupabase()
    .from('user_roles')
    .update({ label })
    .eq('id', id)
    .select('id, slug, label, kind, locked, sort_order, created_at, updated_at')
    .single()
  if (error || !data) throw new Error(error?.message || 'Unable to update this user type.')
  return data as UserRole
}

export async function deleteUserRole(id: number) {
  const { data: role, error: loadError } = await getSupabase()
    .from('user_roles')
    .select('id, slug, locked')
    .eq('id', id)
    .maybeSingle()
  if (loadError) throw new Error(loadError.message || 'Unable to load this user type.')
  if (!role) throw new Error('That user type was not found.')
  if (role.locked) throw new Error('This user type is required and cannot be removed.')

  const { count, error: countError } = await getSupabase()
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', role.slug)
  if (countError) throw new Error(countError.message || 'Unable to check who uses this user type.')
  if ((count ?? 0) > 0) {
    throw new Error('Reassign users with this type before removing it.')
  }

  const { error } = await getSupabase().from('user_roles').delete().eq('id', id)
  if (error) throw new Error(error.message || 'Unable to remove this user type.')
}
