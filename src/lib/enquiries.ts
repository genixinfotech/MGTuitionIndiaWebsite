import { getSupabase } from '@/lib/supabase'
import type { Enquiry, EnquiryKind, EnquiryStatus } from '@/lib/database.types'

export const enquiryKinds: EnquiryKind[] = ['trial', 'contact', 'tutor']

export const enquiryKindLabels: Record<EnquiryKind, string> = {
  trial: 'Free trial',
  contact: 'General',
  tutor: 'Tutor applications',
}

export const enquiryStatuses: EnquiryStatus[] = ['new', 'contacted', 'enrolled', 'closed']

export const enquiryStatusLabels: Record<EnquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  enrolled: 'Enrolled',
  closed: 'Closed',
}

export async function listEnquiries(kind?: EnquiryKind) {
  let query = getSupabase().from('enquiries').select('*').order('created_at', { ascending: false })

  if (kind) {
    query = query.eq('kind', kind)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message || 'Unable to load enquiries.')
  return (data ?? []) as Enquiry[]
}

export async function updateEnquiryStatus(id: number, status: EnquiryStatus) {
  const { error } = await getSupabase().from('enquiries').update({ status }).eq('id', id)
  if (error) throw new Error(error.message || 'Unable to update enquiry status.')
}

export function enquiryDetailLines(row: Enquiry) {
  const payload = row.payload ?? {}

  if (row.kind === 'trial') {
    const studentsSummary = payload.students
      ? (() => {
          try {
            const students = JSON.parse(payload.students) as Array<{
              studentName?: string
              board?: string
              grade?: string
              subjects?: string[] | string
            }>
            if (!Array.isArray(students)) return null
            return students
              .map((student, index) => {
                const subjects = Array.isArray(student.subjects)
                  ? student.subjects.join(', ')
                  : student.subjects
                return `${index + 1}. ${student.studentName || 'Student'} — ${student.board || '—'}, ${student.grade || '—'} (${subjects || '—'})`
              })
              .join('; ')
          } catch {
            return payload.students
          }
        })()
      : null
    return [
      payload.parentName ? `Parent: ${payload.parentName}` : payload.name ? `Parent: ${payload.name}` : null,
      studentsSummary ? `Students: ${studentsSummary}` : null,
      payload.board ? `Syllabus: ${payload.board}` : null,
      payload.grade ? `Grade: ${payload.grade}` : payload.plan ? `Grade: ${payload.plan}` : null,
      payload.referral ? `Referral: ${payload.referral}` : null,
      payload.message || null,
    ].filter(Boolean) as string[]
  }

  if (row.kind === 'contact') {
    return [payload.message || null].filter(Boolean) as string[]
  }

  if (row.kind === 'tutor') {
    return [
      payload.subjects ? `Subjects: ${payload.subjects}` : null,
      payload.experience ? `Experience: ${payload.experience}` : null,
      payload.message || null,
    ].filter(Boolean) as string[]
  }

  return []
}

export function enquiryHaystack(row: Enquiry) {
  return [
    row.name,
    row.email,
    row.phone,
    row.status,
    ...enquiryDetailLines(row),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}
