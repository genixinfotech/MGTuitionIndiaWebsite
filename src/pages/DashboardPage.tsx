import { useEffect, useMemo, useState } from 'react'
import { ClipboardList, Inbox, UserRound, GraduationCap } from 'lucide-react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { AssessmentQueue } from '@/components/dashboard/AssessmentQueue'
import { useAuth } from '@/context/AuthContext'
import { listAssessmentRequests, listStudentSubjects } from '@/lib/assessments'
import { getSupabase } from '@/lib/supabase'
import type { AssessmentPatch } from '@/components/dashboard/AssessmentQueue'
import type { AssessmentRequestDetails, Enquiry, EnquiryStatus, Profile, StudentSubject } from '@/lib/database.types'

const statuses: EnquiryStatus[] = ['new', 'contacted', 'enrolled', 'closed']

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DashboardPage() {
  const { user } = useAuth()
  const consultant = user?.role === 'student_consultant'
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [assessments, setAssessments] = useState<AssessmentRequestDetails[]>([])
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const nextAssessments = await listAssessmentRequests()
        if (cancelled) return
        setAssessments(nextAssessments)
        const subjectRows = await listStudentSubjects(
          [...new Set(nextAssessments.map((row) => row.student_id))],
        )
        if (cancelled) return
        setStudentSubjects(subjectRows)

        if (consultant) {
          setLoading(false)
          return
        }

        const supabase = getSupabase()
        const [enquiryRes, profileRes, studentRes] = await Promise.all([
          supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(50),
          supabase.from('students').select('id', { count: 'exact', head: true }),
        ])
        if (cancelled) return
        if (enquiryRes.error || profileRes.error || studentRes.error) {
          setError(
            enquiryRes.error?.message ||
              profileRes.error?.message ||
              studentRes.error?.message ||
              'Unable to load dashboard.',
          )
        } else {
          setEnquiries((enquiryRes.data ?? []) as Enquiry[])
          setProfiles((profileRes.data ?? []) as Profile[])
          setStudentCount(studentRes.count ?? 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [consultant])

  const newCount = useMemo(() => enquiries.filter((row) => row.status === 'new').length, [enquiries])
  const newAssessments = useMemo(
    () => assessments.filter((row) => row.status === 'new').length,
    [assessments],
  )

  async function updateStatus(id: number, status: EnquiryStatus) {
    setEnquiries((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)))
    const { error: updateError } = await getSupabase().from('enquiries').update({ status }).eq('id', id)
    if (updateError) setError(updateError.message)
  }

  function onAssessmentChange(id: number, patch: AssessmentPatch) {
    setAssessments((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function onSubjectsChange(studentId: number, nextRows: StudentSubject[]) {
    setStudentSubjects((rows) => [...rows.filter((row) => row.student_id !== studentId), ...nextRows])
  }

  return (
    <DashboardShell title={consultant ? 'Assessments' : 'CRM'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {consultant ? 'Assessment requests' : 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-charcoal/55">
            {consultant
              ? 'Write the weak-subject report, generate the PDF, then assign tuition subjects.'
              : 'Leads, parents, and students from the live site.'}
          </p>
        </div>

        {consultant ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard icon={ClipboardList} label="New requests" value={loading ? '—' : String(newAssessments)} />
            <StatCard icon={GraduationCap} label="All requests" value={loading ? '—' : String(assessments.length)} />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard icon={Inbox} label="New enquiries" value={loading ? '—' : String(newCount)} />
            <StatCard icon={UserRound} label="Signed-up parents" value={loading ? '—' : String(profiles.length)} />
            <StatCard icon={GraduationCap} label="Students" value={loading ? '—' : String(studentCount)} />
          </div>
        )}

        {error ? (
          <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">{error}</p>
        ) : null}

        <AssessmentQueue
          rows={assessments}
          assignedSubjects={studentSubjects}
          loading={loading}
          onChange={onAssessmentChange}
          onSubjectsChange={onSubjectsChange}
          onError={setError}
        />

        {consultant ? null : (
          <>
        <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
          <div className="border-b border-charcoal/[0.06] px-5 py-4">
            <h2 className="font-bold">Recent enquiries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#faf7f7] text-xs uppercase tracking-wider text-charcoal/45">
                <tr>
                  <th className="px-5 py-3 font-semibold">When</th>
                  <th className="px-5 py-3 font-semibold">Kind</th>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-charcoal/50">
                      No enquiries yet. Form submissions will appear here.
                    </td>
                  </tr>
                ) : (
                  enquiries.map((row) => (
                    <tr key={row.id} className="border-t border-charcoal/[0.05]">
                      <td className="whitespace-nowrap px-5 py-3 text-charcoal/60">{formatWhen(row.created_at)}</td>
                      <td className="px-5 py-3 capitalize">{row.kind}</td>
                      <td className="px-5 py-3 font-medium">{row.name}</td>
                      <td className="px-5 py-3">
                        <div>{row.email}</div>
                        <div className="text-charcoal/45">{row.phone}</div>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          className="rounded-lg border border-charcoal/10 bg-white px-2 py-1 text-sm"
                          value={row.status}
                          onChange={(e) => void updateStatus(row.id, e.target.value as EnquiryStatus)}
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
          <div className="border-b border-charcoal/[0.06] px-5 py-4">
            <h2 className="font-bold">Accounts</h2>
          </div>
          <ul className="divide-y divide-charcoal/[0.05]">
            {profiles.map((row) => (
              <li key={row.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{row.full_name || 'Unnamed'}</p>
                  <p className="text-charcoal/50">{row.email}</p>
                </div>
                <span className="rounded-full bg-charcoal/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-charcoal/60">
                  {row.role}
                </span>
              </li>
            ))}
            {profiles.length === 0 && !loading ? (
              <li className="px-5 py-8 text-sm text-charcoal/50">No parent accounts yet.</li>
            ) : null}
          </ul>
        </section>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Inbox
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
