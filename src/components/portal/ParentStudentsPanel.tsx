import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { StudentLoginEmailField } from '@/components/enrolment/StudentLoginEmailField'
import { AssessmentRequestFlow } from '@/components/portal/AssessmentRequestFlow'
import { AssessmentReportModal } from '@/components/portal/AssessmentReportModal'
import { AdmissionCheckout } from '@/components/portal/AdmissionCheckout'
import { PaymentNoticeModal, type PaymentNoticeTone } from '@/components/portal/PaymentNoticeModal'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { useStudentEmailCheck } from '@/hooks/useStudentEmailCheck'
import { useCurriculum, useGradesForSyllabus } from '@/hooks/useCurriculum'
import { useAuth } from '@/context/AuthContext'
import {
  admissionForStudent,
  allAssessmentsCompleted,
  assessmentsForStudent,
  buildPayableTuitionSubjects,
  formatPreferredSlot,
  listAdmissions,
  listStudentSubjects,
  openAssessmentStatuses,
  openAssessmentSubjects,
  paidOnlyAdmissionSubjectsFromPayable,
  paidMonthsForSubject,
  payableSubjectToCheckoutRow,
  subjectsForStudent,
  unpaidPayableTuitionSubjects,
} from '@/lib/assessments'
import {
  emptyEnrolment,
  enrolmentSyllabi,
  locationOptions,
  type EnrolmentForm,
} from '@/lib/enrolment'
import { getSupabase } from '@/lib/supabase'
import { site } from '@/lib/site'
import type { Admission, AssessmentRequest, Student, StudentSubject } from '@/lib/database.types'
import { confirmTuitionCheckout } from '@/lib/payment-api'
import type { TuitionPaymentReceipt } from '@/lib/payments'
import { formatInr } from '@/lib/tuition-plans'
import { coveredThroughFromAdmission, monthLabelFromKey } from '@/lib/class-billing'

export type ParentStudentsPanelHandle = {
  openEnrolPanel: () => void
}

export function ParentStudentActionButtons({ onEnrol }: { onEnrol: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={onEnrol}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
      >
        <Plus className="h-4 w-4" />
        Enrol a child
      </button>
    </div>
  )
}

