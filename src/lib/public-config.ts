declare global {
  interface Window {
    __MG_PUBLIC_CONFIG__?: {
      region?: string
      supabaseUrl?: string
      supabaseKey?: string
    }
  }
}

/** Load region + Supabase from the server when HTML injection is missing (e.g. static dist). */
export async function ensurePublicConfig() {
  if (typeof window === 'undefined') return
  if (window.__MG_PUBLIC_CONFIG__?.region) return

  try {
    const res = await fetch('/api/public-config')
    if (!res.ok) return
    const data = (await res.json()) as {
      region?: string
      supabaseUrl?: string
      supabaseKey?: string
    }
    if (data.region || data.supabaseUrl || data.supabaseKey) {
      window.__MG_PUBLIC_CONFIG__ = {
        ...window.__MG_PUBLIC_CONFIG__,
        region: data.region,
        supabaseUrl: data.supabaseUrl,
        supabaseKey: data.supabaseKey,
      }
    }
  } catch {
    // API unavailable — fall back to build-time VITE_REGION.
  }
}
