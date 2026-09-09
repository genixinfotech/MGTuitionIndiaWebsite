import { getSupabase } from '@/lib/supabase'
import { buildAssessmentPdf } from '@/lib/assessment-pdf'
import { syncStudentSessions } from '@/lib/sessions'
import { monthlyRateForGrade } from '@/lib/tuition-plans'
import {
  addSubjectSessions,
  coveredThroughFromAdmission,
  nextCoveredThrough,
  sessionCreditsFromAdmission,
} from '@/lib/class-billing'
import { quoteStudentClassBilling } from '@/lib/class-billing-schedule'
import type {
  Admission,
  AssessmentRequest,
  AssessmentRequestDetails,
  AssessmentStatus,
  Student,
  StudentSubject,
  WeakSubjectNote,
} from '@/lib/database.types'

export const openAssessmentStatuses: AssessmentStatus[] = ['new', 'contacted', 'scheduled']

export const assessmentStatuses: AssessmentStatus[] = [
  'new',
  'contacted',
  'scheduled',
  'completed',
  'cancelled',
]

export const assessmentTimeSlots = Array.from({ length: 21 }, (_, index) => {
  const minutes = 10 * 60 + index * 30
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const value = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  const label = new Date(`1970-01-01T${value}:00`).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return { value, label }
})

