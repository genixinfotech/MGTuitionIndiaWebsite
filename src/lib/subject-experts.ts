import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

export type SubjectExpertOption = Pick<Profile, 'id' | 'full_name' | 'email'>

export async function listSubjectExperts() {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'subject-expert')
    .order('full_name')

  if (error) throw new Error(error.message || 'Unable to load subject experts.')
  return (data ?? []) as SubjectExpertOption[]
}
