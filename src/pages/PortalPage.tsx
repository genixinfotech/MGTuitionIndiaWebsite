import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, LogOut, Sparkles } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { useAuth } from '@/context/AuthContext'
import { useTrial } from '@/context/TrialContext'
import { site } from '@/lib/site'

export function PortalPage() {
  const { user, logout } = useAuth()
  const { openTrial } = useTrial()
  const navigate = useNavigate()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  function onLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-[#f8fafc] px-4 pb-24 pt-36 md:px-6 md:pb-32 md:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-crimson/10 blur-[100px]" />
          <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-indigo-400/10 blur-[90px]" />
        </div>

        <div className="relative mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-charcoal/[0.06] bg-white p-8 shadow-[0_24px_60px_-28px_rgba(45,45,45,0.3)] md:p-10"
          >
            <p className="section-eyebrow mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Portal
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-charcoal md:text-4xl">
              Welcome, {user.name}
            </h1>
            <p className="mt-3 text-charcoal/55">
              You&apos;re signed in as <span className="font-semibold text-charcoal">{user.email}</span>.
              Schedules, notes, and progress reports will appear here as your batches go live.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-charcoal/[0.06] bg-[#f8fafc] p-5">
                <Calendar className="h-5 w-5 text-crimson" />
                <p className="mt-3 font-semibold text-charcoal">Upcoming sessions</p>
                <p className="mt-1 text-sm text-charcoal/50">No classes scheduled yet.</p>
              </div>
              <div className="rounded-2xl border border-charcoal/[0.06] bg-[#f8fafc] p-5">
                <Sparkles className="h-5 w-5 text-crimson" />
                <p className="mt-3 font-semibold text-charcoal">Get started</p>
                <p className="mt-1 text-sm text-charcoal/50">
                  Book a free assessment and we&apos;ll match a tutor.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => openTrial()} className="btn-primary">
                {site.assessmentCta}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/15 px-6 py-3 text-sm font-semibold text-charcoal/70 transition-colors hover:border-crimson/30 hover:text-crimson"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </PageShell>
  )
}
