import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  FileText,
  Loader2,
  Mail,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { AssessmentReportModal } from '@/components/portal/AssessmentReportModal'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { useAuth } from '@/context/AuthContext'
import {
  admissionForStudent,
  allAssessmentsCompleted,
  buildPayableTuitionSubjects,
  formatPreferredSlot,
  listAdmissions,
  listStudentSubjects,
  openAssessmentStatuses,
  paidOnlyAdmissionSubjectsFromPayable,
} from '@/lib/assessments'
import { getSupabase } from '@/lib/supabase'
import { formatInr } from '@/lib/tuition-plans'
import type { Admission, AssessmentRequest, Student, StudentSubject } from '@/lib/database.types'

function hasAssessmentReport(request: AssessmentRequest) {
  return Boolean(request.report_path || request.report?.trim())
}

function ViewReportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-crimson bg-crimson px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-crimson-dark"
    >
      <FileText className="h-3 w-3" />
      View report
    </button>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin
  label: string
  value: string | null
}) {
  if (!value) return null
  return (
    <div className="flex min-w-0 items-start gap-2.5 rounded-2xl bg-gray-50 px-3 py-2.5">
      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-crimson/10 text-crimson">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">{label}</p>
        <p className="truncate text-sm font-semibold text-charcoal">{value}</p>
      </div>
    </div>
  )
}

