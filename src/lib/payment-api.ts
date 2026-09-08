import { getSupabase } from '@/lib/supabase'
import { syncStudentSessions } from '@/lib/sessions'
import type { Admission } from '@/lib/database.types'
import type { TuitionPaymentReceipt } from '@/lib/payments'

async function authHeaders() {
  const { data, error } = await getSupabase().auth.getSession()
  if (error || !data.session?.access_token) {
    throw new Error('Please sign in again to continue payment.')
  }
  return {
    Authorization: `Bearer ${data.session.access_token}`,
    'Content-Type': 'application/json',
  }
}

export async function startTuitionCheckout(input: {
  studentId: number
  subjects: Array<{ subject: string; monthly_rate: number }>
  renewal?: boolean
}) {
  const res = await fetch('/api/payments/checkout', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  })
  const payload = (await res.json()) as { error?: string; url?: string }
  if (!res.ok || !payload.url) {
    throw new Error(payload.error || 'Unable to start card payment.')
  }
  return payload.url
}

export async function confirmTuitionCheckout(sessionId: string) {
  const res = await fetch('/api/payments/confirm', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ sessionId }),
  })
  const payload = (await res.json()) as {
    error?: string
    admission?: Admission
    receipt?: TuitionPaymentReceipt
  }
  if (!res.ok || !payload.admission) {
    throw new Error(payload.error || 'Unable to confirm this payment.')
  }
  await syncStudentSessions(payload.admission.student_id)
  return { admission: payload.admission, receipt: payload.receipt ?? null }
}
