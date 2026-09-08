import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Lock, Mail, Phone, UserRound } from 'lucide-react'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { UserAvatar } from '@/components/layout/AccountMenu'
import { TutorWorkSchedulePanel } from '@/components/tutor/TutorWorkSchedulePanel'
import { TutorProfessionalProfilePanel } from '@/components/tutor/TutorProfessionalProfilePanel'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth-paths'
import { normalizeRole } from '@/lib/roles'
import { getTutor } from '@/lib/tutors'

export function PortalProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || user?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const isTutor = normalizeRole(user?.role) === 'tutor'

  useEffect(() => {
    setFullName(profile?.full_name || user?.name || '')
    setPhone(profile?.phone || '')
  }, [profile, user?.name])

  useEffect(() => {
    if (!user?.id || !isTutor) return

    let cancelled = false

    async function loadTutorMeta() {
      try {
        const row = await getTutor(user!.id)
        if (!cancelled && row) setTimezone(row.tutor.timezone)
      } catch {
        /* schedule panel handles errors */
      }
    }

    void loadTutorMeta()
    return () => {
      cancelled = true
    }
  }, [isTutor, user?.id])

  if (!user) return null

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)
    setSaving(true)
    try {
      await updateProfile({ full_name: fullName, phone })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`mx-auto w-full space-y-5 ${isTutor ? 'max-w-[1600px]' : 'max-w-3xl'}`}>
      <DashboardPageHeader title="Profile" />

      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white p-6 md:p-8">
        <div className="flex items-center gap-4 border-b border-charcoal/[0.06] pb-6">
          <UserAvatar name={fullName || user.name} src={user.avatarUrl} size="lg" />
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-charcoal">{fullName || user.name}</h2>
            <p className="mt-0.5 text-sm font-medium capitalize text-charcoal/45">{roleLabel(user.role)}</p>
          </div>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <FormField label="Name" icon={UserRound}>
            <input
              required
              className={fieldClass(true)}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>
          <FormField label="Email" icon={Mail}>
            <input readOnly className={`${fieldClass(true)} bg-gray-50 text-charcoal/60`} value={user.email} />
          </FormField>
          <FormField label="Phone" icon={Phone}>
            <input
              type="tel"
              className={fieldClass(true)}
              placeholder="Optional"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>

          {error ? (
            <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">{error}</p>
          ) : null}
          {saved ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Profile saved.
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                'Save changes'
              )}
            </button>
            <Link
              to="/update-password"
              className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal/55 hover:text-crimson"
            >
              <Lock className="h-4 w-4" />
              Change password
            </Link>
          </div>
        </form>
      </section>

      {isTutor ? (
        <>
          <TutorWorkSchedulePanel tutorId={user.id} timezone={timezone} canEdit />
          <TutorProfessionalProfilePanel tutorId={user.id} canEdit />
        </>
      ) : null}
    </div>
  )
}
