import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Mail, MessageSquare, Phone, Plus, User, X } from 'lucide-react'
import { useTrial } from '@/context/TrialContext'
import {
  createTrialStudentEntry,
  TrialStudentFields,
  type TrialStudentEntry,
} from '@/components/floating/TrialStudentFields'
import { FormDisclaimer } from '@/components/forms/FormDisclaimer'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { FormSuccess } from '@/components/forms/FormSuccess'
import { useCurriculum } from '@/hooks/useCurriculum'
import { gradeLabelFromPlan } from '@/lib/curriculum'
import { submitTrial } from '@/lib/email'
import { site } from '@/lib/site'

function emptyForm() {
  return {
    parentName: '',
    email: '',
    phone: '',
    students: [createTrialStudentEntry()],
    message: '',
  }
}

function validateStudents(students: TrialStudentEntry[]) {
  for (const [index, student] of students.entries()) {
    if (!student.studentName.trim()) {
      return `Enter a name for student ${index + 1}.`
    }
    if (!student.grade) {
      return `Select a grade for student ${index + 1}.`
    }
    if (student.subjects.length === 0) {
      return `Select at least one subject for student ${index + 1}.`
    }
  }
  return null
}

function studentsReady(students: TrialStudentEntry[]) {
  return students.every(
    (student) => student.studentName.trim() && student.grade && student.subjects.length > 0,
  )
}