export function PortalStudentProfilePage() {
  const { studentId } = useParams()
  const { user } = useAuth()
  const parsedId = Number(studentId)
  const [student, setStudent] = useState<Student | null>(null)
  const [subjects, setSubjects] = useState<StudentSubject[]>([])
  const [admission, setAdmission] = useState<Admission | null>(null)
  const [requests, setRequests] = useState<AssessmentRequest[]>([])
  const [reportRequest, setReportRequest] = useState<AssessmentRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!user || !Number.isFinite(parsedId)) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data, error: studentError } = await getSupabase()
          .from('students')
          .select('*')
          .eq('id', parsedId)
          .eq('parent_id', user!.id)
          .maybeSingle()

        if (studentError) throw new Error(studentError.message || 'Unable to load this student.')
        if (!data) {
          if (!cancelled) setNotFound(true)
          return
        }

        const row = data as Student
        const [subjectRows, admissionRows, requestRows] = await Promise.all([
          listStudentSubjects([row.id]),
          listAdmissions([row.id]),
          getSupabase()
            .from('assessment_requests')
            .select('*')
            .eq('student_id', row.id)
            .order('created_at', { ascending: false })
            .then(({ data: nextRequests, error: requestError }) => {
              if (requestError) throw new Error(requestError.message || 'Unable to load assessments.')
              return (nextRequests ?? []) as AssessmentRequest[]
            }),
        ])

        if (cancelled) return
        setStudent(row)
        setSubjects(subjectRows)
        setAdmission(admissionForStudent(admissionRows, row.id))
        setRequests(requestRows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load this student.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [parsedId, user])

  const openRequests = useMemo(
    () => requests.filter((row) => openAssessmentStatuses.includes(row.status)),
    [requests],
  )
  const completedWithReports = useMemo(
    () => requests.filter((row) => row.status === 'completed' && hasAssessmentReport(row)),
    [requests],
  )
  const payableSubjects = useMemo(
    () =>
      student
        ? buildPayableTuitionSubjects({
            student,
            assignedSubjects: subjects,
            admission,
            completedReports: completedWithReports,
            openRequests,
          })
        : [],
    [student, subjects, admission, completedWithReports, openRequests],
  )
  const securedOnlySubjects = useMemo(
    () => paidOnlyAdmissionSubjectsFromPayable(payableSubjects, admission),
    [payableSubjects, admission],
  )
  const enrolmentTotal = payableSubjects.reduce((sum, row) => sum + row.monthly_rate, 0)
  const allComplete = student ? allAssessmentsCompleted(requests, student.id) : false
  const latestRequest = requests[0] ?? null
  const preferredSlot = formatPreferredSlot(latestRequest?.preferred_date, latestRequest?.preferred_time)

  function reportForSubject(subject: string) {
    return completedWithReports.find((request) => request.subject === subject) ?? null
  }

  if (!user) return null
  if (!Number.isFinite(parsedId)) return <Navigate to="/portal/students" replace />
  if (notFound) return <Navigate to="/portal/students" replace />

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <DashboardPageHeader title={student?.full_name || 'Student'} />

      <Link
        to="/portal/students"
        className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/55 transition hover:text-crimson"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to students
      </Link>

      {loading ? (
        <p className="inline-flex items-center gap-2 text-sm text-charcoal/50">
          <Loader2 className="h-4 w-4 animate-spin text-crimson" />
          Loading student profile…
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">{error}</p>
      ) : null}

      {student ? (
        <>
          <section className="overflow-hidden rounded-[24px] border border-charcoal/[0.06] bg-white shadow-[0_18px_44px_-28px_rgba(45,45,45,0.4)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-crimson via-[#e63946] to-crimson-dark px-5 pb-5 pt-5 text-white">
              <div className="relative flex items-center gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-lg font-bold backdrop-blur-md">
                  {(student.full_name.trim().charAt(0) || '?').toUpperCase()}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-extrabold tracking-tight">{student.full_name}</h2>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {student.grade ? (
                      <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold">
                        {student.grade}
                      </span>
                    ) : null}
                    {student.board ? (
                      <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold">
                        {student.board}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-4">
              <InfoTile icon={Building2} label="School" value={student.school_name} />
              <InfoTile
                icon={MapPin}
                label="Location"
                value={[student.city, student.state].filter(Boolean).join(', ') || null}
              />
              <InfoTile icon={Mail} label="Login email" value={student.email} />

              {allComplete && completedWithReports.length > 0 ? (
                <div className="rounded-2xl border border-crimson/15 bg-gradient-to-br from-crimson/[0.06] via-white to-rose-50 px-3.5 py-3.5">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crimson text-white shadow-[0_8px_16px_-8px_rgba(204,0,0,0.7)]">
                      <Check className="h-4 w-4" strokeWidth={2.75} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-sm font-bold tracking-tight text-charcoal">Assessments completed</p>
                      {preferredSlot && preferredSlot !== '—' ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/50">
                          <CalendarDays className="h-3.5 w-3.5 text-crimson" />
                          {preferredSlot}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {openRequests.length > 0 ? (
                <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-3.5 py-3.5">
                  <p className="text-sm font-bold tracking-tight text-emerald-950">Assessment in progress</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {openRequests.map((request) => (
                      <span
                        key={request.id}
                        className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900 shadow-sm"
                      >
                        {request.subject}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {payableSubjects.length > 0 || securedOnlySubjects.length > 0 ? (
                <div className="rounded-2xl border border-charcoal/[0.08] bg-gray-50 px-3.5 py-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">
                    Tuition subjects
                  </p>
                  <div className="mt-2 space-y-2">
                    {payableSubjects.map((row) => {
                      const matchingReport = reportForSubject(row.subject)
                      return (
                        <div
                          key={row.key}
                          className={`rounded-xl px-3 py-2.5 shadow-sm ${
                            row.secured
                              ? 'border border-emerald-100 bg-emerald-50/40'
                              : 'border border-charcoal/[0.08] bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-charcoal">{row.subject}</span>
                              <p className="mt-0.5 text-xs font-medium text-charcoal/45">
                                {formatInr(row.monthly_rate)} / month
                              </p>
                              {row.pendingAssessment ? (
                                <p className="mt-1 text-[11px] font-semibold text-amber-700">Assessment pending</p>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              {matchingReport ? (
                                <ViewReportButton onClick={() => setReportRequest(matchingReport)} />
                              ) : null}
                              {row.secured ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  Admission secured
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-charcoal/45">Payment pending</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {securedOnlySubjects.map((subject) => {
                      const matchingReport = reportForSubject(subject)
                      return (
                        <div
                          key={`secured-${subject}`}
                          className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2.5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-sm font-semibold text-charcoal">{subject}</span>
                              <p className="mt-0.5 text-xs font-medium text-emerald-800/55">Paid earlier</p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              {matchingReport ? (
                                <ViewReportButton onClick={() => setReportRequest(matchingReport)} />
                              ) : null}
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Admission secured
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {payableSubjects.length > 0 ? (
                    <p className="mt-2 text-xs font-semibold text-charcoal/55">
                      {formatInr(enrolmentTotal)} / month for all listed subjects
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          <AssessmentReportModal
            open={Boolean(reportRequest)}
            studentName={student.full_name}
            subject={reportRequest?.subject}
            preferredDate={reportRequest?.preferred_date}
            preferredTime={reportRequest?.preferred_time}
            report={reportRequest?.report ?? null}
            reportPath={reportRequest?.report_path}
            onClose={() => setReportRequest(null)}
          />
        </>
      ) : null}
    </div>
  )
}
