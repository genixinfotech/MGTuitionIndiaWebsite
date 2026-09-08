import { site } from './site'
import { recordEnquiry } from './crm'

export type TrialStudentPayload = {
  studentName: string
  board: string
  grade: string
  subjects: string[]
}

export type TrialPayload = {
  name: string
  parentName: string
  email: string
  phone: string
  students: TrialStudentPayload[]
  message?: string
  referral?: string
}

export type ContactPayload = {
  name: string
  email: string
  phone: string
  message: string
}

export type TutorPayload = {
  name: string
  email: string
  phone: string
  subjects: string
  experience: string
  message?: string
}

async function postForm(kind: 'trial' | 'contact' | 'tutor', data: object): Promise<{ ok: true }> {
  const response = await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ kind, data }),
  })

  const contentType = response.headers.get('content-type') ?? ''
  let payload: { ok?: boolean; error?: string } | null = null
  if (contentType.includes('application/json')) {
    try {
      payload = (await response.json()) as { ok?: boolean; error?: string }
    } catch {
      payload = null
    }
  }

  if (response.ok && payload?.ok) {
    const fields = data as Record<string, unknown>
    const enquiryPayload = Object.fromEntries(
      Object.entries(fields)
        .filter(([, value]) => {
          if (Array.isArray(value)) return value.length > 0
          return typeof value === 'string' && value
        })
        .map(([key, value]) => [
          key,
          key === 'students' && Array.isArray(value)
            ? JSON.stringify(value)
            : Array.isArray(value)
              ? value.join(', ')
              : String(value),
        ]),
    )
    void recordEnquiry({
      kind,
      name: String(fields.parentName ?? fields.name ?? ''),
      email: String(fields.email ?? ''),
      phone: typeof fields.phone === 'string' ? fields.phone : undefined,
      payload: enquiryPayload,
    })
    return { ok: true }
  }

  throw new Error(
    payload?.error ||
      (contentType.includes('application/json')
        ? `Unable to send your message to ${site.email}. Please try again.`
        : 'The email service is not running on this server. After building, start the site with npm start and keep a .env file next to server.mjs.'),
  )
}

export function submitTrial(data: TrialPayload) {
  return postForm('trial', data)
}

export function submitContact(data: ContactPayload) {
  return postForm('contact', data)
}

export function submitTutor(data: TutorPayload) {
  return postForm('tutor', data)
}
