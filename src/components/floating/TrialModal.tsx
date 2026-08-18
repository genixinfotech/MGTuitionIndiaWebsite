import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  User,
  X,
} from 'lucide-react'
import { useTrial } from '@/context/TrialContext'
import { FormDisclaimer } from '@/components/forms/FormDisclaimer'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { FormSuccess } from '@/components/forms/FormSuccess'
import { submitTrial } from '@/lib/email'
import { site } from '@/lib/site'
import { formatInr, tuitionPlans } from '@/lib/tuition-plans'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  board: 'CBSE',
  plan: '',
  message: '',
}

export function TrialModal() {
  const { isOpen, closeTrial, referral, plan: preselectedPlan } = useTrial()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      setForm((f) => ({ ...f, plan: preselectedPlan }))
    }
  }, [isOpen, preselectedPlan])

  function handleClose() {
    closeTrial()
    setStatus('idle')
    setError('')
    setForm(emptyForm)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      await submitTrial({
        ...form,
        plan: form.plan || undefined,
        referral: referral || undefined,
      })
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Unable to send. Please try again.')
    }
  }

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
            className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)]"
          >
            <div className="relative shrink-0 bg-gradient-to-r from-crimson via-[#e63946] to-crimson-dark px-6 pb-6 pt-7 text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.22),transparent_42%)]"
              />
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                Free assessment
              </p>
              <h2 id="trial-title" className="relative mt-2 text-2xl font-extrabold tracking-tight">
                {status === 'done' ? 'Request received' : 'Book your free assessment'}
              </h2>
              <p className="relative mt-1.5 text-sm text-white/80">
                Small-batch live tuition for CBSE & ICSE, plus IGCSE one-to-one.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {status === 'done' ? (
                <div className="p-6">
                  <FormSuccess
                    titleId="trial-success"
                    description="We’ve received your assessment request and will get back to you shortly."
                    actionLabel="Close"
                    onAction={handleClose}
                  />
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
                  {preselectedPlan ? (
                    <p className="rounded-xl border border-crimson/15 bg-crimson/5 px-3 py-2 text-sm font-medium text-crimson">
                      Plan selected: {preselectedPlan}
                    </p>
                  ) : null}

                  <FormField label="Parent / student name" icon={User}>
                    <input
                      required
                      className={fieldClass(true)}
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </FormField>

                  <div className="grid gap-4 sm:grid-cols-2">
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Board" icon={BookOpen}>
                      <select
                        className={fieldClass(true)}
                        value={form.board}
                        onChange={(e) => setForm((f) => ({ ...f, board: e.target.value }))}
                      >
                        {site.boards.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Tuition plan" icon={CalendarDays}>
                      <select
                        required
                        className={fieldClass(true)}
                        value={form.plan}
                        onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                      >
                        <option value="">Select class</option>
                        {tuitionPlans.map((p) => (
                          <option key={p.grade} value={p.grade}>
                            {p.grade} — {formatInr(p.rate)}/mo
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Notes (optional)" icon={MessageSquare} iconAlign="top">
                    <textarea
                      className={`${fieldClass(true)} min-h-[88px] resize-none`}
                      placeholder="Class 6 or above, subjects, goals"
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
                    disabled={status === 'loading'}
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
                </form>
              )}
            </div>

            <div className="shrink-0 bg-slate-50 px-6 py-4">
              <FormDisclaimer />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
