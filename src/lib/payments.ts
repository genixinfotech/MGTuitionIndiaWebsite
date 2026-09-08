import { getRegion, getTuitionConfig } from '@/lib/region'

export type PaymentProvider = 'stripe' | 'razorpay' | 'manual'

export type TuitionPaymentReceipt = {
  receiptNumber: string
  transactionId: string | null
  sessionId: string | null
  paidAt: string
  amount: number
  currency: string
  studentName: string
  parentEmail: string | null
  subjects: string[]
  renewal: boolean
  provider: PaymentProvider
}

export function receiptNumberForPayment(id: number) {
  return `MGT-${String(id).padStart(6, '0')}`
}

export function formatReceiptAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatReceiptDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

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
