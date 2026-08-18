import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Building2,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Sparkles,
  UserRound,
  Lock,
  CalendarDays,
  Check,
  FileText,
  Eye,
  EyeOff,
  CreditCard,
  ShieldCheck,
  X,
} from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import {
  emptyEnrolment,
  enrolmentGrades,
  enrolmentSyllabi,
  indianStates,
  type EnrolmentForm,
} from '@/lib/enrolment'
import { getSupabase } from '@/lib/supabase'
import { site } from '@/lib/site'
import {
  admissionForStudent,
  formatPreferredSlot,
  latestAssessmentForStudent,
  listAdmissions,
  listStudentSubjects,
  subjectsForStudent,
} from '@/lib/assessments'
import type { Admission, AssessmentRequest, Enquiry, Student, StudentSubject } from '@/lib/database.types'
import { AssessmentRequestFlow } from '@/components/portal/AssessmentRequestFlow'
import { AssessmentReportModal } from '@/components/portal/AssessmentReportModal'
import { AdmissionCheckout } from '@/components/portal/AdmissionCheckout'
import { formatInr } from '@/lib/tuition-plans'

export function PortalPage() {
  return (
    <RequireAuth roles={['parent', 'tutor', 'staff']}>
      <PortalHome />
    </RequireAuth>
  )
}

