import { formatBatchDays, formatBatchSchedule } from '@/lib/batch-heroes'
import type { Batch } from '@/lib/batches'
import type { Admission, Profile, Session, Student } from '@/lib/database.types'
import { refreshSessionStatuses, weekdayLabelForDate } from '@/lib/sessions'
import { getSupabase } from '@/lib/supabase'

export type ClassSessionStatus = 'today' | 'upcoming' | 'past'

export type DbSessionStatus = 'scheduled' | 'completed' | 'cancelled'

export type ClassSession = {
  id: string
  dbId: number
  batchId: number
  subject: string
  batchName: string
  date: string
  weekdayLabel: string
  startTime: string
  endTime: string
  tutorId: string
  tutorName: string
  meetingLink: string | null
  recordingLink: string | null
  sessionStatus: DbSessionStatus
  attended: boolean | null
  status: ClassSessionStatus
  startsAt: number
  endsAt: number
}

export type StudentBatchAssignment = {
  batch: Batch
  tutor: Pick<Profile, 'id' | 'full_name' | 'email'> | null
  scheduleLabel: string
  daysLabel: string
}

export type SubjectClassGroup = {
  subject: string
  assignment: StudentBatchAssignment
  today: ClassSession[]
  upcoming: ClassSession[]
  past: ClassSession[]
}

function classifySession(start: Date, end: Date, now: Date): ClassSessionStatus {
  if (end.getTime() < now.getTime()) return 'past'
  if (start.toDateString() === now.toDateString()) return 'today'
  return 'upcoming'
}

function mapSessionToClassSession(
  row: Session,
  batch: Batch,
  tutor: Pick<Profile, 'id' | 'full_name' | 'email'> | null,
  now: Date,
): ClassSession {
  const start = new Date(row.starts_at)
  const end = new Date(row.ends_at)
  const tutorName = tutor?.full_name?.trim() || tutor?.email || 'Tutor'

  return {
    id: String(row.id),
    dbId: row.id,
    batchId: batch.id,
    subject: batch.subject,
    batchName: batch.name,
    date: row.session_date,
    weekdayLabel: weekdayLabelForDate(row.session_date),
    startTime: batch.start_time,
    endTime: batch.end_time,
    tutorId: batch.tutor_id,
    tutorName,
    meetingLink: batch.meeting_link?.trim() || null,
    recordingLink: row.recording_link?.trim() || null,
    sessionStatus: row.status,
    attended: row.attended,
    status: classifySession(start, end, now),
    startsAt: start.getTime(),
    endsAt: end.getTime(),
  }
}

function groupClassSessions(
  assignments: StudentBatchAssignment[],
  sessionRows: ClassSession[],
): SubjectClassGroup[] {
  const assignmentByBatchId = new Map(assignments.map((row) => [row.batch.id, row]))
  const groups = new Map<number, SubjectClassGroup>()

  for (const session of sessionRows) {
    const assignment = assignmentByBatchId.get(session.batchId)
    if (!assignment) continue

    let group = groups.get(session.batchId)
    if (!group) {
      group = {
        subject: assignment.batch.subject,
        assignment,
        today: [],
        upcoming: [],
        past: [],
      }
      groups.set(session.batchId, group)
    }

    if (session.status === 'today') group.today.push(session)
    else if (session.status === 'upcoming') group.upcoming.push(session)
    else group.past.push(session)
  }

  for (const group of groups.values()) {
    group.past.reverse()
  }

  return [...groups.values()].sort((a, b) => a.subject.localeCompare(b.subject, 'en-IN'))
}

export function groupSessionsBySubject(
  assignments: StudentBatchAssignment[],
  sessionRows: ClassSession[],
): SubjectClassGroup[] {
  return groupClassSessions(assignments, sessionRows)
}

export type AggregatedStudentSessions = {
  today: ClassSession[]
  upcoming: ClassSession[]
  past: ClassSession[]
}

export function aggregateStudentSessions(subjects: SubjectClassGroup[]): AggregatedStudentSessions {
  const today = subjects.flatMap((group) => group.today).sort((a, b) => a.startsAt - b.startsAt)
  const upcoming = subjects.flatMap((group) => group.upcoming).sort((a, b) => a.startsAt - b.startsAt)
  const past = subjects.flatMap((group) => group.past).sort((a, b) => b.startsAt - a.startsAt)
  return { today, upcoming, past }
}

export function assignmentForSession(
  subjects: SubjectClassGroup[],
  session: ClassSession,
): StudentBatchAssignment | null {
  return (
    subjects.find((group) => group.assignment.batch.id === session.batchId)?.assignment ?? null
  )
}

export async function getStudentByUserId(userId: string) {
  const { data, error } = await getSupabase()
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message || 'Unable to load your student profile.')
  return (data as Student | null) ?? null
}

