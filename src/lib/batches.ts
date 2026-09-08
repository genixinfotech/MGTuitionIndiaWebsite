import { getSupabase } from '@/lib/supabase'
import {
  deleteFutureScheduledSessions,
  ensureStudentBatchSessions,
} from '@/lib/sessions'
import type { Profile, Student, BatchStudent, Admission } from '@/lib/database.types'

export const defaultBatchMinStudents = 6
export const defaultBatchMaxStudents = 8

export type Batch = {
  id: number
  name: string
  hero_full_name: string
  subject: string
  syllabus: string
  grade: string
  start_date: string
  days_of_week: number[]
  start_time: string
  end_time: string
  quality_manager_id: string
  tutor_id: string
  min_students: number
  max_students: number
  meeting_link: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type BatchWithQualityManager = Batch & {
  quality_manager: Pick<Profile, 'id' | 'full_name' | 'email'> | null
}

export type BatchWithStaff = BatchWithQualityManager & {
  tutor: Pick<Profile, 'id' | 'full_name' | 'email'> | null
}

export type CreateBatchInput = {
  name: string
  hero_full_name: string
  subject: string
  syllabus: string
  grade: string
  start_date: string
  days_of_week: number[]
  start_time: string
  end_time: string
  quality_manager_id: string
  tutor_id: string
  min_students: number
  max_students: number
  meeting_link: string
  notes?: string
}

export async function listBatches() {
  const { data, error } = await getSupabase()
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message || 'Unable to load batches.')
  return (data ?? []) as Batch[]
}

export async function listBatchNames() {
  const { data, error } = await getSupabase().from('batches').select('name')
  if (error) throw new Error(error.message || 'Unable to load batch names.')
  return (data ?? []).map((row) => row.name as string)
}

export async function createBatch(input: CreateBatchInput) {
  const { data, error } = await getSupabase()
    .from('batches')
    .insert({
      name: input.name.trim(),
      hero_full_name: input.hero_full_name.trim(),
      subject: input.subject.trim(),
      syllabus: input.syllabus.trim(),
      grade: input.grade.trim(),
      start_date: input.start_date,
      days_of_week: input.days_of_week,
      start_time: input.start_time,
      end_time: input.end_time,
      quality_manager_id: input.quality_manager_id,
      tutor_id: input.tutor_id,
      min_students: input.min_students,
      max_students: input.max_students,
      meeting_link: input.meeting_link.trim(),
      notes: input.notes?.trim() || null,
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Batch name "${input.name}" is already in use. Adjust grade, syllabus, hero, or time.`)
    }
    throw new Error(error.message || 'Unable to create this batch.')
  }

  return data as Batch
}

export type UpdateBatchInput = CreateBatchInput

export async function updateBatch(id: number, input: UpdateBatchInput) {
  const { data, error } = await getSupabase()
    .from('batches')
    .update({
      name: input.name.trim(),
      hero_full_name: input.hero_full_name.trim(),
      subject: input.subject.trim(),
      syllabus: input.syllabus.trim(),
      grade: input.grade.trim(),
      start_date: input.start_date,
      days_of_week: input.days_of_week,
      start_time: input.start_time,
      end_time: input.end_time,
      quality_manager_id: input.quality_manager_id,
      tutor_id: input.tutor_id,
      min_students: input.min_students,
      max_students: input.max_students,
      meeting_link: input.meeting_link.trim(),
      notes: input.notes?.trim() || null,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error(`Batch name "${input.name}" is already in use. Adjust grade, syllabus, hero, or time.`)
    }
    throw new Error(error.message || 'Unable to update this batch.')
  }

  return data as Batch
}

export type BatchStudentRow = BatchStudent & {
  student: Pick<Student, 'id' | 'full_name' | 'email' | 'grade' | 'board'> | null
}

export async function listAllBatchStudents() {
  const { data, error } = await getSupabase()
    .from('batch_students')
    .select(
      `
      id,
      batch_id,
      student_id,
      created_at,
      student:students ( id, full_name, email, grade, board )
    `,
    )
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message || 'Unable to load batch students.')
  return (data ?? []) as BatchStudentRow[]
}

export async function assignStudentToBatch(batchId: number, studentId: number) {
  const { data, error } = await getSupabase()
    .from('batch_students')
    .insert({ batch_id: batchId, student_id: studentId })
    .select(
      `
      id,
      batch_id,
      student_id,
      created_at,
      student:students ( id, full_name, email, grade, board )
    `,
    )
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('This student is already allocated to this batch.')
    }
    throw new Error(error.message || 'Unable to allocate this student.')
  }

  const { data: batch, error: batchError } = await getSupabase()
    .from('batches')
    .select('*')
    .eq('id', batchId)
    .single()

  if (batchError) {
    throw new Error(batchError.message || 'Unable to load batch for session creation.')
  }

  const { data: student, error: studentError } = await getSupabase()
    .from('students')
    .select('id, grade')
    .eq('id', studentId)
    .single()

  if (studentError) {
    throw new Error(studentError.message || 'Unable to load student for session creation.')
  }

  const { data: admissionRow } = await getSupabase()
    .from('admissions')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle()

  if (batch && student) {
    await ensureStudentBatchSessions({
      batch: batch as Batch,
      studentId,
      admission: (admissionRow as Admission | null) ?? null,
      studentGrade: student.grade,
    })
  }

  return data as BatchStudentRow
}

export async function removeStudentFromBatch(batchStudentId: number) {
  const { data: row, error: loadError } = await getSupabase()
    .from('batch_students')
    .select('batch_id, student_id')
    .eq('id', batchStudentId)
    .maybeSingle()

  if (loadError) throw new Error(loadError.message || 'Unable to load batch allocation.')

  const { error } = await getSupabase().from('batch_students').delete().eq('id', batchStudentId)
  if (error) throw new Error(error.message || 'Unable to remove this student from the batch.')

  if (row) {
    await deleteFutureScheduledSessions(row.batch_id as number, row.student_id as number)
  }
}

export function studentEligibleForBatch(
  student: Pick<Student, 'id' | 'grade' | 'board'>,
  batch: Pick<Batch, 'grade' | 'syllabus' | 'subject' | 'max_students'>,
  paidSubjects: string[],
  currentCount: number,
  assignedStudentIds: Set<number>,
) {
  if (assignedStudentIds.has(student.id)) return false
  if (currentCount >= batch.max_students) return false
  if ((student.grade ?? '').trim() !== batch.grade.trim()) return false
  if ((student.board ?? '').trim() !== batch.syllabus.trim()) return false
  return paidSubjects.includes(batch.subject)
}
