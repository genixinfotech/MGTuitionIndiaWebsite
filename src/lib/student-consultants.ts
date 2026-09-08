import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

export type StudentConsultantContact = Pick<Profile, 'id' | 'full_name' | 'email' | 'phone'>

export async function listStudentConsultants() {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('role', 'student-consultant')
    .order('full_name')

  if (error) throw new Error(error.message || 'Unable to load student consultants.')
  return (data ?? []) as StudentConsultantContact[]
}

export function whatsappDigits(phone?: string | null) {
  return (phone ?? '').replace(/\D/g, '')
}

export function consultantWhatsappUrl(
  consultant: Pick<StudentConsultantContact, 'full_name' | 'phone'>,
  message: string,
  fallbackNumber?: string,
) {
  const digits = whatsappDigits(consultant.phone) || fallbackNumber || ''
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
