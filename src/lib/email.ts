import { site } from './site'
import { recordEnquiry } from './crm'

export type TrialPayload = {
  name: string
  email: string
  phone: string
  board: string
  plan?: string
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
    const fields = data as Record<string, string>
    void recordEnquiry({
      kind,
      name: fields.name ?? '',
      email: fields.email ?? '',
      phone: fields.phone,
      payload: Object.fromEntries(
        Object.entries(fields)
          .filter(([, value]) => typeof value === 'string' && value)
          .map(([key, value]) => [key, String(value)]),
      ),
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
