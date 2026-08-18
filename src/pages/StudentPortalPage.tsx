import { useEffect, useState } from 'react'
import { Bell, BookOpen, CalendarDays, Sparkles } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuth } from '@/context/AuthContext'
import { getSupabase } from '@/lib/supabase'
import type { Student } from '@/lib/database.types'

export function StudentPortalPage() {
  return (
    <RequireAuth roles={['student']}>
      <StudentHome />
    </RequireAuth>
  )
}

function StudentHome() {
  const { user } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)

  useEffect(() => {
    if (!user) return
    void getSupabase()
      .from('students')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setStudent((data as Student | null) ?? null))
  }, [user])

  if (!user) return null

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-[#f8fafc] px-4 pb-24 pt-36 md:px-6 md:pb-32 md:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-crimson/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-4xl space-y-6">
          <div className="rounded-[28px] border border-charcoal/[0.06] bg-white p-8 md:p-10">
            <p className="section-eyebrow mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Student
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Hi, {user.name}</h1>
            <p className="mt-3 text-charcoal/55">
              Signed in as <span className="font-semibold text-charcoal">{user.email}</span>.
              {student?.grade ? ` ${student.grade}` : ''}
              {student?.board ? ` · ${student.board}` : ''}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-charcoal/[0.06] bg-white p-6">
              <CalendarDays className="h-5 w-5 text-crimson" />
              <h2 className="mt-3 font-bold">Upcoming sessions</h2>
              <p className="mt-1 text-sm text-charcoal/50">No classes scheduled yet. They will appear here.</p>
            </div>
            <div className="rounded-[24px] border border-charcoal/[0.06] bg-white p-6">
              <Bell className="h-5 w-5 text-crimson" />
              <h2 className="mt-3 font-bold">Notifications</h2>
              <p className="mt-1 text-sm text-charcoal/50">You have no new notifications.</p>
            </div>
          </div>

          {student ? (
            <div className="rounded-[24px] border border-charcoal/[0.06] bg-white p-6">
              <div className="flex items-center gap-2 font-bold">
                <BookOpen className="h-5 w-5 text-crimson" />
                My enrolment
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-charcoal/40">School</dt>
                  <dd className="font-medium">{student.school_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-charcoal/40">Location</dt>
                  <dd className="font-medium">
                    {[student.city, student.state].filter(Boolean).join(', ') || '—'}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  )
}
