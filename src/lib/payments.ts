import { getRegion, getTuitionConfig } from '@/lib/region'

export type PaymentProvider = 'stripe' | 'razorpay' | 'manual'

export function getPaymentProvider(): PaymentProvider {
  if (typeof window !== 'undefined') {
    const runtime = window.__MG_PUBLIC_CONFIG__?.paymentProvider
    if (runtime === 'stripe' || runtime === 'razorpay' || runtime === 'manual') {
      return runtime
    }
  }
  return getRegion() === 'GCC' ? 'stripe' : 'manual'
}

export function isCardCheckoutEnabled() {
  if (typeof window !== 'undefined') {
    const flagged = window.__MG_PUBLIC_CONFIG__?.cardCheckoutEnabled
    if (typeof flagged === 'boolean') return flagged
  }
  return getPaymentProvider() === 'stripe'
}

export function paymentCurrency() {
  return getTuitionConfig().currency
}

export function toMinorUnits(amount: number, currency = paymentCurrency()) {
  return Math.round(amount * (currency === 'USD' || currency === 'INR' ? 100 : 100))
}