export const ParentStudentsPanel = forwardRef<ParentStudentsPanelHandle>(function ParentStudentsPanel(_, ref) {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [students, setStudents] = useState<Student[]>([])
  const [assessmentRequests, setAssessmentRequests] = useState<AssessmentRequest[]>([])
  const [studentSubjects, setStudentSubjects] = useState<StudentSubject[]>([])
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [assessmentStudent, setAssessmentStudent] = useState<Student | null>(null)
  const [reportRequest, setReportRequest] = useState<AssessmentRequest | null>(null)
  const [payingContext, setPayingContext] = useState<{
    student: Student
    subjects: StudentSubject[]
    renewal?: boolean
  } | null>(null)
  const [form, setForm] = useState<EnrolmentForm>(emptyEnrolment)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [paymentNotice, setPaymentNotice] = useState<{
    tone: PaymentNoticeTone
    title: string
    message: string
    receipt?: TuitionPaymentReceipt | null
  } | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const emailCheck = useStudentEmailCheck(form.email)
  const { curriculum, syllabi } = useCurriculum()
  const { grades: gradesForSyllabus, loading: gradesLoading } = useGradesForSyllabus(form.board)
  const syllabusOptions = syllabi.length > 0 ? syllabi : enrolmentSyllabi

  function openPanel() {
    setError('')
    setShowPassword(false)
    setAssessmentStudent(null)
    setPanelOpen(true)
  }

  useImperativeHandle(ref, () => ({
    openEnrolPanel: openPanel,
  }))

  useEffect(() => {
    if (!user) return
    const supabase = getSupabase()
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

  useEffect(() => {
    const status = searchParams.get('payment')
    const sessionId = searchParams.get('session_id')
    if (!status) return

    if (status === 'cancelled') {
      setPaymentNotice({
        tone: 'info',
        title: 'Payment cancelled',
        message: 'Payment was cancelled. You can try again whenever you are ready.',
      })
      setSearchParams({}, { replace: true })
      return
    }

    if (status === 'success' && !sessionId) {
      setPaymentNotice({
        tone: 'error',
        title: 'Payment could not be confirmed',
        message: 'Stripe did not return a checkout session. Please try again or contact us if money was deducted.',
      })
      setSearchParams({}, { replace: true })
      return
    }

    if (status === 'success' && sessionId) {
      let cancelled = false
      setPaymentNotice({
        tone: 'loading',
        title: 'Confirming payment',
        message: 'Please wait while we update admission and class sessions.',
      })
      void confirmTuitionCheckout(sessionId)
        .then(({ admission, receipt }) => {
          if (cancelled) return
          setAdmissions((current) => [
            admission,
            ...current.filter((item) => item.student_id !== admission.student_id),
          ])
          setPaymentNotice({
            tone: 'success',
            title: 'Payment received',
            message: 'Admission and class sessions are now updated.',
            receipt,
          })
        })
        .catch((err) => {
          if (!cancelled) {
            setPaymentNotice({
              tone: 'error',
              title: 'Payment could not be confirmed',
              message: err instanceof Error ? err.message : 'Unable to confirm this payment.',
            })
          }
        })
        .finally(() => {
          if (!cancelled) setSearchParams({}, { replace: true })
        })
      return () => {
        cancelled = true
      }
    }

    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

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
    if (!emailCheck.canSubmitWithEmail) {
      setError(emailCheck.message || 'Choose an available student email before enrolling.')
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
      <PaymentNoticeModal
        open={Boolean(paymentNotice)}
        tone={paymentNotice?.tone ?? 'info'}
        title={paymentNotice?.title ?? ''}
        message={paymentNotice?.message ?? ''}
        receipt={paymentNotice?.receipt}
        onConfirm={() => setPaymentNotice(null)}
      />

      {error && !panelOpen ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">{error}</p>
      ) : null}

      {students.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-10 text-center text-sm text-charcoal/50">
          No students enrolled yet. Click Enrol a child to add your first child.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {students.map((student) => {
            const requests = assessmentsForStudent(assessmentRequests, student.id)
            const blockedSubjects = [
              ...openAssessmentSubjects(assessmentRequests, student.id),
              ...requests.filter((row) => row.status === 'completed').map((row) => row.subject),
            ]
            const gradeSubjects =
              curriculum?.subjectsBySyllabusGrade[student.board ?? '']?.[student.grade ?? ''] ?? []
            const latestRequest = requests[0] ?? null
            return (
              <StudentCard
                key={student.id}
                student={student}
                requests={requests}
                canRequestMore={blockedSubjects.length < gradeSubjects.length}
                subjects={subjectsForStudent(studentSubjects, student.id)}
                admission={admissionForStudent(admissions, student.id)}
                preferredSlot={formatPreferredSlot(latestRequest?.preferred_date, latestRequest?.preferred_time)}
                onRequest={() => {
                  if (saving) return
                  setPanelOpen(false)
                  setAssessmentStudent(student)
                }}
                onViewReport={(request) => setReportRequest(request)}
                onPay={(rows, renewal) => {
                  if (saving || rows.length === 0) return
                  setPanelOpen(false)
                  setPayingContext({ student, subjects: rows, renewal })
                }}
              />
            )
          })}
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {panelOpen ? (
            <motion.div
              key="enrol-panel"
              className="fixed inset-0 z-[70]"
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
                className="fixed top-0 right-0 flex h-dvh w-full max-w-sm flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
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

              <form onSubmit={(e) => void enrollStudent(e)} className="flex min-h-0 flex-1 flex-col">
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
                  <StudentLoginEmailField
                    value={form.email}
                    onChange={(email) => setForm((f) => ({ ...f, email }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, board: e.target.value, grade: '' }))}
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
                      onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                      disabled={!form.board || gradesLoading}
                    >
                      <option value="">{form.board ? 'Select class' : 'Select syllabus first'}</option>
                      {gradesForSyllabus.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
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
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      emailCheck.isChecking ||
                      (form.email.trim().includes('@') && !emailCheck.canSubmitWithEmail)
                    }
                    className="btn-primary w-full"
                  >
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
        </AnimatePresence>,
        document.body,
      )}

      <AssessmentRequestFlow
        student={assessmentStudent}
        parentId={user.id}
        blockedSubjects={
          assessmentStudent
            ? [
                ...openAssessmentSubjects(assessmentRequests, assessmentStudent.id),
                ...assessmentsForStudent(assessmentRequests, assessmentStudent.id)
                  .filter((row) => row.status === 'completed')
                  .map((row) => row.subject),
              ]
            : []
        }
        onClose={() => setAssessmentStudent(null)}
        onCreated={(rows) => {
          setAssessmentRequests((current) => [...rows, ...current])
          setAssessmentStudent(null)
        }}
      />
      <AssessmentReportModal
        open={Boolean(reportRequest)}
        studentName={
          students.find((row) => row.id === reportRequest?.student_id)?.full_name || 'Student'
        }
        subject={reportRequest?.subject}
        preferredDate={reportRequest?.preferred_date}
        preferredTime={reportRequest?.preferred_time}
        report={reportRequest?.report ?? null}
        reportPath={reportRequest?.report_path}
        onClose={() => setReportRequest(null)}
      />
      <AdmissionCheckout
        student={payingContext?.student ?? null}
        parentId={user.id}
        subjects={payingContext?.subjects ?? []}
        renewal={payingContext?.renewal ?? false}
        onClose={() => setPayingContext(null)}
        onPaid={(row) => {
          setAdmissions((current) => [
            row,
            ...current.filter((item) => item.student_id !== row.student_id),
          ])
        }}
        onError={setError}
      />
    </>
  )
})

function hasAssessmentReport(request: AssessmentRequest) {
  return Boolean(request.report_path || request.report?.trim())
}

function ViewReportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onClick()
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-crimson bg-crimson px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-crimson-dark"
    >
      <FileText className="h-3 w-3" />
      View report
    </button>
  )
}

function StudentCard({
  student,
  requests,
  canRequestMore,
  subjects,
  admission,
  preferredSlot,
  onRequest,
  onViewReport,
  onPay,
}: {
  student: Student
  requests: AssessmentRequest[]
  canRequestMore: boolean
  subjects: StudentSubject[]
  admission: Admission | null
  preferredSlot: string
  onRequest: () => void
  onViewReport: (request: AssessmentRequest) => void
  onPay: (subjects: StudentSubject[], renewal?: boolean) => void
}) {
  const location = [student.city, student.state].filter(Boolean).join(', ')
  const initial = (student.full_name.trim().charAt(0) || '?').toUpperCase()
  const openRequests = requests.filter((row) => openAssessmentStatuses.includes(row.status))
  const completedRequests = requests.filter((row) => row.status === 'completed')
  const completedWithReports = completedRequests.filter(hasAssessmentReport)
  const allComplete = allAssessmentsCompleted(requests, student.id)
  const payableSubjects = buildPayableTuitionSubjects({
    student,
    assignedSubjects: subjects,
    admission,
    completedReports: completedWithReports,
    openRequests,
  })
  const securedOnlySubjects = paidOnlyAdmissionSubjectsFromPayable(payableSubjects, admission)
  const unpaidPayableSubjects = unpaidPayableTuitionSubjects(payableSubjects)
  const unpaidSelectionKey = unpaidPayableSubjects.map((row) => row.key).join('|')
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setSelectedSubjects(new Set(unpaidPayableSubjects.map((row) => row.subject)))
  }, [student.id, unpaidSelectionKey])

  const selectedCheckoutSubjects = useMemo(
    () =>
      unpaidPayableSubjects
        .filter((row) => selectedSubjects.has(row.subject))
        .map((row) => payableSubjectToCheckoutRow(student.id, row)),
    [student.id, unpaidPayableSubjects, selectedSubjects],
  )
  const selectedTotal = selectedCheckoutSubjects.reduce((sum, row) => sum + row.monthly_rate, 0)
  const enrolmentTotal = payableSubjects.reduce((sum, row) => sum + row.monthly_rate, 0)
  const hasTuitionSection = payableSubjects.length > 0 || securedOnlySubjects.length > 0
  const allAdmissionSecured = hasTuitionSection && unpaidPayableSubjects.length === 0

  function toggleSubjectSelection(subject: string) {
    setSelectedSubjects((current) => {
      const next = new Set(current)
      if (next.has(subject)) next.delete(subject)
      else next.add(subject)
      return next
    })
  }

  function reportForSubject(subject: string) {
    return completedWithReports.find((request) => request.subject === subject) ?? null
  }

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

        {allComplete && completedWithReports.length > 0 && !allAdmissionSecured ? (
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
                <p className="mt-1 text-[11px] leading-snug text-charcoal/45">
                  View reports and pay for subjects below.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {openRequests.length > 0 ? (
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
                <p className="mt-1 text-[11px] leading-snug text-emerald-800/55">
                  A student consultant will confirm this slot shortly.
                </p>
              </div>
            </div>
            {canRequestMore ? (
              <button type="button" onClick={onRequest} className="btn-outline mt-3 w-full">
                <Sparkles className="h-4 w-4" />
                Request more subjects
              </button>
            ) : null}
          </div>
        ) : null}

        {openRequests.length === 0 && completedWithReports.length === 0 ? (
          <button type="button" onClick={onRequest} className="btn-primary mt-1 w-full">
            <Sparkles className="h-4 w-4" />
            {site.assessmentCta}
          </button>
        ) : null}

        {allAdmissionSecured ? (
          <Link to={`/portal/students/${student.id}`} className="btn-outline w-full">
            <UserRound className="h-4 w-4" />
            View student
          </Link>
        ) : hasTuitionSection ? (
          <div className="rounded-2xl border border-charcoal/[0.08] bg-gray-50 px-3.5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal/40">
              Tuition subjects
            </p>
            <div className="mt-2 space-y-2">
              {payableSubjects.map((row) => {
                const matchingReport = reportForSubject(row.subject)
                const isSelected = selectedSubjects.has(row.subject)

                if (row.secured) {
                  const paidMonths = paidMonthsForSubject(admission, row.subject)
                  const paidThrough = coveredThroughFromAdmission(admission)[row.subject]
                  return (
                    <div
                      key={row.key}
                      className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-charcoal">{row.subject}</span>
                          <p className="mt-0.5 text-xs font-medium text-charcoal/45">
                            {formatInr(row.monthly_rate)} / month
                            {paidThrough
                              ? ` · paid through ${monthLabelFromKey(paidThrough)}`
                              : ` · ${paidMonths} ${paidMonths === 1 ? 'month' : 'months'} paid`}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          {matchingReport ? (
                            <ViewReportButton onClick={() => onViewReport(matchingReport)} />
                          ) : null}
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admission secured
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onPay([payableSubjectToCheckoutRow(student.id, row)], true)}
                        className="btn-outline mt-3 w-full py-2 text-sm"
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay next month
                      </button>
                    </div>
                  )
                }

                return (
                  <label
                    key={row.key}
                    className={`block cursor-pointer rounded-xl border px-3 py-2.5 shadow-sm transition ${
                      isSelected
                        ? row.pendingAssessment
                          ? 'border-amber-300/60 bg-amber-50/50'
                          : 'border-crimson/25 bg-crimson/[0.04]'
                        : row.pendingAssessment
                          ? 'border-dashed border-charcoal/12 bg-white/80 opacity-90'
                          : 'border-charcoal/[0.08] bg-white opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 shrink-0 accent-crimson"
                        checked={isSelected}
                        onChange={() => toggleSubjectSelection(row.subject)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-sm font-semibold text-charcoal">{row.subject}</span>
                            <p className="mt-0.5 text-xs font-medium text-charcoal/45">
                              {formatInr(row.monthly_rate)} / month
                            </p>
                            {row.pendingAssessment ? (
                              <p className="mt-1 text-[11px] font-semibold text-amber-700">
                                Assessment pending — pay forward to secure admission
                              </p>
                            ) : null}
                          </div>
                          {matchingReport ? (
                            <ViewReportButton
                              onClick={() => {
                                onViewReport(matchingReport)
                              }}
                            />
                          ) : null}
                        </div>
                        {!isSelected ? (
                          <p className="mt-1.5 text-[11px] font-medium text-charcoal/45">
                            Skip payment for {row.subject}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </label>
                )
              })}
              {securedOnlySubjects.map((subject) => {
                const matchingReport = reportForSubject(subject)
                return (
                  <div
                    key={`secured-${subject}`}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-charcoal">{subject}</span>
                        <p className="mt-0.5 text-xs font-medium text-emerald-800/55">Paid earlier</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        {matchingReport ? (
                          <ViewReportButton onClick={() => onViewReport(matchingReport)} />
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
            {unpaidPayableSubjects.length > 0 ? (
              <div className="mt-3 space-y-2 border-t border-charcoal/[0.08] pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                    Selected monthly rate
                  </p>
                  <p className="text-sm font-extrabold text-charcoal">{formatInr(selectedTotal)}</p>
                </div>
                <p className="text-[11px] leading-snug text-charcoal/45">
                  If you join after the month has started, checkout charges only the remaining classes.
                  The next month is the full batch.
                </p>
                <button
                  type="button"
                  disabled={selectedCheckoutSubjects.length === 0}
                  onClick={() => onPay(selectedCheckoutSubjects)}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  {selectedCheckoutSubjects.length === 1
                    ? `Pay & secure ${selectedCheckoutSubjects[0]?.subject}`
                    : `Pay & secure ${selectedCheckoutSubjects.length} subjects`}
                </button>
                {selectedCheckoutSubjects.length === 0 ? (
                  <p className="text-[11px] leading-snug text-charcoal/45">
                    Select at least one subject above to continue to payment.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : allComplete ? (
          <p className="px-1 text-[11px] leading-snug text-charcoal/45">
            Assigned subjects will appear here after the consultant finishes all reports.
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
