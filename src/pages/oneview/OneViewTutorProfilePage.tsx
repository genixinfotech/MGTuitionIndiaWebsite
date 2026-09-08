import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Mail, Phone, UserRound } from 'lucide-react'
import { UserAvatar } from '@/components/layout/AccountMenu'
import { TutorWorkSchedulePanel } from '@/components/tutor/TutorWorkSchedulePanel'
import { TutorProfessionalProfilePanel } from '@/components/tutor/TutorProfessionalProfilePanel'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth-paths'
import { normalizeRole } from '@/lib/roles'
import { getTutor, type TutorProfile } from '@/lib/tutors'

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[#faf7f7] px-4 py-3.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal/45">{label}</p>
        <p className="mt-0.5 break-words font-medium text-charcoal">{value}</p>
      </div>
    </div>
  )
}

export function OneViewTutorProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>()
  const { user } = useAuth()
  const [tutor, setTutor] = useState<TutorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!tutorId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const row = await getTutor(tutorId!)
        if (!cancelled) setTutor(row)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load this tutor.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [tutorId])

  const displayName = tutor?.full_name?.trim() || 'Unnamed tutor'
  const canEditSchedule = Boolean(
    tutorId && user?.id === tutorId && normalizeRole(user.role) === 'tutor',
  )
  const canEditProfile = canEditSchedule

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <Link
        to="/oneview/tutors"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-charcoal/55 transition-colors hover:text-crimson"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tutors
      </Link>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-charcoal/[0.06] bg-white py-24">
          <Loader2 className="h-6 w-6 animate-spin text-crimson" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">{error}</p>
      ) : !tutor ? (
        <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-6 py-16 text-center">
          <p className="font-medium text-charcoal/60">Tutor not found.</p>
          <Link to="/oneview/tutors" className="mt-3 inline-block text-sm font-semibold text-crimson hover:text-crimson-dark">
            Return to tutors list
          </Link>
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-start gap-5 border-b border-charcoal/[0.06] pb-6">
              <UserAvatar name={displayName} size="lg" />
              <div className="min-w-0">
                <h2 className="text-2xl font-extrabold tracking-tight text-charcoal">{displayName}</h2>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-charcoal/45">
                  {roleLabel(tutor.role)}
                </p>
                <p className="mt-2 text-sm text-charcoal/50">
                  On file since {formatWhen(tutor.tutor.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <DetailRow icon={Mail} label="Email" value={tutor.email} />
              <DetailRow icon={Phone} label="Phone" value={tutor.phone?.trim() || '—'} />
              <DetailRow icon={UserRound} label="Account created" value={formatWhen(tutor.created_at)} />
              <DetailRow icon={UserRound} label="Last updated" value={formatWhen(tutor.updated_at)} />
            </div>
          </section>

          <TutorWorkSchedulePanel
            tutorId={tutor.id}
            timezone={tutor.tutor.timezone}
            canEdit={canEditSchedule}
          />

          <TutorProfessionalProfilePanel tutorId={tutor.id} canEdit={canEditProfile} />
        </>
      )}
    </div>
  )
}
