/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_REGION?: string
  readonly Region?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __MG_PUBLIC_CONFIG__?: {
    region?: string
    supabaseUrl?: string
    supabaseKey?: string
  }
}
