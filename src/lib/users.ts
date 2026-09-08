import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'
import type { CreatableUserRole } from '@/lib/roles'

export type PortalUser = Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'role' | 'created_at' | 'updated_at'>

export type CreateUserInput = {
  full_name: string
  email: string
  phone?: string
  password: string
  role: CreatableUserRole
}

export async function listUsers() {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load users.')
  return (data ?? []) as PortalUser[]
}

export async function checkUserEmail(email: string) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to manage users.')
  }

  const params = new URLSearchParams({ email: email.trim().toLowerCase() })
  const response = await fetch(`/api/users/check-email?${params}`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const payload = (await response.json().catch(() => ({}))) as {
    available?: boolean
    message?: string
    error?: string
  }

  if (!response.ok) {
    throw new Error(payload.message || payload.error || 'Unable to check this email.')
  }

  return {
    available: Boolean(payload.available),
    message: payload.message || '',
  }
}

export async function createUser(input: CreateUserInput) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to create users.')
  }

  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(input),
  })

  const payload = (await response.json().catch(() => ({}))) as {
    user?: PortalUser
    error?: string
  }

  if (!response.ok || !payload.user) {
    throw new Error(payload.error || 'Unable to create this user.')
  }

  return payload.user
}

export function userMatchesRoleFilter(role: string, filter: string) {
  if (filter === 'all') return true
  if (filter === 'internal') {
    return [
      'superadmin',
      'admin',
      'subject-expert',
      'marketing-manager',
      'hr-manager',
      'accounts',
      'quality-manager',
      'student-consultant',
    ].includes(role)
  }
  return role === filter
}
