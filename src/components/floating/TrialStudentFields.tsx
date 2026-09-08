import { useEffect } from 'react'
import { BookOpen, GraduationCap, UserRound, X } from 'lucide-react'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { SubjectMultiSelect } from '@/components/forms/SubjectMultiSelect'
import { useGradesForSyllabus, useSubjectsForGrade } from '@/hooks/useCurriculum'

export type TrialStudentEntry = {
  id: string
  studentName: string
  board: string
  grade: string
  subjects: string[]
}

export function createTrialStudentEntry(partial?: Partial<TrialStudentEntry>): TrialStudentEntry {
  return {
    id: crypto.randomUUID(),
    studentName: '',
    board: 'CBSE',
    grade: '',
    subjects: [],
    ...partial,
  }
}

export function TrialStudentFields({
  index,
  student,
  boardOptions,
  curriculumLoading,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number
  student: TrialStudentEntry
  boardOptions: string[]
  curriculumLoading: boolean
  canRemove: boolean
  onChange: (patch: Partial<TrialStudentEntry>) => void
  onRemove: () => void
}) {
  const { grades: gradesForBoard, loading: gradesLoading } = useGradesForSyllabus(student.board)
  const { subjects: availableSubjects, loading: subjectsLoading } = useSubjectsForGrade(
    student.grade,
    student.board,
  )

  useEffect(() => {
    if (!student.grade) return
    if (!gradesForBoard.includes(student.grade)) {
      onChange({ grade: '', subjects: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when syllabus options change
  }, [student.board, student.grade, gradesForBoard])

  useEffect(() => {
    const filtered = student.subjects.filter((subject) => availableSubjects.includes(subject))
    if (filtered.length !== student.subjects.length) {
      onChange({ subjects: filtered })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prune invalid subjects when curriculum loads
  }, [availableSubjects])

  return (
    <div className="rounded-2xl border border-charcoal/[0.08] bg-charcoal/[0.02] p-4 lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-charcoal">Student {index + 1}</p>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-full border border-charcoal/10 px-2.5 py-1 text-xs font-semibold text-charcoal/55 transition hover:border-crimson/20 hover:text-crimson"
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-x-5">
        <div className="lg:col-span-2">
          <FormField label="Student name" icon={UserRound}>
            <input
              required
              className={fieldClass(true)}
              placeholder="Student's full name"
              value={student.studentName}
              onChange={(event) => onChange({ studentName: event.target.value })}
            />
          </FormField>
        </div>

        <FormField label="Syllabus" icon={BookOpen}>
          <select
            className={fieldClass(true)}
            value={student.board}
            onChange={(event) => onChange({ board: event.target.value, grade: '', subjects: [] })}
            disabled={curriculumLoading}
          >
            {boardOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Grade" icon={GraduationCap}>
          <select
            required
            className={fieldClass(true)}
            value={student.grade}
            onChange={(event) => onChange({ grade: event.target.value, subjects: [] })}
            disabled={gradesLoading || curriculumLoading}
          >
            <option value="">Select grade</option>
            {gradesForBoard.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </FormField>

        <div className="lg:col-span-2">
          <SubjectMultiSelect
            value={student.subjects}
            onChange={(subjects) => onChange({ subjects })}
            subjects={availableSubjects}
            loading={subjectsLoading}
            label="Subjects for assessment"
            emptyMessage={
              student.grade
                ? 'No subjects are configured for this syllabus and grade yet.'
                : 'Select a syllabus and grade first to see available subjects.'
            }
          />
        </div>
      </div>
    </div>
  )
}
