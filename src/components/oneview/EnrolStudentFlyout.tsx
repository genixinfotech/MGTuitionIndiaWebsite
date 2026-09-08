import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Plus, UserRound, X } from 'lucide-react'
import { StudentEnrolFormFields } from '@/components/oneview/StudentEnrolFormFields'
import { useStudentEmailCheck } from '@/hooks/useStudentEmailCheck'
import { useCurriculum } from '@/hooks/useCurriculum'
import { emptyEnrolment, type EnrolmentForm } from '@/lib/enrolment'
import { enrolStudent } from '@/lib/students'
import type { ParentWithStudents, Student } from '@/lib/database.types'

export function EnrolStudentFlyout({
  parent,
  open,
  onClose,
  onEnrolled,
}: {
  parent: ParentWithStudents | null
  open: boolean
  onClose: () => void
  onEnrolled: (parentId: string, student: Student) => void
}) {
  const [form, setForm] = useState<EnrolmentForm>(emptyEnrolment)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const emailCheck = useStudentEmailCheck(form.email, parent?.id)
  const { syllabi } = useCurriculum()

  useEffect(() => {
    if (!open) return
    setForm(emptyEnrolment)
    setError('')
    setShowPassword(false)
  }, [open, parent?.id])

  useEffect(() => {
    if (!open) return
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
  }, [open, saving, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parent) return

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
      const student = await enrolStudent({
        ...form,
        parent_id: parent.id,
      })
      onEnrolled(parent.id, student)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to enrol this student.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && parent ? (
        <motion.div
          key={`enrol-${parent.id}`}
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
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="oneview-enrol-title"
            className="fixed top-0 right-0 flex h-dvh w-full max-w-md flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <div className="flex items-center gap-2 font-bold text-charcoal">
                  <UserRound className="h-5 w-5 text-crimson" />
                  <h2 id="oneview-enrol-title">Enrol a student</h2>
                </div>
                <p className="mt-1 text-sm text-charcoal/50">
                  Please enrol a student under{' '}
                  <span className="font-semibold text-charcoal">
                    {parent.full_name || parent.email}
                  </span>
                  .
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

            <form onSubmit={(event) => void handleSubmit(event)} className="flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
                <StudentEnrolFormFields
                  form={form}
                  onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
                  emailCheck={emailCheck}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((value) => !value)}
                  error={error}
                  syllabi={syllabi}
                />
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
  )
}
