import { site } from './site'

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

  if (!response.ok) {
    let message = `Unable to send your message to ${site.email}. Please try again.`
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) message = payload.error
    } catch {
      // keep fallback
    }
    throw new Error(message)
  }

  return { ok: true }
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
