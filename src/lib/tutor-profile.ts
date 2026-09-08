import { getSupabase } from '@/lib/supabase'
import type {
  TutorBankDetails,
  TutorPanDetails,
  TutorProfileDetails,
  TutorQualification,
  TutorSpecialization,
  TutorTeachingExperience,
} from '@/lib/database.types'

export type BankDetailsInput = {
  bank_name: string
  account_holder_name: string
  account_number: string
  ifsc_code: string
  branch: string
}

export type PanDetailsInput = {
  name_on_pan: string
  date_of_birth: string
  pan_number: string
}

export type SpecializationInput = {
  subject: string
  grade_range: string
}

export type TeachingExperienceInput = {
  organization: string
  role_title: string
  start_date: string
  end_date: string
}

export type QualificationInput = {
  degree_title: string
  institution: string
  year_from: string
  year_to: string
}

export function formatMonthYear(value: string | null | undefined) {
  if (!value) return ''
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed
    .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    .toUpperCase()
}

export function formatPanDate(value: string | null | undefined) {
  if (!value) return '—'
  const parsed = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatExperienceLine(row: TutorTeachingExperience) {
  const start = formatMonthYear(row.start_date)
  const end = formatMonthYear(row.end_date)
  const period =
    start && end ? ` (${start}-${end})` : start ? ` (${start})` : end ? ` (${end})` : ''
  return `${row.organization}, ${row.role_title}${period}`
}

export function formatQualificationYears(row: TutorQualification) {
  if (row.year_from && row.year_to) return `${row.year_from}-${row.year_to}`
  if (row.year_from) return String(row.year_from)
  if (row.year_to) return String(row.year_to)
  return ''
}

export function formatSpecializationLine(row: TutorSpecialization) {
  return `${row.subject} (${row.grade_range})`
}

async function requireTutorUserId() {
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Please sign in again to save your profile.')
  return user.id
}

export async function getTutorProfileDetails(tutorId: string): Promise<TutorProfileDetails> {
  const supabase = getSupabase()
  const [bankRes, panRes, specializationsRes, experienceRes, qualificationsRes] = await Promise.all([
    supabase.from('tutor_bank_details').select('*').eq('tutor_id', tutorId).maybeSingle(),
    supabase.from('tutor_pan_details').select('*').eq('tutor_id', tutorId).maybeSingle(),
    supabase
      .from('tutor_specializations')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    supabase
      .from('tutor_teaching_experience')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
    supabase
      .from('tutor_qualifications')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true }),
  ])

  const error =
    bankRes.error?.message ||
    panRes.error?.message ||
    specializationsRes.error?.message ||
    experienceRes.error?.message ||
    qualificationsRes.error?.message

  if (error) throw new Error(error)

  return {
    bank: (bankRes.data as TutorBankDetails | null) ?? null,
    pan: (panRes.data as TutorPanDetails | null) ?? null,
    specializations: (specializationsRes.data ?? []) as TutorSpecialization[],
    experience: (experienceRes.data ?? []) as TutorTeachingExperience[],
    qualifications: (qualificationsRes.data ?? []) as TutorQualification[],
  }
}

export async function upsertTutorBankDetails(input: BankDetailsInput) {
  const tutorId = await requireTutorUserId()
  const { data, error } = await getSupabase()
    .from('tutor_bank_details')
    .upsert(
      {
        tutor_id: tutorId,
        bank_name: input.bank_name.trim(),
        account_holder_name: input.account_holder_name.trim(),
        account_number: input.account_number.trim(),
        ifsc_code: input.ifsc_code.trim().toUpperCase(),
        branch: input.branch.trim(),
      },
      { onConflict: 'tutor_id' },
    )
    .select('*')
    .single()

  if (error) throw new Error(error.message || 'Unable to save bank details.')
  return data as TutorBankDetails
}

export async function upsertTutorPanDetails(input: PanDetailsInput) {
  const tutorId = await requireTutorUserId()
  const { data, error } = await getSupabase()
    .from('tutor_pan_details')
    .upsert(
      {
        tutor_id: tutorId,
        name_on_pan: input.name_on_pan.trim(),
        date_of_birth: input.date_of_birth,
        pan_number: input.pan_number.trim().toUpperCase(),
      },
      { onConflict: 'tutor_id' },
    )
    .select('*')
    .single()

  if (error) throw new Error(error.message || 'Unable to save PAN details.')
  return data as TutorPanDetails
}

export async function replaceTutorSpecializations(items: SpecializationInput[]) {
  const tutorId = await requireTutorUserId()
  const supabase = getSupabase()
  const { error: deleteError } = await supabase
    .from('tutor_specializations')
    .delete()
    .eq('tutor_id', tutorId)
  if (deleteError) throw new Error(deleteError.message || 'Unable to save profile details.')

  if (items.length === 0) return [] as TutorSpecialization[]

  const rows = items.map((item, index) => ({
    tutor_id: tutorId,
    subject: item.subject.trim(),
    grade_range: item.grade_range.trim(),
    sort_order: index,
  }))

  const { data, error } = await supabase.from('tutor_specializations').insert(rows).select('*')
  if (error) throw new Error(error.message || 'Unable to save profile details.')
  return (data ?? []) as TutorSpecialization[]
}

export async function replaceTutorTeachingExperience(items: TeachingExperienceInput[]) {
  const tutorId = await requireTutorUserId()
  const supabase = getSupabase()
  const { error: deleteError } = await supabase
    .from('tutor_teaching_experience')
    .delete()
    .eq('tutor_id', tutorId)
  if (deleteError) throw new Error(deleteError.message || 'Unable to save profile details.')

  if (items.length === 0) return [] as TutorTeachingExperience[]

  const rows = items.map((item, index) => ({
    tutor_id: tutorId,
    organization: item.organization.trim(),
    role_title: item.role_title.trim(),
    start_date: item.start_date || null,
    end_date: item.end_date || null,
    sort_order: index,
  }))

  const { data, error } = await supabase.from('tutor_teaching_experience').insert(rows).select('*')
  if (error) throw new Error(error.message || 'Unable to save profile details.')
  return (data ?? []) as TutorTeachingExperience[]
}

export async function replaceTutorQualifications(items: QualificationInput[]) {
  const tutorId = await requireTutorUserId()
  const supabase = getSupabase()
  const { error: deleteError } = await supabase
    .from('tutor_qualifications')
    .delete()
    .eq('tutor_id', tutorId)
  if (deleteError) throw new Error(deleteError.message || 'Unable to save profile details.')

  if (items.length === 0) return [] as TutorQualification[]

  const rows = items.map((item, index) => ({
    tutor_id: tutorId,
    degree_title: item.degree_title.trim(),
    institution: item.institution.trim(),
    year_from: item.year_from ? Number(item.year_from) : null,
    year_to: item.year_to ? Number(item.year_to) : null,
    sort_order: index,
  }))

  const { data, error } = await supabase.from('tutor_qualifications').insert(rows).select('*')
  if (error) throw new Error(error.message || 'Unable to save profile details.')
  return (data ?? []) as TutorQualification[]
}

export function hasBankDetails(bank: TutorBankDetails | null) {
  return Boolean(
    bank?.bank_name?.trim() ||
      bank?.account_holder_name?.trim() ||
      bank?.account_number?.trim() ||
      bank?.ifsc_code?.trim() ||
      bank?.branch?.trim(),
  )
}

export function hasPanDetails(pan: TutorPanDetails | null) {
  return Boolean(pan?.name_on_pan?.trim() || pan?.date_of_birth || pan?.pan_number?.trim())
}
