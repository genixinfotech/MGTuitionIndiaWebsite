import { useEffect, useState } from 'react'
import { Check, CreditCard, Loader2, Repeat, Settings } from 'lucide-react'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { useAuth } from '@/context/AuthContext'
import { getRegion } from '@/lib/region'
import {
  isPaymentModel,
  loadAppSettings,
  savePaymentModel,
  type PaymentModel,
} from '@/lib/app-settings'

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
  const [model, setModel] = useState<PaymentModel>('one_time')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

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

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Settings" icon={Settings} />

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">{error}</p>
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
    </div>
  )
}
