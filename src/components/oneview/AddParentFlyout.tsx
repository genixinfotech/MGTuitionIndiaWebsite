import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Phone, Plus, UserRound, X } from 'lucide-react'
import { StudentLoginEmailField } from '@/components/enrolment/StudentLoginEmailField'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { useParentEmailCheck } from '@/hooks/useParentEmailCheck'
import { createParent } from '@/lib/parents'
import type { ParentWithStudents } from '@/lib/database.types'

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
}

export function AddParentFlyout({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (parent: ParentWithStudents) => void
}) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const emailCheck = useParentEmailCheck(form.email)

  useEffect(() => {
    if (!open) return
    setForm(emptyForm)
    setError('')
    setShowPassword(false)
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
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!emailCheck.canSubmitWithEmail) {
      setError(emailCheck.message || 'Choose an available email before registering.')
      return
    }

    setSaving(true)
    try {
      const parent = await createParent(form)
      onCreated(parent)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add this parent.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="add-parent"
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
            aria-label="Close add parent panel"
            disabled={saving}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="oneview-add-parent-title"
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
                  <h2 id="oneview-add-parent-title">Add parent</h2>
                </div>
                <p className="mt-1 text-sm text-charcoal/50">
                  Creates a parent login, profile, and parent record on the platform.
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
                <FormField label="Full name" icon={UserRound}>
                  <input
                    required
                    className={fieldClass(true)}
                    placeholder="Parent name"
                    value={form.full_name}
                    onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))}
                  />
                </FormField>
                <StudentLoginEmailField
                  label="Login email"
                  placeholder="parent@email.com"
                  value={form.email}
                  onChange={(email) => setForm((current) => ({ ...current, email }))}
                  status={emailCheck.status}
                  message={emailCheck.message}
                  isChecking={emailCheck.isChecking}
                  isAvailable={emailCheck.isAvailable}
                  isUnavailable={emailCheck.isUnavailable}
                />
                <FormField label="Phone (optional)" icon={Phone}>
                  <input
                    type="tel"
                    className={fieldClass(true)}
                    placeholder="Mobile number"
                    value={form.phone}
                    onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </FormField>
                <FormField label="Password" icon={Lock}>
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`${fieldClass(true)} pr-11`}
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-charcoal/40 hover:text-charcoal"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Adding parent…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add parent
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
