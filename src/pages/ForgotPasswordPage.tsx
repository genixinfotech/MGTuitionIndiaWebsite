import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { useAuth } from '@/context/AuthContext'
import { site } from '@/lib/site'

export function ForgotPasswordPage() {
  const { sendPasswordReset, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      await sendPasswordReset(email)
      setStatus('done')
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Unable to send a reset link.')
    }
  }

  return (
    <PageShell>
      <HeroSection
        aside={
          <div className="w-full">
            <div className="rounded-[28px] border border-white/20 bg-white p-7 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] md:p-9">
              <h2 className="text-2xl font-extrabold tracking-tight text-charcoal md:text-3xl">
                Reset password
              </h2>
              <p className="mt-2 text-sm text-charcoal/55">
                We&apos;ll email you a link to choose a new password for your {site.brand} account.
              </p>

              {status === 'done' ? (
                <p className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  If an account exists for that email, a reset link is on its way.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="mt-7 space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                      Email
                    </span>
                    <span className="relative block">
                      <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center text-crimson">
                        <Mail className="h-4 w-4" strokeWidth={2.25} />
                      </span>
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        className="input-field pl-11"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </span>
                  </label>
                  {!configured ? (
                    <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                      Supabase is not configured on this environment yet.
                    </p>
                  ) : null}
                  {error ? (
                    <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                      {error}
                    </p>
                  ) : null}
                  <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-charcoal/50">
                <Link to="/login" className="font-semibold text-crimson hover:text-crimson-dark">
                  Back to sign in
                </Link>
              </p>
            </div>
          </div>
        }
      />
    </PageShell>
  )
}
