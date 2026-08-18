import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type PublicConfig = {
  region?: string
  supabaseUrl?: string
  supabaseKey?: string
}

declare global {
  interface Window {
    __MG_PUBLIC_CONFIG__?: PublicConfig
  }
}

function readSupabaseConfig() {
  const runtime =
    typeof window !== 'undefined' ? window.__MG_PUBLIC_CONFIG__ : undefined
  return {
    url: (runtime?.supabaseUrl || import.meta.env.VITE_SUPABASE_URL || '').trim(),
    publishableKey: (
      runtime?.supabaseKey || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
    ).trim(),
  }
}

export function isSupabaseConfigured() {
  const { url, publishableKey } = readSupabaseConfig()
  return Boolean(url && publishableKey)
}

let client: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  const { url, publishableKey } = readSupabaseConfig()
  if (!url || !publishableKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the server environment (Plesk custom env vars), then restart the app.',
    )
  }
  if (!client) {
    client = createClient<Database>(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}

export function authRedirectTo(path: string) {
  return `${window.location.origin}${path}`
}
