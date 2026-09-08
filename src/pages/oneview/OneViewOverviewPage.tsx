import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ClipboardCheck,
  GraduationCap,
  Inbox,
  Loader2,
  UserRound,
  Users,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth-paths'
import { getSupabase } from '@/lib/supabase'
import type { Enquiry, Profile } from '@/lib/database.types'

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OneViewOverviewPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [trialEnquiries, setTrialEnquiries] = useState<Enquiry[]>([])
  const [studentCount, setStudentCount] = useState(0)
  const [parentCount, setParentCount] = useState(0)
  const [tutorCount, setTutorCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const supabase = getSupabase()
        const [enquiryRes, trialEnquiryRes, profileRes, studentRes, parentRes, tutorRes] = await Promise.all([
          supabase.from('enquiries').select('*').eq('kind', 'contact').order('created_at', { ascending: false }).limit(8),
          supabase.from('enquiries').select('*').eq('kind', 'trial').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(8),
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
          supabase.from('tutors').select('id', { count: 'exact', head: true }),
        ])

        if (cancelled) return

        if (enquiryRes.error || trialEnquiryRes.error || profileRes.error || studentRes.error || parentRes.error || tutorRes.error) {
          setError(
            enquiryRes.error?.message ||
              trialEnquiryRes.error?.message ||
              profileRes.error?.message ||
              studentRes.error?.message ||
              parentRes.error?.message ||
              tutorRes.error?.message ||
              'Unable to load overview.',
          )
        } else {
          setEnquiries((enquiryRes.data ?? []) as Enquiry[])
          setTrialEnquiries((trialEnquiryRes.data ?? []) as Enquiry[])
          setProfiles((profileRes.data ?? []) as Profile[])
          setStudentCount(studentRes.count ?? 0)
          setParentCount(parentRes.count ?? 0)
          setTutorCount(tutorRes.count ?? 0)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load overview.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const newEnquiries = useMemo(
    () => enquiries.filter((row) => row.status === 'new').length,
    [enquiries],
  )
  const openTrialEnquiries = useMemo(
    () => trialEnquiries.filter((row) => row.status === 'new' || row.status === 'contacted').length,
    [trialEnquiries],
  )

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] p-6 text-white md:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Superadmin view</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            OneView is your state-of-the-art operations hub.
          </p>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Inbox}
          label="New enquiries"
          value={loading ? '—' : String(newEnquiries)}
          href="/oneview/enquiries"
        />
        <MetricCard
          icon={UserRound}
          label="Parent accounts"
          value={loading ? '—' : String(parentCount)}
          href="/oneview/parents"
        />
        <MetricCard
          icon={GraduationCap}
          label="Students"
          value={loading ? '—' : String(studentCount)}
          href="/oneview/students"
        />
        <MetricCard
          icon={ClipboardCheck}
          label="Open trial enquiries"
          value={loading ? '—' : String(openTrialEnquiries)}
          href="/oneview/assessments/web"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Recent general enquiries" action={{ label: 'View all', href: '/oneview/enquiries' }}>
          {loading ? (
            <LoadingRows />
          ) : enquiries.length === 0 ? (
            <EmptyState message="No enquiries yet." />
          ) : (
            <div className="divide-y divide-charcoal/[0.05]">
              {enquiries.map((row) => (
                <div key={row.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{row.name}</p>
                    <p className="text-sm text-charcoal/50">{row.email}</p>
                  </div>
                  <div className="text-right">
                    <StatusPill value={row.status} />
                    <p className="mt-1 text-xs text-charcoal/40">{formatWhen(row.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Team snapshot" action={{ label: 'Users', href: '/oneview/users' }}>
            {loading ? (
              <LoadingRows />
            ) : (
              <div className="space-y-3 px-5 py-4">
                <MiniStat icon={Users} label="Tutors on file" value={String(tutorCount)} />
                <MiniStat icon={UserRound} label="Recent sign-ups" value={String(profiles.length)} />
              </div>
            )}
          </Panel>

          <Panel title="Latest accounts">
            {loading ? (
              <LoadingRows />
            ) : profiles.length === 0 ? (
              <EmptyState message="No accounts yet." />
            ) : (
              <ul className="divide-y divide-charcoal/[0.05]">
                {profiles.slice(0, 5).map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.full_name || 'Unnamed'}</p>
                      <p className="truncate text-sm text-charcoal/45">{row.email}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal/55">
                      {roleLabel(row.role)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Inbox
  label: string
  value: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-charcoal/[0.06] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-crimson/15 hover:shadow-[0_16px_40px_-28px_rgba(204,0,0,0.45)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-crimson/[0.08] p-2.5 text-crimson">
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-charcoal/25 transition-colors group-hover:text-crimson" />
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium text-charcoal/50">{label}</p>
    </Link>
  )
}

function Panel({
  title,
  action,
  children,
}: {
  title: string
  action?: { label: string; href: string }
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-charcoal/[0.06] px-5 py-4">
        <h3 className="font-bold">{title}</h3>
        {action ? (
          <Link to={action.href} className="text-sm font-semibold text-crimson hover:text-crimson-dark">
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function StatusPill({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal/60">
      {value}
    </span>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#faf7f7] px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-crimson" />
        <span className="text-sm font-medium text-charcoal/60">{label}</span>
      </div>
      <span className="text-lg font-extrabold">{value}</span>
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="flex items-center justify-center px-5 py-10 text-charcoal/45">
      <Loader2 className="h-5 w-5 animate-spin text-crimson" />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return <p className="px-5 py-8 text-sm text-charcoal/50">{message}</p>
}
