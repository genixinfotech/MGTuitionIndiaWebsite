import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { useAuth } from '@/context/AuthContext'
import { site } from '@/lib/site'

export function SignUpPage() {
  const { user, loading, signup, homePath } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'confirm'>('idle')
  const [error, setError] = useState('')

  if (loading) return null
  if (user) {
    return <Navigate to={homePath} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      const result = await signup(name, email, password)
      if (result.needsConfirmation) {
        setStatus('confirm')
        return
      }
      navigate(homePath, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account. Please try again.')
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
                Create your account
              </h2>
              <p className="mt-2 text-sm text-charcoal/55">Sign up for the {site.brand} portal.</p>

              {status === 'confirm' ? (
                <p className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Check your inbox to confirm the account, then sign in.
                </p>
              ) : (
              <form onSubmit={onSubmit} className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                    Full name
                  </span>
                  <span className="relative block">
                    <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center text-crimson">
                      <User className="h-4 w-4" strokeWidth={2.25} />
                    </span>
                    <input
                      required
                      autoComplete="name"
                      className="input-field pl-11"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </span>
                </label>

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
                      autoComplete="new-password"
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

                {error ? (
                  <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                    {error}
                  </p>
                ) : null}

                <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
              )}

              <p className="mt-6 text-center text-sm text-charcoal/50">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-crimson hover:text-crimson-dark">
                  Sign in
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