export function localDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatPreferredSlot(date: string | null | undefined, time: string | null | undefined) {
  if (!date || !time) return '—'
  const timePart = time.slice(0, 5)
  const parsed = new Date(`${date}T${timePart}:00`)
  if (Number.isNaN(parsed.getTime())) return `${date} ${timePart}`
  return parsed.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function isPreferredSlotInPast(date: string, time: string) {
  const parsed = new Date(`${date}T${time}:00`)
  return Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()
}

export function assessmentsForStudent(requests: AssessmentRequest[], studentId: number) {
  return requests.filter((row) => row.student_id === studentId)
}

export function latestAssessmentForStudent(requests: AssessmentRequest[], studentId: number) {
  return assessmentsForStudent(requests, studentId)[0] ?? null
}

export function openAssessmentSubjects(requests: AssessmentRequest[], studentId: number) {
  return assessmentsForStudent(requests, studentId)
    .filter((row) => openAssessmentStatuses.includes(row.status))
    .map((row) => row.subject)
}

export function hasOpenAssessment(requests: AssessmentRequest[], studentId: number) {
  return assessmentsForStudent(requests, studentId).some((row) =>
    openAssessmentStatuses.includes(row.status),
  )
}

export function allAssessmentsCompleted(requests: AssessmentRequest[], studentId: number) {
  const rows = assessmentsForStudent(requests, studentId)
  return rows.length > 0 && rows.every((row) => row.status === 'completed')
}

export function subjectsForStudent(rows: StudentSubject[], studentId: number) {
  return rows.filter((row) => row.student_id === studentId)
}

export function admissionForStudent(rows: Admission[], studentId: number) {
  return rows.find((row) => row.student_id === studentId) ?? null
}

export function paidAdmissionSubjects(admission: Admission | null) {
  return admission?.subjects ?? []
}

export function isAdmissionPaidForSubject(admission: Admission | null, subject: string) {
  return paidAdmissionSubjects(admission).includes(subject)
}

export function paidMonthsForSubject(admission: Admission | null, subject: string) {
  if (!isAdmissionPaidForSubject(admission, subject)) return 0
  const months = admission?.subject_months?.[subject]
  if (typeof months === 'number' && months > 0) return months
  return 1
}

export function incrementSubjectMonths(
  existing: Record<string, number> | null | undefined,
  subjects: string[],
) {
  const next = { ...(existing ?? {}) }
  for (const subject of subjects) {
    const trimmed = subject.trim()
    if (!trimmed) continue
    next[trimmed] = (next[trimmed] ?? 0) + 1
  }
  return next
}

export function unpaidSubjectsForAdmission(subjects: StudentSubject[], admission: Admission | null) {
  return subjects.filter((row) => !isAdmissionPaidForSubject(admission, row.subject))
}

export type PayableTuitionSubject = {
  key: string
  subject: string
  monthly_rate: number
  student_subject_id: number | null
  hasReport: boolean
  secured: boolean
  pendingAssessment: boolean
}

export function buildPayableTuitionSubjects(input: {
  student: Pick<Student, 'id' | 'grade'>
  assignedSubjects: StudentSubject[]
  admission: Admission | null
  completedReports: Pick<AssessmentRequest, 'subject'>[]
  openRequests?: Pick<AssessmentRequest, 'subject'>[]
}) {
  const defaultRate = monthlyRateForGrade(input.student.grade)
  const bySubject = new Map<string, PayableTuitionSubject>()
  const openRequests = input.openRequests ?? []

  function reportReady(subject: string) {
    return input.completedReports.some((request) => request.subject === subject)
  }

  function assessmentPending(subject: string) {
    return openRequests.some((request) => request.subject === subject) && !reportReady(subject)
  }

  for (const row of input.assignedSubjects) {
    bySubject.set(row.subject, {
      key: `assigned-${row.id}`,
      subject: row.subject,
      monthly_rate: row.monthly_rate,
      student_subject_id: row.id,
      hasReport: reportReady(row.subject),
      secured: isAdmissionPaidForSubject(input.admission, row.subject),
      pendingAssessment: assessmentPending(row.subject),
    })
  }

  for (const request of input.completedReports) {
    if (bySubject.has(request.subject)) continue
    bySubject.set(request.subject, {
      key: `report-${request.subject}`,
      subject: request.subject,
      monthly_rate: defaultRate,
      student_subject_id: null,
      hasReport: true,
      secured: isAdmissionPaidForSubject(input.admission, request.subject),
      pendingAssessment: false,
    })
  }

  for (const request of openRequests) {
    if (bySubject.has(request.subject)) continue
    bySubject.set(request.subject, {
      key: `open-${request.subject}`,
      subject: request.subject,
      monthly_rate: defaultRate,
      student_subject_id: null,
      hasReport: false,
      secured: isAdmissionPaidForSubject(input.admission, request.subject),
      pendingAssessment: true,
    })
  }

  return [...bySubject.values()].sort((a, b) => a.subject.localeCompare(b.subject))
}

export function unpaidPayableTuitionSubjects(rows: PayableTuitionSubject[]) {
  return rows.filter((row) => !row.secured)
}

export function payableSubjectToCheckoutRow(studentId: number, row: PayableTuitionSubject): StudentSubject {
  return {
    id: row.student_subject_id ?? 0,
    student_id: studentId,
    subject: row.subject,
    monthly_rate: row.monthly_rate,
    created_at: '',
  }
}

export function paidOnlyAdmissionSubjectsFromPayable(
  payableSubjects: PayableTuitionSubject[],
  admission: Admission | null,
) {
  const current = new Set(payableSubjects.map((row) => row.subject))
  return paidAdmissionSubjects(admission).filter((subject) => !current.has(subject))
}

export function paidOnlyAdmissionSubjects(subjects: StudentSubject[], admission: Admission | null) {
  const current = new Set(subjects.map((row) => row.subject))
  return paidAdmissionSubjects(admission).filter((subject) => !current.has(subject))
}

export async function requestStudentAssessments(input: {
  studentId: number
  parentId: string
  preferredDate: string
  preferredTime: string
  subjects: string[]
}) {
  const subjects = [...new Set(input.subjects.map((subject) => subject.trim()).filter(Boolean))]
  if (subjects.length === 0) {
    throw new Error('Select at least one subject for the assessment.')
  }

  const { data, error } = await getSupabase()
    .from('assessment_requests')
    .insert(
      subjects.map((subject) => ({
        student_id: input.studentId,
        parent_id: input.parentId,
        requested_by: input.parentId,
        preferred_date: input.preferredDate,
        preferred_time: input.preferredTime,
        subject,
      })),
    )
    .select('*')

  if (error) {
    if (error.code === '23505') {
      throw new Error('An assessment has already been requested for one or more of these subjects.')
    }
    throw new Error(error.message || 'Unable to request an assessment.')
  }

  return (data ?? []) as AssessmentRequest[]
}

/** @deprecated Use requestStudentAssessments */
export async function requestStudentAssessment(input: {
  studentId: number
  parentId: string
  preferredDate: string
  preferredTime: string
  subjects?: string[]
}) {
  const rows = await requestStudentAssessments({
    ...input,
    subjects: input.subjects?.length ? input.subjects : ['General'],
  })
  return rows[0]
}

export async function listAssessmentRequests() {
  const { data, error } = await getSupabase()
    .from('assessment_requests')
    .select(
      `
      *,
      student:students (
        id, parent_id, user_id, email, full_name, city, state, school_name, board, grade, notes, created_at
      ),
      parent:profiles!parent_id (
        id, full_name, email, phone
      ),
      assigned_expert:profiles!assigned_expert_id (
        id, full_name, email
      )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load assessment requests.')
  return (data ?? []) as AssessmentRequestDetails[]
}

export async function assignAssessmentExpert(requestId: number, expertId: string | null) {
  const { error } = await getSupabase()
    .from('assessment_requests')
    .update({ assigned_expert_id: expertId })
    .eq('id', requestId)
  if (error) throw new Error(error.message || 'Unable to assign this subject expert.')
}

export async function updateAssessmentStatus(id: number, status: AssessmentStatus) {
  const { error } = await getSupabase().from('assessment_requests').update({ status }).eq('id', id)
  if (error) throw new Error(error.message || 'Unable to update this request.')
}

export async function publishAssessmentReport(input: {
  request: AssessmentRequestDetails
  weakSubjects: WeakSubjectNote[]
  recommendation: string
}) {
  const student = input.request.student
  const blob = buildAssessmentPdf({
    studentName: student?.full_name || 'Student',
    grade: student?.grade || '',
    board: student?.board || '',
    school: student?.school_name || '',
    location: [student?.city, student?.state].filter(Boolean).join(', '),
    weakSubjects: input.weakSubjects,
    recommendation: input.recommendation,
  })
  const path = `${input.request.id}.pdf`
  const supabase = getSupabase()
  const { error: uploadError } = await supabase.storage.from('assessment-reports').upload(path, blob, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (uploadError) throw new Error(uploadError.message || 'Unable to store the assessment PDF.')

  const summary = input.weakSubjects
    .map((item) => `${item.subject}: ${item.note.trim() || 'Needs support'}`)
    .join('\n')

  const { error } = await supabase
    .from('assessment_requests')
    .update({
      status: 'completed',
      report: `${summary}\n\n${input.recommendation.trim()}`.trim(),
      report_path: path,
      weak_subjects: input.weakSubjects,
    })
    .eq('id', input.request.id)
  if (error) throw new Error(error.message || 'Unable to save this report.')
  return path
}

export async function getAssessmentReportUrl(path: string) {
  const { data, error } = await getSupabase().storage.from('assessment-reports').createSignedUrl(path, 60 * 10)
  if (error || !data?.signedUrl) throw new Error(error?.message || 'Unable to open this report.')
  return data.signedUrl
}

export async function listStudentSubjects(studentIds: number[]) {
  if (studentIds.length === 0) return []
  const { data, error } = await getSupabase()
    .from('student_subjects')
    .select('*')
    .in('student_id', studentIds)
    .order('subject')
  if (error) throw new Error(error.message || 'Unable to load subjects.')
  return (data ?? []) as StudentSubject[]
}

export async function saveStudentSubjects(student: Student, subjects: string[], monthlyRate: number) {
  const supabase = getSupabase()
  const unique = [...new Set(subjects.map((subject) => subject.trim()).filter(Boolean))]
  const existing = await listStudentSubjects([student.id])
  if (unique.length === 0) return existing

  const existingNames = new Set(existing.map((row) => row.subject))
  const toAdd = unique.filter((subject) => !existingNames.has(subject))
  if (toAdd.length === 0) return existing

  const { error } = await supabase
    .from('student_subjects')
    .insert(toAdd.map((subject) => ({ student_id: student.id, subject, monthly_rate: monthlyRate })))
  if (error) throw new Error(error.message || 'Unable to save subjects.')
  return listStudentSubjects([student.id])
}

export async function listAdmissions(studentIds: number[]) {
  if (studentIds.length === 0) return []
  const { data, error } = await getSupabase().from('admissions').select('*').in('student_id', studentIds)
  if (error) throw new Error(error.message || 'Unable to load admissions.')
  return (data ?? []) as Admission[]
}

export async function payAndSecureAdmission(input: {
  studentId: number
  parentId: string
  amount: number
  subjects: string[]
  coverage?: import('@/lib/class-billing').ClassBillingLine[]
}) {
  const { data: existingRow } = await getSupabase()
    .from('admissions')
    .select('*')
    .eq('student_id', input.studentId)
    .maybeSingle()

  const existing = (existingRow ?? null) as Admission | null
  const { data: studentRow } = await getSupabase()
    .from('students')
    .select('grade')
    .eq('id', input.studentId)
    .maybeSingle()
  const mergedSubjects = [...new Set([...(existing?.subjects ?? []), ...input.subjects])]
  const mergedAmount = (existing?.amount ?? 0) + input.amount
  const coverage = input.coverage ?? []
  const subjectMonths = incrementSubjectMonths(existing?.subject_months, input.subjects)
  const paid = {
    amount: mergedAmount,
    status: 'paid' as const,
    subjects: mergedSubjects,
    subject_months: subjectMonths,
    subject_sessions: addSubjectSessions(
      sessionCreditsFromAdmission(existing, studentRow?.grade),
      coverage,
    ),
    subject_covered_through: nextCoveredThrough(coveredThroughFromAdmission(existing), coverage),
    paid_at: new Date().toISOString(),
  }

  if (existing?.id) {
    const { data, error } = await getSupabase()
      .from('admissions')
      .update(paid)
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw new Error(error.message || 'Unable to complete admission.')
    await syncStudentSessions(input.studentId)
    return data as Admission
  }

  const { data, error } = await getSupabase()
    .from('admissions')
    .insert({
      student_id: input.studentId,
      parent_id: input.parentId,
      ...paid,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message || 'Unable to complete admission.')
  await syncStudentSessions(input.studentId)
  return data as Admission
}

export async function secureAdmissionForSubject(input: {
  studentId: number
  parentId: string
  subject: string
  monthlyRate: number
}) {
  const { data: student } = await getSupabase()
    .from('students')
    .select('id, grade, board')
    .eq('id', input.studentId)
    .maybeSingle()
  const { data: admission } = await getSupabase()
    .from('admissions')
    .select('*')
    .eq('student_id', input.studentId)
    .maybeSingle()
  const coverage = await quoteStudentClassBilling({
    studentId: input.studentId,
    grade: student?.grade,
    board: student?.board,
    coveredThrough: coveredThroughFromAdmission(admission),
    subjects: [{ subject: input.subject, monthly_rate: input.monthlyRate }],
  })
  const amount = coverage.reduce((sum, line) => sum + line.amount, 0)
  return payAndSecureAdmission({
    studentId: input.studentId,
    parentId: input.parentId,
    amount,
    subjects: [input.subject],
    coverage,
  })
}

export function monthlyRateForTuitionSubject(
  student: Pick<Student, 'grade'> | null | undefined,
  assignedSubjects: StudentSubject[],
  subject: string,
) {
  const assigned = assignedSubjects.find((row) => row.subject === subject)
  return assigned?.monthly_rate ?? monthlyRateForGrade(student?.grade)
}
