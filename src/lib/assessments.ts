import { getSupabase } from '@/lib/supabase'
import { buildAssessmentPdf } from '@/lib/assessment-pdf'
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

export function latestAssessmentForStudent(requests: AssessmentRequest[], studentId: number) {
  return requests.find((row) => row.student_id === studentId) ?? null
}

export function hasOpenAssessment(requests: AssessmentRequest[], studentId: number) {
  return requests.some(
    (row) => row.student_id === studentId && openAssessmentStatuses.includes(row.status),
  )
}

export function hasCompletedAssessment(requests: AssessmentRequest[], studentId: number) {
  const latest = latestAssessmentForStudent(requests, studentId)
  return latest?.status === 'completed'
}

export function subjectsForStudent(rows: StudentSubject[], studentId: number) {
  return rows.filter((row) => row.student_id === studentId)
}

export function admissionForStudent(rows: Admission[], studentId: number) {
  return rows.find((row) => row.student_id === studentId) ?? null
}

export async function requestStudentAssessment(input: {
  studentId: number
  parentId: string
  preferredDate: string
  preferredTime: string
}) {
  const { data, error } = await getSupabase()
    .from('assessment_requests')
    .insert({
      student_id: input.studentId,
      parent_id: input.parentId,
      requested_by: input.parentId,
      preferred_date: input.preferredDate,
      preferred_time: input.preferredTime,
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('An assessment has already been requested for this student.')
    }
    throw new Error(error.message || 'Unable to request an assessment.')
  }

  return data as AssessmentRequest
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
      )
    `,
    )
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load assessment requests.')
  return (data ?? []) as AssessmentRequestDetails[]
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
  const { error: deleteError } = await supabase.from('student_subjects').delete().eq('student_id', student.id)
  if (deleteError) throw new Error(deleteError.message || 'Unable to update subjects.')
  if (subjects.length === 0) return []
  const { data, error } = await supabase
    .from('student_subjects')
    .insert(subjects.map((subject) => ({ student_id: student.id, subject, monthly_rate: monthlyRate })))
    .select('*')
  if (error) throw new Error(error.message || 'Unable to save subjects.')
  return (data ?? []) as StudentSubject[]
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
}) {
  const paid = {
    amount: input.amount,
    status: 'paid' as const,
    subjects: input.subjects,
    paid_at: new Date().toISOString(),
  }
  const { data: existing } = await getSupabase()
    .from('admissions')
    .select('id')
    .eq('student_id', input.studentId)
    .maybeSingle()

  if (existing?.id) {
    const { data, error } = await getSupabase()
      .from('admissions')
      .update(paid)
      .eq('id', existing.id)
      .select('*')
      .single()
    if (error) throw new Error(error.message || 'Unable to complete admission.')
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
  return data as Admission
}
