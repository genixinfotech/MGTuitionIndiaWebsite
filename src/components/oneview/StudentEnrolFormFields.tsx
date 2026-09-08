import { BookOpen, Building2, Eye, EyeOff, GraduationCap, Lock, MapPin, MapPinned, UserRound } from 'lucide-react'
import { StudentLoginEmailField } from '@/components/enrolment/StudentLoginEmailField'
import { FormField, fieldClass } from '@/components/forms/FormField'
import type { StudentEmailCheckStatus } from '@/hooks/useStudentEmailCheck'
import { useGradesForSyllabus } from '@/hooks/useCurriculum'
import { enrolmentGrades, enrolmentSyllabi, locationOptions, type EnrolmentForm } from '@/lib/enrolment'

export function StudentEnrolFormFields({
  form,
  onChange,
  emailCheck,
  showPassword,
  onTogglePassword,
  error,
  syllabi,
}: {
  form: EnrolmentForm
  onChange: (patch: Partial<EnrolmentForm>) => void
  emailCheck: {
    status: StudentEmailCheckStatus
    message: string
    isChecking: boolean
    isAvailable: boolean
    isUnavailable: boolean
  }
  showPassword: boolean
  onTogglePassword: () => void
  error: string
  syllabi?: string[]
}) {
  const syllabusOptions = syllabi?.length ? syllabi : [...enrolmentSyllabi]
  const { grades: gradesForSyllabus, loading: gradesLoading } = useGradesForSyllabus(form.board)
  const gradeOptions = gradesForSyllabus.length > 0 ? gradesForSyllabus : [...enrolmentGrades]

  return (
    <>
      <FormField label="Student name" icon={UserRound}>
        <input
          required
          className={fieldClass(true)}
          placeholder="Full name"
          value={form.full_name}
          onChange={(event) => onChange({ full_name: event.target.value })}
        />
      </FormField>
      <StudentLoginEmailField
        value={form.email}
        onChange={(email) => onChange({ email })}
        status={emailCheck.status}
        message={emailCheck.message}
        isChecking={emailCheck.isChecking}
        isAvailable={emailCheck.isAvailable}
        isUnavailable={emailCheck.isUnavailable}
      />
      <FormField label="Student password" icon={Lock}>
        <input
          required
          minLength={8}
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          className={`${fieldClass(true)} pr-11`}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(event) => onChange({ password: event.target.value })}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-charcoal/40 hover:text-charcoal"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </FormField>
      <FormField label="School name" icon={Building2}>
        <input
          required
          className={fieldClass(true)}
          placeholder="School"
          value={form.school_name}
          onChange={(event) => onChange({ school_name: event.target.value })}
        />
      </FormField>
      <FormField label="City" icon={MapPin}>
        <input
          required
          className={fieldClass(true)}
          placeholder="City"
          value={form.city}
          onChange={(event) => onChange({ city: event.target.value })}
        />
      </FormField>
      <FormField label="State" icon={MapPinned}>
        <select
          required
          className={fieldClass(true)}
          value={form.state}
          onChange={(event) => onChange({ state: event.target.value })}
        >
          <option value="">Select state</option>
          {locationOptions.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Syllabus" icon={BookOpen}>
        <select
          required
          className={fieldClass(true)}
          value={form.board}
          onChange={(event) => onChange({ board: event.target.value, grade: '' })}
        >
          <option value="">Select syllabus</option>
          {syllabusOptions.map((syllabus) => (
            <option key={syllabus} value={syllabus}>
              {syllabus}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Class / grade" icon={GraduationCap}>
        <select
          required
          className={fieldClass(true)}
          value={form.grade}
          onChange={(event) => onChange({ grade: event.target.value })}
          disabled={!form.board || gradesLoading}
        >
          <option value="">{form.board ? 'Select class' : 'Select syllabus first'}</option>
          {gradeOptions.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </FormField>
      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">{error}</p>
      ) : null}
    </>
  )
}
