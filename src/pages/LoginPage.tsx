import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { useAuth } from '@/context/AuthContext'
import { site } from '@/lib/site'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/portal" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      await login(email, password)
      navigate('/portal', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.')
      setStatus('idle')
    }
  }

  return (
    <PageShell>
      <HeroSection
        aside={
          <div className="w-full">
            <div className="rounded-[28px] border border-white/20 bg-white p-7 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] md:p-9">
              <h2 className="text-2xl font-extrabold tracking-tight text-charcoal md:text-3xl">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-charcoal/55">Sign in to your {site.brand} portal.</p>

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

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                    Password
                  </span>
                  <span className="relative block">
                    <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center text-crimson">
                      <Lock className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <input
                      required
                      minLength={8}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="input-field px-11"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-charcoal/40 hover:text-charcoal"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                </label>

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 text-charcoal/60">
                    <input type="checkbox" className="accent-crimson" />
                    Remember me
                  </label>
                  <Link to="/contact" className="font-semibold text-crimson hover:text-crimson-dark">
                    Forgot password?
                  </Link>
                </div>

                {error ? (
                  <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                    {error}
                  </p>
                ) : null}

                <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-charcoal/50">
                New to MG Tuition?{' '}
                <Link to="/signup" className="font-semibold text-crimson hover:text-crimson-dark">
                  Sign Up
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-white/75">
              Are you a Qualified Tutor?{' '}
              <Link to="/become-tutor" className="font-semibold text-white hover:text-crimson-light">
                Enroll Now
              </Link>
            </p>
          </div>
        }
      />
    </PageShell>
  )
}
