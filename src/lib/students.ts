import { getSupabase } from '@/lib/supabase'
import type { EnrolmentForm } from '@/lib/enrolment'
import type { Student, StudentWithParent } from '@/lib/database.types'

export async function listStudents() {
  const { data, error } = await getSupabase()
    .from('students')
    .select(
      `
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
      created_at,
      parent:profiles!parent_id (
        id,
        full_name,
        email,
        phone
      )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load students.')
  return (data ?? []) as StudentWithParent[]
}

export async function enrolStudent(input: EnrolmentForm & { parent_id: string }) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to enrol a student.')
  }

  const response = await fetch('/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      parent_id: input.parent_id,
      full_name: input.full_name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      city: input.city.trim(),
      state: input.state,
      grade: input.grade,
      board: input.board,
      school_name: input.school_name.trim(),
    }),
  })

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string
    student?: Student
  }

  if (!response.ok || !payload.student) {
    throw new Error(payload.error || 'Unable to enrol this student.')
  }

  return payload.student
}

export type StudentEmailCheckResult = {
  available: boolean
  message?: string
}

export async function checkStudentEmail(email: string, parentId?: string) {
  const {
    data: { session },
  } = await getSupabase().auth.getSession()

  if (!session?.access_token) {
    throw new Error('Please sign in again to check this email.')
  }

  const params = new URLSearchParams({
    email: email.trim().toLowerCase(),
  })
  if (parentId) params.set('parent_id', parentId)

  const response = await fetch(`/api/students/check-email?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  })

  const payload = (await response.json().catch(() => ({}))) as StudentEmailCheckResult

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to check this email.')
  }

  return payload
}
