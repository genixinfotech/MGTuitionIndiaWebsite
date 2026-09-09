import { getSupabase } from '@/lib/supabase'
import type { TuitionPayment, TuitionPaymentStatus } from '@/lib/database.types'
import { isClassBillingLine, type ClassBillingLine } from '@/lib/class-billing'
import { receiptNumberForPayment, type TuitionPaymentReceipt } from '@/lib/payments'

export type TuitionPaymentPerson = {
  full_name: string | null
  email: string | null
  grade?: string | null
}

export type TuitionPaymentWithPeople = TuitionPayment & {
  student: TuitionPaymentPerson | null
  parent: TuitionPaymentPerson | null
}

type PaymentRow = TuitionPayment & {
  student?: TuitionPaymentPerson | TuitionPaymentPerson[] | null
  parent?: TuitionPaymentPerson | TuitionPaymentPerson[] | null
}

function asPerson(value: PaymentRow['student']): TuitionPaymentPerson | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function normalizePayment(row: PaymentRow): TuitionPaymentWithPeople {
  const subjects = Array.isArray(row.subjects)
    ? row.subjects.map((item) => (typeof item === 'string' ? item : String(item)))
    : []
  return {
    ...row,
    subjects,
    coverage: Array.isArray(row.coverage) ? row.coverage : [],
    student: asPerson(row.student),
    parent: asPerson(row.parent),
  }
}

export async function listTuitionPayments() {
  const { data, error } = await getSupabase()
    .from('tuition_payments')
    .select(
      `
      *,
      student:students!student_id ( full_name, email, grade ),
      parent:profiles!parent_id ( full_name, email )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load payments.')
  return ((data ?? []) as PaymentRow[]).map(normalizePayment)
}

export function receiptFromPayment(payment: TuitionPaymentWithPeople): TuitionPaymentReceipt {
  const coverage = (payment.coverage ?? []).filter(isClassBillingLine) as ClassBillingLine[]
  return {
    receiptNumber: receiptNumberForPayment(payment.id),
    transactionId: payment.provider_payment_id,
    sessionId: payment.provider_session_id,
    paidAt: payment.paid_at || payment.created_at,
    amount: payment.amount,
    currency: payment.currency || 'USD',
    studentName: payment.student?.full_name || 'Student',
    studentGrade: payment.student?.grade || null,
    parentEmail: payment.parent?.email || null,
    subjects: payment.subjects,
    coverage,
    renewal: payment.renewal,
    provider: payment.provider,
  }
}

export const paymentStatusLabels: Record<TuitionPaymentStatus, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export const paymentProviderLabels: Record<TuitionPayment['provider'], string> = {
  stripe: 'Stripe',
  razorpay: 'Razorpay',
  manual: 'Manual',
}
