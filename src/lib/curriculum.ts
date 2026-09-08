import { getSupabase } from '@/lib/supabase'

export type Syllabus = {
  id: number
  name: string
  code: string
  sort_order: number
}

export type Grade = {
  id: number
  label: string
  sort_order: number
}

export type CurriculumSubject = {
  id: number
  name: string
  sort_order: number
}

type SyllabusCurriculumRow = {
  id: number
  name: string
  code: string
  sort_order: number
  syllabus_grade_subjects: Array<{
    grades: Grade | null
    subjects: CurriculumSubject | null
  }>
}

export type Curriculum = {
  syllabi: Syllabus[]
  grades: Grade[]
  subjectsBySyllabusGrade: Record<string, Record<string, string[]>>
}

let curriculumCache: Curriculum | null = null

function parseCurriculumRows(rows: SyllabusCurriculumRow[]): Curriculum {
  const syllabi: Syllabus[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    sort_order: row.sort_order,
  }))

  const gradeMap = new Map<number, Grade>()
  const subjectsBySyllabusGrade: Record<string, Record<string, string[]>> = {}

  for (const syllabus of rows) {
    const byGrade: Record<string, CurriculumSubject[]> = {}

    for (const link of syllabus.syllabus_grade_subjects) {
      if (!link.grades || !link.subjects) continue
      gradeMap.set(link.grades.id, link.grades)
      const bucket = byGrade[link.grades.label] ?? []
      bucket.push(link.subjects)
      byGrade[link.grades.label] = bucket
    }

    subjectsBySyllabusGrade[syllabus.name] = Object.fromEntries(
      Object.entries(byGrade).map(([label, subjects]) => [
        label,
        subjects.sort((a, b) => a.sort_order - b.sort_order).map((subject) => subject.name),
      ]),
    )
  }

  const grades = [...gradeMap.values()].sort((a, b) => a.sort_order - b.sort_order)

  return { syllabi, grades, subjectsBySyllabusGrade }
}

export async function fetchCurriculum() {
  if (curriculumCache) return curriculumCache

  const { data, error } = await getSupabase()
    .from('syllabi')
    .select(
      `
      id,
      name,
      code,
      sort_order,
      syllabus_grade_subjects (
        grades (
          id,
          label,
          sort_order
        ),
        subjects (
          id,
          name,
          sort_order
        )
      )
    `,
    )
    .order('sort_order')

  if (error) throw new Error(error.message || 'Unable to load curriculum.')
  curriculumCache = parseCurriculumRows((data ?? []) as SyllabusCurriculumRow[])
  return curriculumCache
}

export function clearCurriculumCache() {
  curriculumCache = null
}

export async function listSyllabi() {
  const { syllabi } = await fetchCurriculum()
  return syllabi
}

export async function listGrades() {
  const { grades } = await fetchCurriculum()
  return grades
}

export async function listGradesForSyllabus(syllabusName?: string | null) {
  const curriculum = await fetchCurriculum()
  return gradesForSyllabus(syllabusName, curriculum)
}

export function gradesForSyllabus(syllabusName: string | null | undefined, curriculum: Curriculum) {
  if (!syllabusName?.trim()) return []
  const byGrade = curriculum.subjectsBySyllabusGrade[syllabusName.trim()] ?? {}
  return curriculum.grades
    .filter((grade) => (byGrade[grade.label]?.length ?? 0) > 0)
    .map((grade) => grade.label)
}

export async function listSubjectsForGrade(
  gradeLabel?: string | null,
  syllabusName?: string | null,
) {
  if (!gradeLabel?.trim() || !syllabusName?.trim()) return []
  const { subjectsBySyllabusGrade } = await fetchCurriculum()
  return subjectsBySyllabusGrade[syllabusName.trim()]?.[gradeLabel.trim()] ?? []
}

export async function listAllSubjectNames() {
  const { data, error } = await getSupabase()
    .from('subjects')
    .select('name, sort_order')
    .order('sort_order')

  if (error) throw new Error(error.message || 'Unable to load subjects.')
  return ((data ?? []) as Array<{ name: string; sort_order: number }>).map((row) => row.name)
}

/** @deprecated Prefer storing the canonical grade label (e.g. Class 7). */
export function gradeLabelFromPlan(plan: string) {
  const match = plan.match(/\d+/)
  return match ? `Class ${match[0]}` : ''
}

export function normalizeSyllabusName(value?: string | null) {
  return value?.trim() ?? ''
}
