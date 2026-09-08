import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Loader2 } from 'lucide-react'
import { TodaySessionCard } from '@/components/portal/StudentClassesPanel'
import {
  aggregateStudentSessions,
  assignmentForSession,
  loadStudentClassDashboard,
  loadTutorClassDashboard,
  type SubjectClassGroup,
} from '@/lib/student-classes'

export function TodayClassesSection({
  userId,
  userName,
  userEmail,
  variant,
}: {
  userId: string
  userName: string
  userEmail: string
  variant: 'student' | 'tutor'
}) {
  const [subjects, setSubjects] = useState<SubjectClassGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const load =
      variant === 'tutor'
        ? loadTutorClassDashboard(userId, {
            id: userId,
            full_name: userName,
            email: userEmail,
          })
        : loadStudentClassDashboard(userId)

    void load
      .then((result) => {
        if (!cancelled) setSubjects(result.subjects)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load today’s classes.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userEmail, userId, userName, variant])

  const today = useMemo(() => aggregateStudentSessions(subjects).today, [subjects])

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-crimson" />
        <h2 className="text-lg font-extrabold tracking-tight text-charcoal">Today&apos;s Classes</h2>
      </div>

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-charcoal/[0.06] bg-white px-5 py-10 text-sm text-charcoal/50">
          <Loader2 className="h-4 w-4 animate-spin text-crimson" />
          Loading today&apos;s classes…
        </div>
      ) : today.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {today.map((session) => (
            <TodaySessionCard
              key={session.id}
              session={session}
              assignment={assignmentForSession(subjects, session)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-10 text-center">
          <p className="font-medium text-charcoal/60">No class scheduled for today</p>
          <p className="mt-1 text-sm text-charcoal/45">Check the Classes page for upcoming sessions.</p>
        </div>
      )}
    </section>
  )
}
