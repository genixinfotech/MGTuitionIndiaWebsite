import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

export type StaffOption = Pick<Profile, 'id' | 'full_name' | 'email'>

type QualityManagerRow = {
  id: string
  profiles: Pick<Profile, 'id' | 'full_name' | 'email'> | Pick<Profile, 'id' | 'full_name' | 'email'>[] | null
}

export async function listQualityManagers() {
  const { data, error } = await getSupabase()
    .from('quality_managers')
    .select('id, profiles ( id, full_name, email )')

  if (error) throw new Error(error.message || 'Unable to load quality managers.')

  return ((data ?? []) as QualityManagerRow[])
    .map((row) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
      return profile ?? { id: row.id, full_name: null, email: '' }
    })
    .sort((a, b) => (a.full_name || a.email).localeCompare(b.full_name || b.email, 'en-IN')) as StaffOption[]
}
