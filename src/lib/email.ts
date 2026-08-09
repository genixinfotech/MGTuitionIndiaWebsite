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

function buildMailto(subject: string, body: string) {
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Opens a prefilled mailto — replace with a server endpoint when ready. */
export async function submitTrial(data: TrialPayload): Promise<{ ok: true }> {
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Board: ${data.board}`,
    data.plan ? `Plan: ${data.plan}` : null,
    data.referral ? `Referral: ${data.referral}` : null,
    data.message ? `Message: ${data.message}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  window.location.href = buildMailto('Free Trial Request — MG Tuition India', body)
  return { ok: true }
}

export async function submitContact(data: ContactPayload): Promise<{ ok: true }> {
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Message: ${data.message}`,
  ].join('\n')

  window.location.href = buildMailto('Contact — MG Tuition India', body)
  return { ok: true }
}

export async function submitTutor(data: TutorPayload): Promise<{ ok: true }> {
  const body = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Subjects: ${data.subjects}`,
    `Experience: ${data.experience}`,
    data.message ? `Message: ${data.message}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  window.location.href = buildMailto('Tutor Application — MG Tuition India', body)
  return { ok: true }
}
