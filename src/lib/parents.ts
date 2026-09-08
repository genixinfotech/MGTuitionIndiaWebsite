import { getSupabase } from '@/lib/supabase'
import type { ParentWithStudents, Student } from '@/lib/database.types'

export type ParentOption = Pick<
  ParentWithStudents,
  'id' | 'full_name' | 'email' | 'phone'
>

export async function listParentOptions() {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(
      `
      id,
      full_name,
      email,
      phone,
      parents!inner ( id )
    `,
    )
    .eq('role', 'parent')
    .order('full_name', { ascending: true })

  if (error) throw new Error(error.message || 'Unable to load parents.')

  return (data ?? []) as ParentOption[]
}

const studentFields = `
  id,
  parent_id,
  user_id,
  email,
  full_name,
  city,
  state,
  school_name,
  board,
  grade,
  notes,
  created_at
`

export async function listParents() {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select(
      `
      id,
      full_name,
      email,
      phone,
      role,
      created_at,
      updated_at,
      parents!inner ( id ),
      students ( ${studentFields} )
    `,
    )
    .eq('role', 'parent')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load parents.')

  type ParentRow = Omit<ParentWithStudents, 'students'> & {
    students: Student[]
  }

  return ((data ?? []) as ParentRow[]).map(({ students, ...profile }) => ({
    ...profile,
    students: [...students].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ),
  }))
}

export type CreateParentInput = {
  full_name: string
  email: string
  phone?: string
  password: string
}

export async function createParent(input: CreateParentInput) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to add a parent.')
  }

  const response = await fetch('/api/parents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || '',
      password: input.password,
    }),
  })

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string
    parent?: ParentWithStudents
  }

  if (!response.ok || !payload.parent) {
    throw new Error(payload.error || 'Unable to add this parent.')
  }

  return payload.parent
}

export type ParentEmailCheckResult = {
  available: boolean
  message?: string
}

export async function checkParentEmail(email: string) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to check this email.')
  }

  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
  })

  const response = await fetch(`/api/parents/check-email?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const payload = (await response.json().catch(() => ({}))) as ParentEmailCheckResult

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to check this email.')
  }

  return payload
}
