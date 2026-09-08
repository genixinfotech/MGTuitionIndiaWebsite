import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, Loader2, Plus, X } from 'lucide-react'
import { ParentSearchSelect } from '@/components/oneview/ParentSearchSelect'
import { StudentEnrolFormFields } from '@/components/oneview/StudentEnrolFormFields'
import { FormField } from '@/components/forms/FormField'
import { useStudentEmailCheck } from '@/hooks/useStudentEmailCheck'
import { useCurriculum } from '@/hooks/useCurriculum'
import { emptyEnrolment, type EnrolmentForm } from '@/lib/enrolment'
import { listParentOptions, type ParentOption } from '@/lib/parents'
import { enrolStudent } from '@/lib/students'
import type { StudentWithParent } from '@/lib/database.types'

export function AddStudentFlyout({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (student: StudentWithParent) => void
}) {
  const [parents, setParents] = useState<ParentOption[]>([])
  const [loadingParents, setLoadingParents] = useState(false)
  const [parentId, setParentId] = useState('')
  const [form, setForm] = useState<EnrolmentForm>(emptyEnrolment)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const emailCheck = useStudentEmailCheck(form.email, parentId || undefined)
  const { syllabi } = useCurriculum()

  const selectedParent = useMemo(
    () => parents.find((parent) => parent.id === parentId) ?? null,
    [parentId, parents],
  )

  useEffect(() => {
    if (!open) return

    setForm(emptyEnrolment)
    setParentId('')
    setError('')
    setShowPassword(false)

    let cancelled = false
    setLoadingParents(true)

    void (async () => {
      try {
        const rows = await listParentOptions()
        if (!cancelled) setParents(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load parents.')
        }
      } finally {
        if (!cancelled) setLoadingParents(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open])

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

    setError('')
    if (!parentId) {
      setError('Select a parent to map this student to.')
      return
    }
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
        parent_id: parentId,
      })

      onCreated({
        ...student,
        parent: selectedParent
          ? {
              id: selectedParent.id,
              full_name: selectedParent.full_name,
              email: selectedParent.email,
              phone: selectedParent.phone,
            }
          : null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add this student.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="add-student"
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
            aria-label="Close add student panel"
            disabled={saving}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="oneview-add-student-title"
            className="fixed top-0 right-0 flex h-dvh w-full max-w-md flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <div className="flex items-center gap-2 font-bold text-charcoal">
                  <GraduationCap className="h-5 w-5 text-crimson" />
                  <h2 id="oneview-add-student-title">Add student</h2>
                </div>
                <p className="mt-1 text-sm text-charcoal/50">
                  Enrol a student under an existing parent account on the platform.
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
                <FormField label="Parent">
                  {loadingParents ? (
                    <div className="flex items-center gap-2 rounded-xl border border-charcoal/10 bg-charcoal/[0.02] px-4 py-3 text-sm text-charcoal/50">
                      <Loader2 className="h-4 w-4 animate-spin text-crimson" />
                      Loading parents…
                    </div>
                  ) : parents.length === 0 ? (
                    <p className="rounded-xl border border-charcoal/10 bg-charcoal/[0.02] px-4 py-3 text-sm text-charcoal/55">
                      No parents registered yet. Add a parent first from the Parents page.
                    </p>
                  ) : (
                    <ParentSearchSelect
                      parents={parents}
                      value={parentId}
                      onChange={setParentId}
                      disabled={saving}
                    />
                  )}
                </FormField>

                {parentId ? (
                  <StudentEnrolFormFields
                    form={form}
                    onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
                    emailCheck={emailCheck}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((value) => !value)}
                    error={error}
                    syllabi={syllabi}
                  />
                ) : error ? (
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
                    loadingParents ||
                    parents.length === 0 ||
                    !parentId ||
                    emailCheck.isChecking ||
                    (form.email.trim().includes('@') && !emailCheck.canSubmitWithEmail)
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Adding student…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add student
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