function PortalHome() {
  const { user } = useAuth()
  const { openTrial } = useTrial()
  const navigate = useNavigate()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [assessmentRequests, setAssessmentRequests] = useState<AssessmentRequest[]>([])
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([])
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [assessmentStudent, setAssessmentStudent] = useState<Student | null>(null)
  const [reportRequest, setReportRequest] = useState<AssessmentRequest | null>(null)
  const [payingStudent, setPayingStudent] = useState<Student | null>(null)
  const [form, setForm] = useState<EnrolmentForm>(emptyEnrolment)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = getSupabase()
    void supabase
      .from('enquiries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setEnquiries((data ?? []) as Enquiry[]))
    void supabase
      .from('students')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        const rows = (data ?? []) as Student[]
        setStudents(rows)
        const ids = rows.map((row) => row.id)
        try {
          const [subjects, nextAdmissions] = await Promise.all([
            listStudentSubjects(ids),
            listAdmissions(ids),
          ])
          setStudentSubjects(subjects)
          setAdmissions(nextAdmissions)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unable to load student details.')
        }
      })
    void supabase
      .from('assessment_requests')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setAssessmentRequests((data ?? []) as AssessmentRequest[]))
  }, [user])

  function openPanel() {
    setError('')
    setShowPassword(false)
    setAssessmentStudent(null)
    setPanelOpen(true)
  }

  function closePanel() {
    if (saving) return
    setPanelOpen(false)
    setError('')
    setShowPassword(false)
    setForm(emptyEnrolment)
  }

  useEffect(() => {
    if (!panelOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [panelOpen, saving])

  async function enrollStudent(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    if (form.password.length < 8) {
      setError('Student password must be at least 8 characters.')
      return
    }
    setSaving(true)
    try {
      const {
        data: { session },
      } = await getSupabase().auth.getSession()
      if (!session?.access_token) {
        throw new Error('Please sign in again to enrol a student.')
      }
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          city: form.city.trim(),
          state: form.state,
          grade: form.grade,
          board: form.board,
          school_name: form.school_name.trim(),
        }),
      })
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string
        student?: Student
      }
      if (!response.ok || !payload.student) {
        throw new Error(payload.error || 'Unable to enrol this student. Please try again.')
      }
      setStudents((rows) => [payload.student as Student, ...rows])
      setForm(emptyEnrolment)
      setShowPassword(false)
      setPanelOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to enrol this student. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <>
    <PageShell>
      <section className="relative overflow-hidden bg-[#f8fafc] pb-24 pt-36 md:pb-32 md:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-crimson/10 blur-[100px]" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-indigo-400/10 blur-[90px]" />
        </div>

        <div className="relative mx-auto max-w-7xl space-y-6 px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-charcoal/[0.06] bg-white p-8 shadow-[0_24px_60px_-28px_rgba(45,45,45,0.3)] md:p-10"
          >
            <p className="section-eyebrow mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Portal
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-charcoal md:text-4xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-3 text-charcoal/55">
              Signed in as <span className="font-semibold text-charcoal">{user.email}</span>. Enrol
              each child separately — they appear as cards below.
            </p>

            {error && !panelOpen ? (
              <p className="mt-6 rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={openPanel} className="btn-primary">
                <Plus className="h-4 w-4" />
                Enrol Child
              </button>
              <button type="button" onClick={() => openTrial()} className="btn-outline">
                {site.assessmentCta}
                <ArrowRight className="h-4 w-4" />
              </button>
              {user.role === 'staff' ? (
                <button type="button" onClick={() => navigate('/dashboard')} className="btn-outline">
                  Staff dashboard
                </button>
              ) : null}
            </div>
          </motion.div>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-charcoal">Enrolled students</h2>
              <button type="button" onClick={openPanel} className="btn-outline">
                <Plus className="h-4 w-4" />
                Enrol Child
              </button>
            </div>
            {students.length === 0 ? (
              <p className="rounded-[28px] border border-dashed border-charcoal/15 bg-white px-6 py-10 text-center text-sm text-charcoal/50">
                No students enrolled yet. Click Enrol Child to add your first child.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {students.map((student) => {
                  const request = latestAssessmentForStudent(assessmentRequests, student.id)
                  return (
                    <StudentCard
                      key={student.id}
                      student={student}
                      request={request}
                      subjects={subjectsForStudent(studentSubjects, student.id)}
                      admission={admissionForStudent(admissions, student.id)}
                      preferredSlot={formatPreferredSlot(request?.preferred_date, request?.preferred_time)}
                      onRequest={() => {
                        if (saving) return
                        setPanelOpen(false)
                        setAssessmentStudent(student)
                      }}
                      onViewReport={() => {
                        if (request) setReportRequest(request)
                      }}
                      onPay={() => {
                        if (saving) return
                        setPanelOpen(false)
                        setPayingStudent(student)
                      }}
                    />
                  )
                })}
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-charcoal/[0.06] bg-white p-6 md:p-8">
            <div className="flex items-center gap-2 font-bold">
              <GraduationCap className="h-5 w-5 text-crimson" />
              Your enquiries
            </div>
            <ul className="mt-4 space-y-2">
              {enquiries.map((row) => (
                <li key={row.id} className="rounded-xl border border-charcoal/[0.06] bg-[#f8fafc] px-4 py-3 text-sm">
                  <p className="font-semibold capitalize">{row.kind}</p>
                  <p className="text-charcoal/50">
                    {row.status} · {new Date(row.created_at).toLocaleDateString('en-IN')}
                  </p>
                </li>
              ))}
              {enquiries.length === 0 ? (
                <li className="text-sm text-charcoal/50">No requests yet. Book a free assessment to get started.</li>
              ) : null}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>

    <AnimatePresence>
      {panelOpen ? (
        <motion.div
          key="enrol-panel"
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
            aria-label="Close enrolment panel"
            disabled={saving}
            onClick={closePanel}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="enrol-panel-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <div className="flex items-center gap-2 font-bold text-charcoal">
                  <UserRound className="h-5 w-5 text-crimson" />
                  <h2 id="enrol-panel-title">Enrol a student</h2>
                </div>
                <p className="mt-1 text-sm text-charcoal/50">
                  Add one child at a time. Choose a login email and password the student will use
                  for classes and notifications.
                </p>
              </div>
              <button
                type="button"
                onClick={closePanel}
                disabled={saving}
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 transition-colors hover:border-crimson/30 hover:text-crimson disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => void enrollStudent(e)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
                <FormField label="Student name" icon={UserRound}>
                  <input
                    required
                    className={fieldClass(true)}
                    placeholder="Full name"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </FormField>
                <FormField label="Student login email" icon={Mail}>
                  <input
                    required
                    type="email"
                    className={fieldClass(true)}
                    placeholder="student@email.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </FormField>
                <FormField label="Student password" icon={Lock}>
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${fieldClass(true)} pr-11`}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
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
                    onChange={(e) => setForm((f) => ({ ...f, school_name: e.target.value }))}
                  />
                </FormField>
                <FormField label="City" icon={MapPin}>
                  <input
                    required
                    className={fieldClass(true)}
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </FormField>
                <FormField label="State">
                  <select
                    required
                    className={fieldClass()}
                    value={form.state}
                    onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  >
                    <option value="">Select state</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Class / grade" icon={GraduationCap}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.grade}
                    onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                  >
                    <option value="">Select class</option>
                    {enrolmentGrades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Syllabus" icon={BookOpen}>
                  <select
                    required
                    className={fieldClass(true)}
                    value={form.board}
                    onChange={(e) => setForm((f) => ({ ...f, board: e.target.value }))}
                  >
                    <option value="">Select syllabus</option>
                    {enrolmentSyllabi.map((syllabus) => (
                      <option key={syllabus} value={syllabus}>
                        {syllabus}
                      </option>
                    ))}
                  </select>
                </FormField>
                {error ? (
                  <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                    {error}
                  </p>
                ) : null}
              </div>
              <div className="border-t border-charcoal/[0.06] px-5 py-4">
                <button type="submit" disabled={saving} className="btn-primary w-full">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enrolling…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Enrol student
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>

    <AssessmentRequestFlow
      student={assessmentStudent}
      parentId={user.id}
      onClose={() => setAssessmentStudent(null)}
      onCreated={(row) => {
        setAssessmentRequests((rows) => [row, ...rows])
        setAssessmentStudent(null)
      }}
    />
    <AssessmentReportModal
      open={Boolean(reportRequest)}
      studentName={
        students.find((row) => row.id === reportRequest?.student_id)?.full_name || 'Student'
      }
      preferredDate={reportRequest?.preferred_date}
      preferredTime={reportRequest?.preferred_time}
      report={reportRequest?.report ?? null}
      reportPath={reportRequest?.report_path}
      onClose={() => setReportRequest(null)}
    />
    <AdmissionCheckout
      student={payingStudent}
      parentId={user.id}
      subjects={payingStudent ? subjectsForStudent(studentSubjects, payingStudent.id) : []}
      onClose={() => setPayingStudent(null)}
      onPaid={(row) => {
        setAdmissions((current) => [row, ...current.filter((item) => item.student_id !== row.student_id)])
      }}
      onError={setError}
    />
    </>
  )
}

function StudentCard({
  student,
  request,
  subjects,
  admission,
  preferredSlot,
  onRequest,
  onViewReport,
  onPay,
}: {
  student: Student
  request: AssessmentRequest | null
  subjects: StudentSubject[]
  admission: Admission | null
  preferredSlot: string
  onRequest: () => void
  onViewReport: () => void
  onPay: () => void
}) {
  const location = [student.city, student.state].filter(Boolean).join(', ')
  const initial = (student.full_name.trim().charAt(0) || '?').toUpperCase()
  const completed = request?.status === 'completed'
  const requested = Boolean(request && ['new', 'contacted', 'scheduled'].includes(request.status))
  const paid = admission?.status === 'paid'
  const monthlyTotal = subjects.reduce((sum, row) => sum + row.monthly_rate, 0)

  return (
    <article className="overflow-hidden rounded-[24px] border border-charcoal/[0.06] bg-white shadow-[0_18px_44px_-28px_rgba(45,45,45,0.4)]">
      <div className="relative overflow-hidden bg-gradient-to-br from-crimson via-[#e63946] to-crimson-dark px-5 pb-5 pt-5 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-8 left-10 h-20 w-20 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-lg font-bold backdrop-blur-md">
            {initial}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold tracking-tight">{student.full_name}</h3>
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
        <InfoTile icon={MapPin} label="Location" value={location} />
        <InfoTile icon={Mail} label="Login email" value={student.email} />

        {completed ? (
          <div className="rounded-2xl border border-crimson/15 bg-gradient-to-br from-crimson/[0.06] via-white to-rose-50 px-3.5 py-3.5">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crimson text-white shadow-[0_8px_16px_-8px_rgba(204,0,0,0.7)]">
                <Check className="h-4 w-4" strokeWidth={2.75} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-bold tracking-tight text-charcoal">Assessment completed</p>
                {preferredSlot && preferredSlot !== '—' ? (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/50">
                    <CalendarDays className="h-3.5 w-3.5 text-crimson" />
                    {preferredSlot}
                  </p>
                ) : null}
              </div>
            </div>
            <button type="button" onClick={onViewReport} className="btn-outline mt-3 w-full">
              <FileText className="h-4 w-4" />
              View Assessment Report
            </button>
          </div>
        ) : requested ? (
          <div className="rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-3.5 py-3.5">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_8px_16px_-8px_rgba(5,150,105,0.8)]">
                <Check className="h-4 w-4" strokeWidth={2.75} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-bold tracking-tight text-emerald-950">Assessment requested</p>
                {preferredSlot && preferredSlot !== '—' ? (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800/75">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {preferredSlot}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] leading-snug text-emerald-800/55">
                  A student consultant will confirm this slot shortly.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={onRequest} className="btn-primary mt-1 w-full">
            <Sparkles className="h-4 w-4" />
            {site.assessmentCta}
          </button>
        )}

        {subjects.length > 0 ? (
          <div className="rounded-2xl border border-charcoal/[0.08] bg-[#f8fafc] px-3.5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">
              Tuition subjects
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {subjects.map((row) => (
                <span
                  key={row.id}
                  className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-charcoal shadow-sm"
                >
                  {row.subject}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs font-semibold text-charcoal/55">
              {formatInr(monthlyTotal)} / month
            </p>
            {paid ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Admission secured
              </p>
            ) : (
              <button type="button" onClick={onPay} className="btn-primary mt-3 w-full">
                <CreditCard className="h-4 w-4" />
                Pay & secure admission
              </button>
            )}
          </div>
        ) : completed ? (
          <p className="px-1 text-[11px] leading-snug text-charcoal/45">
            Assigned subjects will appear here after the consultant finishes the report.
          </p>
        ) : null}
      </div>
    </article>
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
    <div className="flex min-w-0 items-start gap-2.5 rounded-2xl bg-[#f8fafc] px-3 py-2.5">
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