export function TrialModal() {
  const { isOpen, closeTrial, referral, plan: preselectedPlan } = useTrial()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const { syllabi, loading: curriculumLoading } = useCurriculum()
  const boardOptions = useMemo(
    () => (syllabi.length > 0 ? syllabi : site.boards.map((board) => board.name)),
    [syllabi],
  )

  const updateStudent = useCallback((id: string, patch: Partial<TrialStudentEntry>) => {
    setForm((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === id ? { ...student, ...patch } : student,
      ),
    }))
  }, [])

  const removeStudent = useCallback((id: string) => {
    setForm((current) => ({
      ...current,
      students: current.students.filter((student) => student.id !== id),
    }))
  }, [])

  const addStudent = useCallback(() => {
    setForm((current) => ({
      ...current,
      students: [...current.students, createTrialStudentEntry()],
    }))
  }, [])

  useEffect(() => {
    if (!isOpen) return
    if (!preselectedPlan) return
    const grade = gradeLabelFromPlan(preselectedPlan)
    setForm((current) => ({
      ...current,
      students: current.students.map((student, index) =>
        index === 0 ? { ...student, grade } : student,
      ),
    }))
  }, [isOpen, preselectedPlan])

  function handleClose() {
    closeTrial()
    setStatus('idle')
    setError('')
    setForm(emptyForm())
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const validationError = validateStudents(form.students)
    if (validationError) {
      setError(validationError)
      return
    }
    setStatus('loading')
    try {
      await submitTrial({
        name: form.parentName,
        parentName: form.parentName,
        email: form.email,
        phone: form.phone,
        students: form.students.map((student) => ({
          studentName: student.studentName.trim(),
          board: student.board,
          grade: student.grade,
          subjects: student.subjects,
        })),
        message: form.message || undefined,
        referral: referral || undefined,
      })
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Unable to send. Please try again.')
    }
  }

  const canSubmit = studentsReady(form.students) && !curriculumLoading

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
            aria-label="Close"
            onClick={handleClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trial-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)] lg:max-h-[min(92vh,720px)] lg:max-w-4xl lg:flex-row"
          >
            <div className="relative shrink-0 bg-gradient-to-br from-crimson via-[#e63946] to-crimson-dark px-6 pb-6 pt-7 text-white lg:flex lg:w-[42%] lg:min-h-0 lg:flex-col lg:justify-between lg:px-8 lg:py-8">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.22),transparent_42%)]"
              />
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white lg:right-4 lg:top-4"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                  Free assessment
                </p>
                <h2 id="trial-title" className="mt-2 text-2xl font-extrabold tracking-tight lg:text-3xl">
                  {status === 'done' ? 'Request received' : 'Book your free assessment'}
                </h2>
                <p className="mt-1.5 text-sm text-white/80 lg:mt-3 lg:text-base lg:leading-relaxed">
                  Small-batch live tuition for CBSE & ICSE, plus IGCSE one-to-one.
                </p>
              </div>
              {status !== 'done' ? (
                <ul className="relative mt-6 hidden space-y-3 text-sm text-white/85 lg:block">
                  <li className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                    Add each child&apos;s syllabus, grade, and subjects
                  </li>
                  <li className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                    We&apos;ll schedule a diagnostic session with our team
                  </li>
                  <li className="flex gap-2">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                    No payment required for the initial assessment
                  </li>
                </ul>
              ) : null}
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto">
                {status === 'done' ? (
                  <div className="p-6 lg:p-8">
                    <FormSuccess
                      titleId="trial-success"
                      description="We’ve received your assessment request and will get back to you shortly."
                      actionLabel="Close"
                      onAction={handleClose}
                    />
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="px-6 py-5 lg:px-8 lg:py-6">
                    {preselectedPlan ? (
                      <p className="mb-4 rounded-xl border border-crimson/15 bg-crimson/5 px-3 py-2 text-sm font-medium text-crimson">
                        Grade selected: {preselectedPlan}
                      </p>
                    ) : null}

                    <div className="space-y-4">
                      <div className="grid gap-4 lg:grid-cols-2 lg:gap-x-6">
                        <div className="lg:col-span-2">
                          <FormField label="Parent name" icon={User}>
                            <input
                              required
                              className={fieldClass(true)}
                              placeholder="Parent or guardian name"
                              value={form.parentName}
                              onChange={(e) => setForm((f) => ({ ...f, parentName: e.target.value }))}
                            />
                          </FormField>
                        </div>

                        <FormField label="Email" icon={Mail}>
                          <input
                            required
                            type="email"
                            className={fieldClass(true)}
                            placeholder="you@email.com"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          />
                        </FormField>
                        <FormField label="Phone" icon={Phone}>
                          <input
                            required
                            type="tel"
                            className={fieldClass(true)}
                            placeholder="WhatsApp preferred"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          />
                        </FormField>
                      </div>

                      <div className="space-y-4">
                        {form.students.map((student, index) => (
                          <TrialStudentFields
                            key={student.id}
                            index={index}
                            student={student}
                            boardOptions={boardOptions}
                            curriculumLoading={curriculumLoading}
                            canRemove={form.students.length > 1}
                            onChange={(patch) => updateStudent(student.id, patch)}
                            onRemove={() => removeStudent(student.id)}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addStudent}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-charcoal/15 bg-white px-4 py-3 text-sm font-semibold text-charcoal/70 transition hover:border-crimson/25 hover:text-crimson"
                      >
                        <Plus className="h-4 w-4" />
                        Add another student
                      </button>

                      <FormField label="Notes (optional)" icon={MessageSquare} iconAlign="top">
                        <textarea
                          className={`${fieldClass(true)} min-h-[88px] resize-none`}
                          placeholder={site.notesPlaceholder}
                          value={form.message}
                          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        />
                      </FormField>

                      {referral ? (
                        <p className="text-xs text-charcoal/50">Referral code: {referral}</p>
                      ) : null}
                      {error ? (
                        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                          {error}
                        </p>
                      ) : null}

                      <button
                        type="submit"
                        disabled={status === 'loading' || curriculumLoading || !canSubmit}
                        className="btn-primary w-full"
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                          </>
                        ) : (
                          site.assessmentCta
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="shrink-0 border-t border-charcoal/[0.06] bg-slate-50 px-6 py-4 lg:px-8">
                <FormDisclaimer />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
