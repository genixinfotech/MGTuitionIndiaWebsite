import { useCallback, useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import {
  StudentClassesLoading,
  StudentClassesPanel,
} from '@/components/portal/StudentClassesPanel'
import { useAuth } from '@/context/AuthContext'
import {
  loadStudentClassDashboard,
  loadTutorClassDashboard,
  type SubjectClassGroup,
} from '@/lib/student-classes'
import { normalizeRole } from '@/lib/roles'
import type { Student } from '@/lib/database.types'

export function PortalClassesPage() {
  const { user } = useAuth()
  const role = normalizeRole(user?.role)
  const isTutor = role === 'tutor'
  const [student, setStudent] = useState<Student | null>(null)
  const [batchCount, setBatchCount] = useState(0)
  const [subjects, setSubjects] = useState<SubjectClassGroup[]>([])
  const [awaitingPayment, setAwaitingPayment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((value) => value + 1), [])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    setLoading(true)
    setError('')

    const load = isTutor
      ? loadTutorClassDashboard(user.id, {
          id: user.id,
          full_name: user.name,
          email: user.email,
        })
      : loadStudentClassDashboard(user.id)

    void load
      .then((result) => {
        if (cancelled) return
        if ('student' in result) {
          setStudent(result.student)
          setAwaitingPayment(result.awaitingPayment)
          setBatchCount(0)
        } else {
          setStudent(null)
          setAwaitingPayment(false)
          setBatchCount(result.batchCount)
        }
        setSubjects(result.subjects)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load your classes.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isTutor, reloadKey, user])

  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <DashboardPageHeader title="Classes" icon={BookOpen} />

      {isTutor ? (
        <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-5 py-4">
          <p className="text-sm text-charcoal/55">
            <span className="font-semibold text-charcoal">{user.name}</span>
            {' · '}
            Tutor
            {batchCount > 0 ? (
              <>
                {' · '}
                {batchCount} {batchCount === 1 ? 'batch' : 'batches'}
              </>
            ) : null}
          </p>
        </div>
      ) : student ? (
        <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-5 py-4">
          <p className="text-sm text-charcoal/55">
            <span className="font-semibold text-charcoal">{student.full_name}</span>
            {' · '}
            {student.grade || 'Grade not set'}
            {' · '}
            {student.board || 'Syllabus not set'}
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {error}
        </p>
      ) : null}

      {loading ? (
        <StudentClassesLoading />
      ) : (
        <StudentClassesPanel
          subjects={subjects}
          awaitingPayment={awaitingPayment}
          variant={isTutor ? 'tutor' : 'student'}
          onSessionsUpdated={reload}
        />
      )}
    </div>
  )
}
