import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { useTrial } from '@/context/TrialContext'
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
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      setForm((f) => ({ ...f, plan: preselectedPlan }))
    }
  }, [isOpen, preselectedPlan])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('loading')
    await submitTrial({
      ...form,
      plan: form.plan || undefined,
      referral: referral || undefined,
    })
    setStatus('done')
    setTimeout(() => {
      closeTrial()
      setStatus('idle')
      setForm(emptyForm)
    }, 1200)
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
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={closeTrial}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trial-title"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-glass-lg"
          >
            <button
              type="button"
              onClick={closeTrial}
              className="absolute right-4 top-4 rounded-full p-1.5 text-charcoal/50 transition hover:bg-crimson/10 hover:text-crimson"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="section-eyebrow mb-3">Free trial</p>
            <h2 id="trial-title" className="text-2xl font-bold text-charcoal">
              Book a live demo class
            </h2>
            <p className="mt-1 text-sm text-charcoal/60">
              Tell us about your child — we&apos;ll match a tutor for {site.brand}.
            </p>

            {preselectedPlan ? (
              <p className="mt-3 rounded-xl border border-crimson/15 bg-crimson/5 px-3 py-2 text-sm font-medium text-crimson">
                Plan selected: {preselectedPlan}
              </p>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 space-y-3">
              <input
                required
                className="input-field"
                placeholder="Parent / student name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              <input
                required
                type="email"
                className="input-field"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <input
                required
                type="tel"
                className="input-field"
                placeholder="Phone (WhatsApp preferred)"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              <select
                className="input-field"
                value={form.board}
                onChange={(e) => setForm((f) => ({ ...f, board: e.target.value }))}
              >
                {site.boards.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                className="input-field"
                value={form.plan}
                onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
                required
              >
                <option value="">Select tuition plan</option>
                {tuitionPlans.map((p) => (
                  <option key={p.grade} value={p.grade}>
                    {p.grade} — {formatInr(p.offer)}/mo offer
                  </option>
                ))}
              </select>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="Class, subjects, goals (optional)"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
              {referral ? (
                <p className="text-xs text-charcoal/50">Referral code: {referral}</p>
              ) : null}
              <button
                type="submit"
                disabled={status === 'loading' || status === 'done'}
                className="btn-primary w-full"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : status === 'done' ? (
                  'Opening email…'
                ) : (
                  'Request free trial'
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
