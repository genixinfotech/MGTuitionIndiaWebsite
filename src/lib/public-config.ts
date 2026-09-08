import { resetRegionCache } from '@/lib/region'

declare global {
  interface Window {
    __MG_PUBLIC_CONFIG__?: {
      region?: string
      supabaseUrl?: string
      supabaseKey?: string
      paymentProvider?: 'stripe' | 'razorpay' | 'manual'
      cardCheckoutEnabled?: boolean
    }
  }
}

/** Load region + Supabase from the server when HTML injection is missing (e.g. static dist). */
export async function ensurePublicConfig() {
  if (typeof window === 'undefined') return
  const current = window.__MG_PUBLIC_CONFIG__
  if (current?.region && typeof current.cardCheckoutEnabled === 'boolean') return

  try {
    const res = await fetch('/api/public-config')
    if (!res.ok) return
    const data = (await res.json()) as {
      region?: string
      supabaseUrl?: string
      supabaseKey?: string
      paymentProvider?: 'stripe' | 'razorpay' | 'manual'
      cardCheckoutEnabled?: boolean
    }
    if (data.region || data.supabaseUrl || data.supabaseKey || data.paymentProvider) {
      window.__MG_PUBLIC_CONFIG__ = {
        ...window.__MG_PUBLIC_CONFIG__,
        region: data.region,
        supabaseUrl: data.supabaseUrl,
        supabaseKey: data.supabaseKey,
        paymentProvider: data.paymentProvider,
        cardCheckoutEnabled: data.cardCheckoutEnabled,
      }
      resetRegionCache()
    }
  } catch {
    // API unavailable — fall back to build-time VITE_REGION.
  }
}
