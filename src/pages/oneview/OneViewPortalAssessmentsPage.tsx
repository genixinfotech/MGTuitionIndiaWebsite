import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, GraduationCap } from 'lucide-react'
import { AssessmentQueue, type AssessmentPatch } from '@/components/dashboard/AssessmentQueue'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { listAdmissions, listAssessmentRequests, listStudentSubjects } from '@/lib/assessments'
import { listSubjectExperts, type SubjectExpertOption } from '@/lib/subject-experts'
import type { Admission, AssessmentRequestDetails, StudentSubject } from '@/lib/database.types'

export function OneViewPortalAssessmentsPage() {
  const [assessments, setAssessments] = useState<AssessmentRequestDetails[]>([])
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([])
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [subjectExperts, setSubjectExperts] = useState<SubjectExpertOption[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [nextAssessments, experts] = await Promise.all([
          listAssessmentRequests(),
          listSubjectExperts(),
        ])
        if (cancelled) return
        setAssessments(nextAssessments)
        setSubjectExperts(experts)
        const studentIds = [...new Set(nextAssessments.map((row) => row.student_id))]
        const [subjectRows, admissionRows] = await Promise.all([
          listStudentSubjects(studentIds),
          listAdmissions(studentIds),
        ])
        if (!cancelled) {
          setStudentSubjects(subjectRows)
          setAdmissions(admissionRows)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load assessment requests.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const newAssessments = useMemo(
    () => assessments.filter((row) => row.status === 'new').length,
    [assessments],
  )

  function onAssessmentChange(id: number, patch: AssessmentPatch) {
    setAssessments((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function onSubjectsChange(studentId: number, nextRows: StudentSubject[]) {
    setStudentSubjects((rows) => [...rows.filter((row) => row.student_id !== studentId), ...nextRows])
  }

  function onAdmissionChange(row: Admission) {
    setAdmissions((current) => [
      row,
      ...current.filter((item) => item.student_id !== row.student_id),
    ])
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Assessment Requests (Portal)" />
      <p className="-mt-2 text-sm text-charcoal/55">
        From enrolled students in the parent portal. Assign experts, prepare reports, and tuition subjects.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
        <StatCard icon={ClipboardList} label="New requests" value={loading ? '—' : String(newAssessments)} />
        <StatCard icon={GraduationCap} label="All requests" value={loading ? '—' : String(assessments.length)} />
      </div>

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">{error}</p>
      ) : null}

      <AssessmentQueue
        rows={assessments}
        assignedSubjects={studentSubjects}
        admissions={admissions}
        subjectExperts={subjectExperts}
        loading={loading}
        onChange={onAssessmentChange}
        onSubjectsChange={onSubjectsChange}
        onAdmissionChange={onAdmissionChange}
        onError={setError}
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardList
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-charcoal/[0.06] bg-white p-5">
      <Icon className="h-5 w-5 text-crimson" />
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      <p className="text-sm text-charcoal/50">{label}</p>
    </div>
  )
}