export async function listStudentBatchAssignments(studentId: number) {
  const { data, error } = await getSupabase()
    .from('batch_students')
    .select(
      `
      batch:batches (
        id,
        name,
        hero_full_name,
        subject,
        syllabus,
        grade,
        start_date,
        days_of_week,
        start_time,
        end_time,
        quality_manager_id,
        tutor_id,
        min_students,
        max_students,
        meeting_link,
        notes,
        created_at,
        updated_at
      )
    `,
    )
    .eq('student_id', studentId)

  if (error) throw new Error(error.message || 'Unable to load your batches.')

  type BatchStudentRow = { batch: Batch | null }
  const rows = (data ?? []) as BatchStudentRow[]
  const batches = rows.map((row) => row.batch).filter((batch): batch is Batch => Boolean(batch))

  if (batches.length === 0) return [] as StudentBatchAssignment[]

  const tutorIds = [...new Set(batches.map((batch) => batch.tutor_id))]
  const { data: tutors, error: tutorError } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email')
    .in('id', tutorIds)

  if (tutorError) throw new Error(tutorError.message || 'Unable to load tutor details.')

  const tutorById = new Map((tutors ?? []).map((tutor) => [tutor.id, tutor]))

  return batches.map((batch) => {
    const tutor = tutorById.get(batch.tutor_id) ?? null
    return {
      batch,
      tutor,
      scheduleLabel: formatBatchSchedule({
        days_of_week: batch.days_of_week,
        start_time: batch.start_time,
        end_time: batch.end_time,
        start_date: batch.start_date,
      }),
      daysLabel: formatBatchDays(batch.days_of_week),
    }
  })
}

async function listStudentSessionRows(studentId: number) {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('starts_at', { ascending: true })

  if (error) throw new Error(error.message || 'Unable to load your class sessions.')
  return (data ?? []) as Session[]
}

async function listTutorSessionRows(tutorId: string) {
  const { data: batches, error: batchError } = await getSupabase()
    .from('batches')
    .select('id')
    .eq('tutor_id', tutorId)

  if (batchError) throw new Error(batchError.message || 'Unable to load your batches.')

  const batchIds = (batches ?? []).map((row) => row.id as number)
  if (batchIds.length === 0) return [] as Session[]

  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .in('batch_id', batchIds)
    .order('starts_at', { ascending: true })

  if (error) throw new Error(error.message || 'Unable to load class sessions.')
  return (data ?? []) as Session[]
}

function dedupeTutorSessions(rows: Session[]) {
  const map = new Map<string, Session>()
  for (const row of rows) {
    const key = `${row.batch_id}-${row.session_date}`
    if (!map.has(key)) map.set(key, row)
  }
  return [...map.values()]
}

function buildClassSessions(
  assignments: StudentBatchAssignment[],
  rows: Session[],
  now = new Date(),
) {
  const batchById = new Map(assignments.map((row) => [row.batch.id, row]))
  return rows
    .map((row) => {
      const assignment = batchById.get(row.batch_id)
      if (!assignment) return null
      return mapSessionToClassSession(row, assignment.batch, assignment.tutor, now)
    })
    .filter((row): row is ClassSession => Boolean(row))
}

export async function listTutorBatchAssignments(
  tutorId: string,
  tutor: Pick<Profile, 'id' | 'full_name' | 'email'>,
) {
  const { data, error } = await getSupabase()
    .from('batches')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('start_date', { ascending: true })

  if (error) throw new Error(error.message || 'Unable to load your batches.')

  const batches = (data ?? []) as Batch[]
  return batches.map((batch) => ({
    batch,
    tutor,
    scheduleLabel: formatBatchSchedule({
      days_of_week: batch.days_of_week,
      start_time: batch.start_time,
      end_time: batch.end_time,
      start_date: batch.start_date,
    }),
    daysLabel: formatBatchDays(batch.days_of_week),
  }))
}

export async function loadTutorClassDashboard(
  tutorId: string,
  tutor: Pick<Profile, 'id' | 'full_name' | 'email'>,
) {
  await refreshSessionStatuses()
  const now = new Date()
  const assignments = await listTutorBatchAssignments(tutorId, tutor)
  const rows = dedupeTutorSessions(await listTutorSessionRows(tutorId))
  const sessions = buildClassSessions(assignments, rows, now)
  const subjects = groupSessionsBySubject(assignments, sessions)
  return { subjects, batchCount: assignments.length }
}

export async function getAdmissionForStudent(studentId: number) {
  const { data, error } = await getSupabase()
    .from('admissions')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) throw new Error(error.message || 'Unable to load tuition payments.')
  return (data as Admission | null) ?? null
}

export async function loadStudentClassDashboard(userId: string) {
  await refreshSessionStatuses()
  const now = new Date()
  const student = await getStudentByUserId(userId)
  if (!student) {
    return { student: null, subjects: [] as SubjectClassGroup[], awaitingPayment: false }
  }

  const assignments = await listStudentBatchAssignments(student.id)
  const rows = await listStudentSessionRows(student.id)
  const sessions = buildClassSessions(assignments, rows, now)
  const subjects = groupSessionsBySubject(assignments, sessions)

  return {
    student,
    subjects,
    awaitingPayment: assignments.length > 0 && subjects.length === 0,
  }
}

export function formatClassDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatClassTimeRange(startTime: string, endTime: string) {
  return `${startTime} – ${endTime}`
}
