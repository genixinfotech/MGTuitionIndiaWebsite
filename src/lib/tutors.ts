import { getSupabase } from '@/lib/supabase'
import type { Profile, Tutor } from '@/lib/database.types'

export type TutorProfile = Profile & {
  tutor: Tutor
}

export async function listTutors() {
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
      tutors!inner ( id )
    `,
    )
    .eq('role', 'tutor')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load tutors.')
  return (data ?? []) as Profile[]
}

export async function getTutor(id: string) {
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
      tutors!inner ( id, timezone, created_at, updated_at )
    `,
    )
    .eq('id', id)
    .eq('role', 'tutor')
    .maybeSingle()

  if (error) throw new Error(error.message || 'Unable to load this tutor.')
  if (!data) return null

  const { tutors, ...profile } = data as Profile & { tutors: Tutor | Tutor[] }
  const tutor = Array.isArray(tutors) ? tutors[0] : tutors
  if (!tutor) return null

  return { ...profile, tutor } as TutorProfile
}

export type CreateTutorInput = {
  full_name: string
  email: string
  phone?: string
  password: string
}

export async function createTutor(input: CreateTutorInput) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to add a tutor.')
  }

  const response = await fetch('/api/tutors', {
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
    tutor?: Profile
  }

  if (!response.ok || !payload.tutor) {
    throw new Error(payload.error || 'Unable to add this tutor.')
  }

  return payload.tutor
}

export type TutorEmailCheckResult = {
  available: boolean
  message?: string
}

export async function checkTutorEmail(email: string) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to check this email.')
  }

  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
  })

  const response = await fetch(`/api/tutors/check-email?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const payload = (await response.json().catch(() => ({}))) as TutorEmailCheckResult

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to check this email.')
  }

  return payload
}
