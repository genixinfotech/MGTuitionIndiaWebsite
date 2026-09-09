import {
  defaultDaysOfWeekForSessionCount,
  quoteSubjectBilling,
  type ClassBillingLine,
} from '@/lib/class-billing'
import { sessionsPerMonthForGrade } from '@/lib/tuition-plans'
import { getSupabase } from '@/lib/supabase'

export async function daysOfWeekForStudentSubject(
  studentId: number,
  subject: string,
  grade?: string | null,
  board?: string | null,
) {
  const supabase = getSupabase()
  const { data: assigned } = await supabase
    .from('batch_students')
    .select('batch:batches ( subject, days_of_week )')
    .eq('student_id', studentId)

  type AssignedRow = { batch: { subject: string; days_of_week: number[] } | null }
  const assignedMatch = ((assigned ?? []) as AssignedRow[])
    .map((row) => row.batch)
    .find((batch) => batch && batch.subject === subject && batch.days_of_week?.length > 0)
  if (assignedMatch) return assignedMatch.days_of_week

  let query = supabase.from('batches').select('days_of_week').eq('subject', subject).limit(8)
  if (grade) query = query.eq('grade', grade)
  if (board) query = query.eq('syllabus', board)
  const { data: candidates } = await query
  const match = (candidates ?? []).find((row) => Array.isArray(row.days_of_week) && row.days_of_week.length > 0)
  if (match?.days_of_week) return match.days_of_week as number[]

  return defaultDaysOfWeekForSessionCount(sessionsPerMonthForGrade(grade))
}

export async function quoteStudentClassBilling(input: {
  studentId: number
  grade?: string | null
  board?: string | null
  coveredThrough?: Record<string, string> | null
  subjects: Array<{ subject: string; monthly_rate: number }>
}): Promise<ClassBillingLine[]> {
  const lines: ClassBillingLine[] = []
  for (const row of input.subjects) {
    const daysOfWeek = await daysOfWeekForStudentSubject(
      input.studentId,
      row.subject,
      input.grade,
      input.board,
    )
    lines.push(
      quoteSubjectBilling({
        subject: row.subject,
        monthlyRate: row.monthly_rate,
        daysOfWeek,
        sessionsPerMonth: sessionsPerMonthForGrade(input.grade),
        coveredThrough: input.coveredThrough?.[row.subject] || null,
      }),
    )
  }
  return lines
}
