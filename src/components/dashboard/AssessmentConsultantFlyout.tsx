import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Loader2, X } from 'lucide-react'
import { useSubjectsForGrade } from '@/hooks/useCurriculum'
import { monthlyRateForGrade } from '@/lib/tuition-plans'
import { publishAssessmentReport, saveStudentSubjects } from '@/lib/assessments'
import type { AssessmentRequestDetails, StudentSubject, WeakSubjectNote } from '@/lib/database.types'

export function AssessmentConsultantFlyout({
  request,
  onClose,
  onPublished,
  onSubjectsSaved,
  onError,
}: {
  request: AssessmentRequestDetails
  onClose: () => void
  onPublished: (path: string, weakSubjects: WeakSubjectNote[], report: string) => void
  onSubjectsSaved: (rows: StudentSubject[]) => void
  onError: (message: string) => void
}) {
  const student = request.student
  const focusedSubject = request.subject !== 'General' ? request.subject : null
  const { subjects: gradeSubjects, loading: gradeSubjectsLoading } = useSubjectsForGrade(
    student?.grade,
    student?.board,
  )
  const [selectedWeak, setSelectedWeak] = useState<string[]>(
    request.weak_subjects?.map((item) => item.subject) ??
      (focusedSubject ? [focusedSubject] : []),
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries((request.weak_subjects ?? []).map((item) => [item.subject, item.note])),
  )
  const [singleNote, setSingleNote] = useState(
    request.weak_subjects?.find((item) => item.subject === focusedSubject)?.note ?? '',
  )
  const [recommendation, setRecommendation] = useState(request.report?.split('\n\n').at(-1) ?? '')
  const [saving, setSaving] = useState(false)
  const rate = monthlyRateForGrade(student?.grade)

  const weakSubjects = useMemo<WeakSubjectNote[]>(() => {
    if (focusedSubject) {
      return [{ subject: focusedSubject, note: singleNote.trim() }]
    }
    return selectedWeak.map((subject) => ({ subject, note: notes[subject]?.trim() || '' }))
  }, [focusedSubject, notes, selectedWeak, singleNote])

  const tuitionSubject = focusedSubject ?? (request.subject !== 'General' ? request.subject : null)

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, saving])

  function toggle(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }

  async function onGenerate() {
    if (focusedSubject && !singleNote.trim()) {
      onError(`Add a short note for ${focusedSubject}.`)
      return
    }
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

      if (student && tuitionSubject) {
        const rows = await saveStudentSubjects(student, [tuitionSubject], rate)
        onSubjectsSaved(rows)
      }

      onClose()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to generate the report PDF.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="assessment-consultant-flyout"
        className="fixed inset-0 z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <button
          type="button"
          className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
          aria-label="Close assessment report panel"
          disabled={saving}
          onClick={onClose}
        />
        <motion.aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="assessment-consultant-flyout-title"
          className="fixed top-0 right-0 flex h-dvh w-full max-w-lg flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
            <div>
              <div className="flex items-center gap-2 font-bold text-charcoal">
                <FileText className="h-5 w-5 text-crimson" />
                <h2 id="assessment-consultant-flyout-title">
                  {focusedSubject ? `${focusedSubject} assessment` : 'Weak-subject report'}
                </h2>
              </div>
              <p className="mt-1 text-sm text-charcoal/50">
                {[
                  student?.full_name || 'Student',
                  student?.board,
                  student?.grade,
                  tuitionSubject ?? (request.subject !== 'General' ? request.subject : null),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 transition-colors hover:border-crimson/30 hover:text-crimson disabled:opacity-40"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="space-y-4">
              <p className="text-sm text-charcoal/55">
                {focusedSubject
                  ? `Add findings for the ${focusedSubject} assessment, then generate the PDF report.`
                  : 'Select the subjects this student is weaker in, add a short note, then generate the PDF report.'}
              </p>
              {focusedSubject ? (
                <label className="block rounded-2xl border border-charcoal/[0.08] bg-gray-50 p-3">
                  <span className="text-sm font-semibold text-charcoal">{focusedSubject}</span>
                  <textarea
                    rows={4}
                    className="input-field mt-2"
                    placeholder="What is weak, and what should improve?"
                    value={singleNote}
                    onChange={(e) => setSingleNote(e.target.value)}
                  />
                </label>
              ) : gradeSubjectsLoading ? (
                <p className="text-sm text-charcoal/50">Loading subjects for this grade…</p>
              ) : (
                <div className="space-y-3">
                  {gradeSubjects.map((subject) => {
                    const checked = selectedWeak.includes(subject)
                    return (
                      <label
                        key={subject}
                        className="block rounded-2xl border border-charcoal/[0.08] bg-gray-50 p-3"
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
              )}
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
          </div>

          <div className="border-t border-charcoal/[0.06] px-5 py-4">
            <button type="button" disabled={saving} onClick={() => void onGenerate()} className="btn-primary w-full">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving report…
                </>
              ) : request.report_path ? (
                'Update PDF report'
              ) : (
                'Generate PDF report'
              )}
            </button>
          </div>
        </motion.aside>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
