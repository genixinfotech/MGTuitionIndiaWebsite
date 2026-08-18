import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CreditCard, Loader2, X } from 'lucide-react'
import { payAndSecureAdmission } from '@/lib/assessments'
import { formatInr } from '@/lib/tuition-plans'
import type { Admission, Student, StudentSubject } from '@/lib/database.types'

export function AdmissionCheckout({
  student,
  parentId,
  subjects,
  onClose,
  onPaid,
  onError,
}: {
  student: Student | null
  parentId: string
  subjects: StudentSubject[]
  onClose: () => void
  onPaid: (row: Admission) => void
  onError: (message: string) => void
}) {
  const [saving, setSaving] = useState(false)
  const [localError, setLocalError] = useState('')
  const amount = subjects.reduce((sum, row) => sum + row.monthly_rate, 0)

  async function onPay() {
    if (!student) return
    setSaving(true)
    setLocalError('')
    try {
      const row = await payAndSecureAdmission({
        studentId: student.id,
        parentId,
        amount,
        subjects: subjects.map((item) => item.subject),
      })
      onPaid(row)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to complete admission.'
      setLocalError(message)
      onError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {student ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
            aria-label="Close payment"
            disabled={saving}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="admission-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">
                  Secure admission
                </p>
                <h2 id="admission-title" className="mt-1 text-lg font-bold text-charcoal">
                  {student.full_name}
                </h2>
                <p className="mt-1 text-sm text-charcoal/50">
                  Pay the first month to confirm the subjects assigned after assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 hover:text-crimson disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
              {subjects.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center justify-between rounded-2xl bg-[#f8fafc] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-charcoal">{row.subject}</p>
                  <p className="text-sm font-bold text-charcoal">{formatInr(row.monthly_rate)}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-crimson/15 bg-crimson/[0.04] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/40">
                  First month total
                </p>
                <p className="mt-1 text-2xl font-extrabold text-charcoal">{formatInr(amount)}</p>
              </div>
            </div>

            <div className="border-t border-charcoal/[0.06] px-5 py-4">
              {localError ? (
                <p className="mb-3 rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                  {localError}
                </p>
              ) : null}
              <button type="button" disabled={saving || subjects.length === 0} onClick={() => void onPay()} className="btn-primary w-full">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay & secure admission
                  </>
                )}
              </button>
              <p className="mt-3 flex items-start gap-2 text-[11px] leading-snug text-charcoal/45">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" />
                This confirms admission for the subjects above. A payment gateway can be added later.
              </p>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
