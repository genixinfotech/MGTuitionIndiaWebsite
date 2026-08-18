import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock, Loader2, Sparkles, X } from 'lucide-react'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { FormSuccess } from '@/components/forms/FormSuccess'
import {
  assessmentTimeSlots,
  formatPreferredSlot,
  isPreferredSlotInPast,
  localDateInputValue,
  requestStudentAssessment,
} from '@/lib/assessments'
import type { AssessmentRequest, Student } from '@/lib/database.types'

export function AssessmentRequestFlow({
  student,
  parentId,
  onClose,
  onCreated,
}: {
  student: Student | null
  parentId: string
  onClose: () => void
  onCreated: (row: AssessmentRequest) => void
}) {
  const [preferredDate, setPreferredDate] = useState(localDateInputValue())
  const [preferredTime, setPreferredTime] = useState('17:00')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState<{
    name: string
    date: string
    time: string
  } | null>(null)

  useEffect(() => {
    if (!student) return
    setPreferredDate(localDateInputValue())
    setPreferredTime('17:00')
    setError('')
  }, [student])

  useEffect(() => {
    if (!student && !confirmation) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || saving) return
      if (confirmation) setConfirmation(null)
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [student, confirmation, saving, onClose])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!student) return
    setError('')
    if (isPreferredSlotInPast(preferredDate, preferredTime)) {
      setError('Please choose a preferred date and time in the future.')
      return
    }
    setSaving(true)
    try {
      const row = await requestStudentAssessment({
        studentId: student.id,
        parentId,
        preferredDate,
        preferredTime,
      })
      onCreated(row)
      setConfirmation({
        name: student.full_name,
        date: preferredDate,
        time: preferredTime,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to request an assessment.')
    } finally {
      setSaving(false)
    }
  }

  function closePanel() {
    if (saving) return
    onClose()
  }

  return (
    <>
      <AnimatePresence>
        {student ? (
          <motion.div
            key="assessment-panel"
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
              aria-label="Close assessment panel"
              disabled={saving}
              onClick={closePanel}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="assessment-panel-title"
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            >
              <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
                <div>
                  <div className="flex items-center gap-2 font-bold text-charcoal">
                    <Sparkles className="h-5 w-5 text-crimson" />
                    <h2 id="assessment-panel-title">Get Free Assessment</h2>
                  </div>
                  <p className="mt-1 text-sm text-charcoal/50">
                    Choose a preferred slot for {student.full_name}. A student consultant will confirm
                    the time with you.
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

              <form onSubmit={(event) => void onSubmit(event)} className="flex min-h-0 flex-1 flex-col">
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
                  <FormField label="Preferred date" icon={CalendarDays}>
                    <input
                      required
                      type="date"
                      min={localDateInputValue()}
                      className={fieldClass(true)}
                      value={preferredDate}
                      onChange={(event) => setPreferredDate(event.target.value)}
                    />
                  </FormField>
                  <FormField label="Preferred time" icon={Clock}>
                    <select
                      required
                      className={fieldClass(true)}
                      value={preferredTime}
                      onChange={(event) => setPreferredTime(event.target.value)}
                    >
                      {assessmentTimeSlots.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
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
                        <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                      </>
                    ) : (
                      'Confirm request'
                    )}
                  </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {confirmation ? (
          <motion.div
            key="assessment-confirm"
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
              aria-label="Close confirmation"
              onClick={() => setConfirmation(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="assessment-confirm-title"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)] md:p-8"
            >
              <FormSuccess
                titleId="assessment-confirm-title"
                title="Assessment requested"
                description={`We've noted ${formatPreferredSlot(confirmation.date, confirmation.time)} for ${confirmation.name}. A Student Consultant will be contacting you shortly to confirm.`}
                actionLabel="Done"
                onAction={() => setConfirmation(null)}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
