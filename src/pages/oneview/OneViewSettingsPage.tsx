import { useEffect, useState } from 'react'
import { Check, CreditCard, Loader2, Pencil, Plus, Repeat, Settings, Shield, Trash2, X } from 'lucide-react'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { useAuth } from '@/context/AuthContext'
import { getRegion } from '@/lib/region'
import { dashedRole } from '@/lib/roles'
import {
  isPaymentModel,
  loadAppSettings,
  savePaymentModel,
  type PaymentModel,
} from '@/lib/app-settings'
import {
  createUserRole,
  deleteUserRole,
  listUserRoles,
  normalizeRoleSlug,
  updateUserRole,
  type UserRole,
} from '@/lib/user-roles'

const gccModels: Array<{
  id: PaymentModel
  title: string
  gateway: string
  description: string
}> = [
  {
    id: 'one_time',
    title: 'Pay each month',
    gateway: 'Stripe Checkout · current model',
    description:
      'Parents pay in checkout whenever tuition is due. Mid-month joins are charged On Prorata Basis, then the full month from the next calendar month.',
  },
  {
    id: 'subscription',
    title: 'Stripe subscription',
    gateway: 'Stripe Billing · recurring',
    description:
      'Parents start a monthly Stripe subscription. The first month stays On Prorata Basis; Stripe then bills the full monthly fee automatically.',
  },
]

