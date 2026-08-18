import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { site } from '@/lib/site'
import { monthlyRateForGrade, formatInr } from '@/lib/tuition-plans'
import { publishAssessmentReport, saveStudentSubjects } from '@/lib/assessments'
import type { AssessmentRequestDetails, StudentSubject, WeakSubjectNote } from '@/lib/database.types'

export function AssessmentConsultantModal({
  request,
  assignedSubjects,
  onClose,
  onPublished,
  onSubjectsSaved,
  onError,
}: {
  request: AssessmentRequestDetails
  assignedSubjects: string[]
  onClose: () => void
  onPublished: (path: string, weakSubjects: WeakSubjectNote[], report: string) => void
  onSubjectsSaved: (rows: StudentSubject[]) => void
  onError: (message: string) => void
}) {
  const student = request.student
  const [step, setStep] = useState<'report' | 'subjects'>(request.report_path ? 'subjects' : 'report')
  const [selectedWeak, setSelectedWeak] = useState<string[]>(
    request.weak_subjects?.map((item) => item.subject) ?? [],
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries((request.weak_subjects ?? []).map((item) => [item.subject, item.note])),
  )
  const [recommendation, setRecommendation] = useState(request.report?.split('\n\n').at(-1) ?? '')
  const [tuitionSubjects, setTuitionSubjects] = useState<string[]>(assignedSubjects)
  const [saving, setSaving] = useState(false)
  const rate = monthlyRateForGrade(student?.grade)

  const weakSubjects = useMemo<WeakSubjectNote[]>(
    () => selectedWeak.map((subject) => ({ subject, note: notes[subject]?.trim() || '' })),
    [notes, selectedWeak],
  )

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  async function onGenerate() {
    if (weakSubjects.length === 0) {
      onError('Select the subjects this student is weaker in.')
      return
    }
    setSaving(true)
    try {
      const path = await publishAssessmentReport({
        request,
        weakSubjects,
        recommendation,
      })
      const report = `${weakSubjects.map((item) => `${item.subject}: ${item.note || 'Needs support'}`).join('\n')}\n\n${recommendation.trim()}`
      onPublished(path, weakSubjects, report)
      setTuitionSubjects((current) => (current.length > 0 ? current : selectedWeak))
      setStep('subjects')
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to generate the report PDF.')
    } finally {
      setSaving(false)
    }
  }

  async function onSaveSubjects() {
    if (!student) return
    if (tuitionSubjects.length === 0) {
      onError('Select the subjects this student will take tuition for.')
      return
    }
    setSaving(true)
    try {
      const rows = await saveStudentSubjects(student, tuitionSubjects, rate)
      onSubjectsSaved(rows)
      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to save subjects.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
          aria-label="Close"
          onClick={onClose}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-6 py-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">
                {step === 'report' ? 'Step 1 of 2' : 'Step 2 of 2'}
              </p>
              <h2 className="mt-1 text-lg font-bold text-charcoal">
                {step === 'report' ? 'Weak-subject report' : 'Assign tuition subjects'}
              </h2>
              <p className="mt-1 text-sm text-charcoal/50">
                {student?.full_name || 'Student'}
                {student?.grade ? ` · ${student.grade}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 hover:text-crimson"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {step === 'report' ? (
              <div className="space-y-4">
                <p className="text-sm text-charcoal/55">
                  Select the subjects this student is weaker in, add a short note, then generate the
                  PDF report.
                </p>
                <div className="space-y-3">
                  {site.subjects.map((subject) => {
                    const checked = selectedWeak.includes(subject)
                    return (
                      <label
                        key={subject}
                        className="block rounded-2xl border border-charcoal/[0.08] bg-[#f8fafc] p-3"
                      >
                        <span className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                          <input
                            type="checkbox"
                            className="accent-crimson"
                            checked={checked}
                            onChange={() => setSelectedWeak((list) => toggle(list, subject))}
                          />
                          {subject}
                        </span>
                        {checked ? (
                          <textarea
                            rows={2}
                            className="input-field mt-2"
                            placeholder="What is weak, and what should improve?"
                            value={notes[subject] ?? ''}
                            onChange={(e) =>
                              setNotes((current) => ({ ...current, [subject]: e.target.value }))
                            }
                          />
                        ) : null}
                      </label>
                    )
                  })}
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                    Recommendation
                  </span>
                  <textarea
                    rows={3}
                    className="input-field"
                    placeholder="Recommended tuition plan and next steps"
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value)}
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-charcoal/55">
                  Choose the subjects this student will take tuition for. Monthly fee is{' '}
                  {formatInr(rate)} per subject.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {site.subjects.map((subject) => {
                    const checked = tuitionSubjects.includes(subject)
                    return (
                      <label
                        key={subject}
                        className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold ${
                          checked
                            ? 'border-crimson/30 bg-crimson/5 text-crimson'
                            : 'border-charcoal/[0.08] bg-[#f8fafc] text-charcoal'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-crimson"
                          checked={checked}
                          onChange={() => setTuitionSubjects((list) => toggle(list, subject))}
                        />
                        {subject}
                      </label>
                    )
                  })}
                </div>
                <p className="text-sm font-semibold text-charcoal">
                  Total: {formatInr(rate * tuitionSubjects.length)} / month
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-charcoal/[0.06] px-6 py-4">
            {step === 'report' ? (
              <button type="button" disabled={saving} onClick={() => void onGenerate()} className="btn-primary w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…
                  </>
                ) : (
                  'Generate PDF & continue'
                )}
              </button>
            ) : (
              <div className="flex gap-3">
                <button type="button" className="btn-outline flex-1" onClick={() => setStep('report')}>
                  Back
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void onSaveSubjects()}
                  className="btn-primary flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    'Save subjects'
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
