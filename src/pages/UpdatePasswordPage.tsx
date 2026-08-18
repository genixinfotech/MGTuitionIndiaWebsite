import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { HeroSection } from '@/components/sections/HeroSection'
import { useAuth } from '@/context/AuthContext'

export function UpdatePasswordPage() {
  const { user, loading, updatePassword, homePath } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const [error, setError] = useState('')

  if (!loading && !user) {
    return <Navigate to="/login" replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    try {
      await updatePassword(password)
      navigate(homePath, { replace: true })
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Unable to update password.')
    }
  }

  return (
    <PageShell>
      <HeroSection
        aside={
          <div className="w-full">
            <div className="rounded-[28px] border border-white/20 bg-white p-7 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)] md:p-9">
              <h2 className="text-2xl font-extrabold tracking-tight text-charcoal md:text-3xl">
                Choose a new password
              </h2>
              <p className="mt-2 text-sm text-charcoal/55">Use at least 8 characters.</p>
              <form onSubmit={onSubmit} className="mt-7 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                    New password
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
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        }
      />
    </PageShell>
  )
}