export function OneViewSettingsPage() {
  const { user } = useAuth()
  const region = getRegion()
  const isSuperadmin = dashedRole(user?.role) === 'superadmin'
  const [model, setModel] = useState<PaymentModel>('one_time')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)
  const [roleError, setRoleError] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [addingRole, setAddingRole] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [roleBusyId, setRoleBusyId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    void loadAppSettings()
      .then((settings) => {
        if (!cancelled) setModel(settings.payment_model)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load settings.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    void listUserRoles()
      .then((rows) => {
        if (!cancelled) setRoles(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setRoleError(err instanceof Error ? err.message : 'Unable to load user types.')
        }
      })
      .finally(() => {
        if (!cancelled) setRolesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function onSelect(next: PaymentModel) {
    if (!user?.id || next === model || saving) return
    const previous = model
    setModel(next)
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const updated = await savePaymentModel(next, user.id)
      setModel(updated.payment_model)
      setSaved(true)
    } catch (err) {
      setModel(previous)
      setError(err instanceof Error ? err.message : 'Unable to save this payment model.')
    } finally {
      setSaving(false)
    }
  }

  async function onAddRole() {
    if (addingRole) return
    setAddingRole(true)
    setRoleError('')
    try {
      const created = await createUserRole({ label: newLabel, slug: newSlug || newLabel })
      setRoles((current) => [...current, created].sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)))
      setNewLabel('')
      setNewSlug('')
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : 'Unable to add this user type.')
    } finally {
      setAddingRole(false)
    }
  }

  async function onSaveRole(id: number) {
    if (roleBusyId) return
    setRoleBusyId(id)
    setRoleError('')
    try {
      const updated = await updateUserRole(id, { label: editingLabel })
      setRoles((current) => current.map((row) => (row.id === id ? updated : row)))
      setEditingId(null)
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : 'Unable to update this user type.')
    } finally {
      setRoleBusyId(null)
    }
  }

  async function onDeleteRole(row: UserRole) {
    if (row.locked || roleBusyId) return
    if (!window.confirm(`Remove “${row.label}”? Users with this type must be reassigned first.`)) return
    setRoleBusyId(row.id)
    setRoleError('')
    try {
      await deleteUserRole(row.id)
      setRoles((current) => current.filter((item) => item.id !== row.id))
    } catch (err) {
      setRoleError(err instanceof Error ? err.message : 'Unable to remove this user type.')
    } finally {
      setRoleBusyId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Settings" icon={Settings} />

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">{error}</p>
      ) : null}
      {roleError ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">{roleError}</p>
      ) : null}

      <section className="rounded-2xl border border-charcoal/[0.06] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(45,45,45,0.45)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">Payments</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-charcoal">
              {region === 'GCC' ? 'GCC billing model' : 'India billing model'}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-charcoal/55">
              {region === 'GCC'
                ? 'Choose how parents pay for tuition on the GCC site. This applies the next time a parent opens checkout — no app restart needed.'
                : 'India collects fees by UPI. Parents pay remaining classes On Prorata Basis, then send the receipt to their student consultant.'}
            </p>
          </div>
          {saved && !saving ? (
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Check className="h-4 w-4" />
              Saved
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-charcoal/45">
            <Loader2 className="h-4 w-4 animate-spin text-crimson" />
            Loading payment settings…
          </div>
        ) : region === 'GCC' ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {gccModels.map((option) => {
              const selected = model === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (isPaymentModel(option.id)) void onSelect(option.id)
                  }}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    selected
                      ? 'border-crimson/30 bg-crimson/[0.04] ring-2 ring-crimson/20'
                      : 'border-charcoal/[0.08] bg-white hover:border-charcoal/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-crimson/[0.08] text-crimson">
                      {option.id === 'subscription' ? (
                        <Repeat className="h-4 w-4" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                    </span>
                    <span
                      className={`mt-1 inline-flex h-4 w-4 shrink-0 rounded-full border ${
                        selected ? 'border-crimson bg-crimson' : 'border-charcoal/25'
                      }`}
                    />
                  </div>
                  <p className="mt-3 font-extrabold text-charcoal">{option.title}</p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                    {option.gateway}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-charcoal/60">{option.description}</p>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-crimson/30 bg-crimson/[0.04] px-4 py-4">
              <p className="font-extrabold text-charcoal">Pay each month</p>
              <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-charcoal/40">
                UPI · current model
              </p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
                Parents pay remaining classes On Prorata Basis by UPI, then send the receipt to their
                student consultant.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-charcoal/[0.06] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(45,45,45,0.45)] md:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-crimson/[0.08] text-crimson">
            <Shield className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">User types</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-charcoal">Roles for Create user</h2>
            <p className="mt-1 max-w-2xl text-sm text-charcoal/55">
              These types appear in the Create user menu. Superadmins can add, rename, or remove them.
              New types are stored in system_users. Parent, tutor, student, and superadmin cannot be
              removed.
            </p>
          </div>
        </div>

        {rolesLoading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-charcoal/45">
            <Loader2 className="h-4 w-4 animate-spin text-crimson" />
            Loading user types…
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-charcoal/[0.08]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-charcoal/45">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((row) => (
                  <tr key={row.id} className="border-t border-charcoal/[0.06]">
                    <td className="px-4 py-3 font-semibold text-charcoal">
                      {editingId === row.id ? (
                        <input
                          className="w-full rounded-xl border border-charcoal/15 px-3 py-2 text-sm"
                          value={editingLabel}
                          onChange={(event) => setEditingLabel(event.target.value)}
                        />
                      ) : (
                        row.label
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-charcoal/55">{row.slug}</td>
                    <td className="px-4 py-3 text-charcoal/55">
                      {row.kind === 'account' ? 'Account' : 'System'}
                      {row.locked ? ' · required' : ''}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {!isSuperadmin ? (
                          <span className="text-xs text-charcoal/35">View only</span>
                        ) : editingId === row.id ? (
                          <>
                            <button
                              type="button"
                              disabled={roleBusyId === row.id}
                              onClick={() => void onSaveRole(row.id)}
                              className="rounded-full bg-charcoal px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/50"
                              aria-label="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(row.id)
                                setEditingLabel(row.label)
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/50 hover:text-crimson"
                              aria-label={`Edit ${row.label}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={row.locked || roleBusyId === row.id}
                              onClick={() => void onDeleteRole(row)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/50 hover:text-crimson disabled:opacity-30"
                              aria-label={`Remove ${row.label}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isSuperadmin ? (
          <form
            className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault()
              void onAddRole()
            }}
          >
            <input
              required
              className="rounded-xl border border-charcoal/15 px-3 py-2.5 text-sm"
              placeholder="Display name, e.g. HR Generalist"
              value={newLabel}
              onChange={(event) => {
                setNewLabel(event.target.value)
                setNewSlug(normalizeRoleSlug(event.target.value))
              }}
            />
            <input
              required
              className="rounded-xl border border-charcoal/15 px-3 py-2.5 font-mono text-sm"
              placeholder="slug, e.g. hr-generalist"
              value={newSlug}
              onChange={(event) => setNewSlug(normalizeRoleSlug(event.target.value))}
            />
            <button type="submit" disabled={addingRole} className="btn-primary whitespace-nowrap">
              {addingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add user type
            </button>
          </form>
        ) : null}
      </section>
    </div>
  )
}
