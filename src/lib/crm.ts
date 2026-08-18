import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { EnquiryKind } from '@/lib/database.types'

export async function recordEnquiry(input: {
  kind: EnquiryKind
  name: string
  email: string
  phone?: string
  payload?: Record<string, string>
}) {
  if (!isSupabaseConfigured) return
  try {
    const supabase = getSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    await supabase.from('enquiries').insert({
      kind: input.kind,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      payload: input.payload ?? {},
      user_id: session?.user.id ?? null,
    })
  } catch {
    // Email is the source of truth; CRM capture is best-effort.
  }
}
