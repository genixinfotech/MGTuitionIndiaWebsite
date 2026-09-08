import { paidMonthsForSubject, isAdmissionPaidForSubject } from '@/lib/assessments'
import type { Batch } from '@/lib/batches'
import type { Admission, Session, SessionStatus } from '@/lib/database.types'
import { getSupabase } from '@/lib/supabase'
import { sessionsPerMonthForGrade } from '@/lib/tuition-plans'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const GENERATION_WEEK_CAP = 52

export type SessionDateSlot = {
  sessionDate: string
  startsAt: string
  endsAt: string
}

function parseClassTime(time: string, date: string) {
  const trimmed = time.trim().toLowerCase()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/)
  if (!match) return new Date(`${date}T00:00:00`)

  let hours = Number(match[1])
  const minutes = Number(match[2])
  const meridiem = match[3]
  if (meridiem === 'pm' && hours !== 12) hours += 12
  if (meridiem === 'am' && hours === 12) hours = 0

  return new Date(
    `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`,
  )
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function buildSessionDateSlots(batch: Batch, maxSessions: number): SessionDateSlot[] {
  if (maxSessions <= 0) return []

  const batchStart = new Date(`${batch.start_date}T00:00:00`)
  if (Number.isNaN(batchStart.getTime())) return []

  const windowEnd = new Date(batchStart)
  windowEnd.setDate(windowEnd.getDate() + GENERATION_WEEK_CAP * 7)
  windowEnd.setHours(23, 59, 59, 999)

  const daySet = new Set(batch.days_of_week)
  const slots: SessionDateSlot[] = []

  for (let cursor = new Date(batchStart); cursor <= windowEnd; cursor.setDate(cursor.getDate() + 1)) {
    if (!daySet.has(cursor.getDay())) continue

    const sessionDate = dateKey(cursor)
    if (new Date(`${sessionDate}T00:00:00`) < batchStart) continue

    const start = parseClassTime(batch.start_time, sessionDate)
    const end = parseClassTime(batch.end_time, sessionDate)

    slots.push({
      sessionDate,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
    })

    if (slots.length >= maxSessions) break
  }

  return slots
}

export function paidSessionLimitForStudent(
  admission: Admission | null,
  subject: string,
  grade: string | null | undefined,
) {
  if (!isAdmissionPaidForSubject(admission, subject)) return 0
  return paidMonthsForSubject(admission, subject) * sessionsPerMonthForGrade(grade)
}

export async function refreshSessionStatuses() {
  const { error } = await getSupabase().rpc('refresh_session_statuses')
  if (error) throw new Error(error.message || 'Unable to refresh session statuses.')
}

export async function ensureStudentBatchSessions(input: {
  batch: Batch
  studentId: number
  admission: Admission | null
  studentGrade: string | null | undefined
}) {
  const limit = paidSessionLimitForStudent(
    input.admission,
    input.batch.subject,
    input.studentGrade,
  )
  if (limit <= 0) return []

  const slots = buildSessionDateSlots(input.batch, limit)
  if (slots.length === 0) return []

  const rows = slots.map((slot) => ({
    batch_id: input.batch.id,
    student_id: input.studentId,
    session_date: slot.sessionDate,
    starts_at: slot.startsAt,
    ends_at: slot.endsAt,
    status: 'scheduled' as const,
  }))

  const { data, error } = await getSupabase()
    .from('sessions')
    .upsert(rows, { onConflict: 'batch_id,student_id,session_date', ignoreDuplicates: true })
    .select('*')

  if (error) throw new Error(error.message || 'Unable to create class sessions.')

  return (data ?? []) as Session[]
}

export async function ensureStudentSessionsForAllBatches(input: {
  studentId: number
  studentGrade: string | null | undefined
  admission: Admission | null
  batches: Batch[]
}) {
  const results: Session[] = []
  for (const batch of input.batches) {
    const created = await ensureStudentBatchSessions({
      batch,
      studentId: input.studentId,
      admission: input.admission,
      studentGrade: input.studentGrade,
    })
    results.push(...created)
  }
  return results
}

