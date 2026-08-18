import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Lock, Mail, Phone, UserRound } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { UserAvatar } from '@/components/layout/AccountMenu'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth-paths'

export function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileHome />
    </RequireAuth>
  )
}

function ProfileHome() {
  const { user, profile, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name || user?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setFullName(profile?.full_name || user?.name || '')
    setPhone(profile?.phone || '')
  }, [profile, user?.name])

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
    <PageShell>
      <section className="relative overflow-hidden bg-[#f8fafc] px-4 pb-24 pt-36 md:px-6 md:pb-32 md:pt-40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-crimson/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-xl">
          <div className="rounded-[28px] border border-charcoal/[0.06] bg-white p-8 shadow-[0_24px_60px_-28px_rgba(45,45,45,0.3)] md:p-10">
            <div className="flex items-center gap-4">
              <UserAvatar name={fullName || user.name} src={user.avatarUrl} size="lg" />
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-charcoal">Profile</h1>
                <p className="mt-0.5 text-sm font-medium capitalize text-charcoal/45">
                  {roleLabel(user.role)}
                </p>
              </div>
            </div>

            <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
              <FormField label="Name" icon={UserRound}>
                <input
                  required
                  className={fieldClass(true)}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </FormField>
              <FormField label="Email" icon={Mail}>
                <input readOnly className={`${fieldClass(true)} bg-[#f8fafc] text-charcoal/60`} value={user.email} />
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
                <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                  {error}
                </p>
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
          </div>
        </div>
      </section>
    </PageShell>
  )
}