export async function syncStudentSessions(studentId: number) {
  const { data: student, error: studentError } = await getSupabase()
    .from('students')
    .select('id, grade')
    .eq('id', studentId)
    .single()

  if (studentError) throw new Error(studentError.message || 'Unable to load student.')

  const { data: admissionRow } = await getSupabase()
    .from('admissions')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle()

  const { data: batchRows, error: batchError } = await getSupabase()
    .from('batch_students')
    .select(
      `
      batch:batches (*)
    `,
    )
    .eq('student_id', studentId)

  if (batchError) throw new Error(batchError.message || 'Unable to load student batches.')

  type BatchStudentRow = { batch: Batch | null }
  const batches = ((batchRows ?? []) as BatchStudentRow[])
    .map((row) => row.batch)
    .filter((batch): batch is Batch => Boolean(batch))

  return ensureStudentSessionsForAllBatches({
    studentId,
    studentGrade: student.grade,
    admission: (admissionRow as Admission | null) ?? null,
    batches,
  })
}

export async function deleteFutureScheduledSessions(batchId: number, studentId: number) {
  const today = dateKey(new Date())
  const { error } = await getSupabase()
    .from('sessions')
    .delete()
    .eq('batch_id', batchId)
    .eq('student_id', studentId)
    .eq('status', 'scheduled')
    .gte('session_date', today)

  if (error) throw new Error(error.message || 'Unable to remove future sessions.')
}

export type BatchSessionOccurrence = {
  batchId: number
  sessionDate: string
  startsAt: string
  endsAt: string
  status: SessionStatus
  recordingLink: string | null
  sessionIds: number[]
  students: Array<{
    sessionId: number
    studentId: number
    studentName: string
    attended: boolean | null
  }>
}

export async function listTutorSessionOccurrences(tutorId: string) {
  await refreshSessionStatuses()

  const { data: batches, error: batchError } = await getSupabase()
    .from('batches')
    .select('id')
    .eq('tutor_id', tutorId)

  if (batchError) throw new Error(batchError.message || 'Unable to load batches.')
  const batchIds = (batches ?? []).map((row) => row.id as number)
  if (batchIds.length === 0) return [] as BatchSessionOccurrence[]

  const { data, error } = await getSupabase()
    .from('sessions')
    .select(
      `
      id,
      batch_id,
      student_id,
      session_date,
      starts_at,
      ends_at,
      status,
      attended,
      recording_link,
      student:students ( id, full_name )
    `,
    )
    .in('batch_id', batchIds)
    .order('session_date', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load sessions.')

  type Row = Session & {
    student: { id: number; full_name: string } | null
  }

  const map = new Map<string, BatchSessionOccurrence>()
  for (const row of (data ?? []) as Row[]) {
    const key = `${row.batch_id}-${row.session_date}`
    const existing = map.get(key)
    const studentEntry = {
      sessionId: row.id,
      studentId: row.student_id,
      studentName: row.student?.full_name?.trim() || 'Student',
      attended: row.attended,
    }

    if (existing) {
      existing.sessionIds.push(row.id)
      existing.students.push(studentEntry)
      if (row.recording_link && !existing.recordingLink) {
        existing.recordingLink = row.recording_link
      }
    } else {
      map.set(key, {
        batchId: row.batch_id,
        sessionDate: row.session_date,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        status: row.status,
        recordingLink: row.recording_link,
        sessionIds: [row.id],
        students: [studentEntry],
      })
    }
  }

  return [...map.values()].sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  )
}

export async function saveSessionOccurrence(input: {
  batchId: number
  sessionDate: string
  recordingLink: string | null
  attendance: Array<{ sessionId: number; attended: boolean }>
}) {
  const recording = input.recordingLink?.trim() || null
  if (recording && !/^https?:\/\/.+/i.test(recording)) {
    throw new Error('Recording link must start with http:// or https://')
  }

  for (const row of input.attendance) {
    const { error } = await getSupabase()
      .from('sessions')
      .update({
        attended: row.attended,
        recording_link: recording,
      })
      .eq('id', row.sessionId)
      .eq('batch_id', input.batchId)
      .eq('session_date', input.sessionDate)

    if (error) throw new Error(error.message || 'Unable to save attendance.')
  }

  if (input.attendance.length === 0 && recording) {
    const { error } = await getSupabase()
      .from('sessions')
      .update({ recording_link: recording })
      .eq('batch_id', input.batchId)
      .eq('session_date', input.sessionDate)

    if (error) throw new Error(error.message || 'Unable to save recording link.')
  }
}

export function weekdayLabelForDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return ''
  return weekdayLabels[parsed.getDay()] ?? ''
}
