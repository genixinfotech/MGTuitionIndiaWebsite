import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const KINDS = new Set(['trial', 'contact', 'tutor'])
const MAX_BODY_BYTES = 50_000
const LOGO_CID = 'mgtuition-logo'
const LOGO_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'images',
  'mg-tuition-logo.png',
)
const LOGO_BASE64 = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH).toString('base64') : ''

export function normalizeZeptoUrl(url = '') {
  const trimmed = url.trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  if (trimmed.endsWith('/v1.1/email')) return trimmed
  return `${trimmed}/v1.1/email`
}

export function zeptoAuthHeader(token = '') {
  const value = token.trim()
  if (!value) return ''
  if (/^zoho-enczapikey\s+/i.test(value)) return value
  return `Zoho-enczapikey ${value}`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function fieldCard(label, value) {
  if (!value) return ''
  return `<tr>
    <td style="padding:0 0 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td style="padding:14px 16px;background:#faf6f6;border:1px solid #f0e4e4;border-left:4px solid #cc0000;border-radius:10px;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#cc0000;">${escapeHtml(label)}</p>
            <p style="margin:0;font-size:16px;line-height:1.45;font-weight:600;color:#2d2d2d;">${escapeHtml(value).replaceAll('\n', '<br/>')}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

function textLines(pairs) {
  return pairs
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n')
}

function wrapHtml({ eyebrow, title, intro, rowsHtml, note }) {
  const logo = LOGO_BASE64
    ? `<img src="cid:${LOGO_CID}" alt="MG Tuition" width="168" style="display:block;margin:0 auto;width:168px;max-width:70%;height:auto;border:0;" />`
    : `<p style="margin:0;font-size:22px;font-weight:800;color:#cc0000;letter-spacing:-0.02em;">MG Tuition</p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f3ecec;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ecec;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #ead9d9;font-family:Arial,Helvetica,sans-serif;">
          <tr>
            <td align="center" style="padding:32px 32px 20px;background:#ffffff;">
              ${logo}
            </td>
          </tr>
          <tr>
            <td style="height:5px;line-height:5px;font-size:0;background:linear-gradient(90deg,#cc0000,#e63946,#8b0000);">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;background:#ffffff;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#cc0000;">${escapeHtml(eyebrow)}</p>
              <h1 style="margin:0 0 10px;font-size:26px;line-height:1.25;color:#2d2d2d;font-weight:800;">${escapeHtml(title)}</h1>
              <p style="margin:0;font-size:15px;line-height:1.55;color:#6b5f5f;">${escapeHtml(intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsHtml}</table>
            </td>
          </tr>
          ${
            note
              ? `<tr>
            <td style="padding:8px 32px 28px;">
              <p style="margin:0;font-size:13px;line-height:1.55;color:#8a7d7d;">${escapeHtml(note)}</p>
            </td>
          </tr>`
              : ''
          }
          <tr>
            <td style="padding:22px 32px;background:#120608;color:#ffffff;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#ffffff;">MG Tuition India</p>
              <p style="margin:0 0 10px;font-size:12px;line-height:1.5;color:#f4c7c7;">Small-batch live tuition for CBSE, ICSE &amp; Kerala State Board · IdealMG Educare LLP</p>
              <p style="margin:0;font-size:11px;line-height:1.6;color:#c9b4b4;">This is a transactional notification from a website form, not a marketing email. Details are used only to respond to this enquiry and are not sold to third parties.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function staffPairs(kind, data) {
  if (kind === 'trial') {
    return [
      ['Name', data.name],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Board', data.board],
      ['Plan', data.plan],
      ['Referral', data.referral],
      ['Message', data.message],
    ]
  }
  if (kind === 'contact') {
    return [
      ['Name', data.name],
      ['Email', data.email],
      ['Phone', data.phone],
      ['Message', data.message],
    ]
  }
  return [
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Subjects', data.subjects],
    ['Experience', data.experience],
    ['Message', data.message],
  ]
}

function buildStaffEmail(kind, data = {}) {
  const name = data.name || 'Someone'
  const pairs = staffPairs(kind, data)
  const rowsHtml = pairs.map(([label, value]) => fieldCard(label, value)).join('')

  if (kind === 'trial') {
    return {
      subject: `Free Assessment Request — ${name}`,
      textbody: textLines(pairs),
      htmlbody: wrapHtml({
        eyebrow: 'Free assessment',
        title: 'New assessment request',
        intro: `${name} submitted a free assessment enquiry from the MG Tuition India website.`,
        rowsHtml,
        note: 'Reply directly to this email to reach the person who submitted the form.',
      }),
      replyTo: { address: data.email, name: data.name },
    }
  }

  if (kind === 'contact') {
    return {
      subject: `Contact — ${name}`,
      textbody: textLines(pairs),
      htmlbody: wrapHtml({
        eyebrow: 'Website contact',
        title: 'New message received',
        intro: `${name} sent a message from the MG Tuition India contact form.`,
        rowsHtml,
        note: 'Reply directly to this email to reach the person who submitted the form.',
      }),
      replyTo: { address: data.email, name: data.name },
    }
  }

  return {
    subject: `Tutor Application — ${name}`,
    textbody: textLines(pairs),
    htmlbody: wrapHtml({
      eyebrow: 'Careers',
      title: 'New tutor application',
      intro: `${name} applied to teach with MG Tuition India.`,
      rowsHtml,
      note: 'Reply directly to this email to reach the applicant.',
    }),
    replyTo: { address: data.email, name: data.name },
  }
}

function buildAckEmail(kind, data = {}) {
  const name = data.name || 'there'
  const pairs = staffPairs(kind, data)
  const rowsHtml = pairs.map(([label, value]) => fieldCard(label, value)).join('')
  const note = 'If you need to add anything, just reply to this email and our team will get it.'

  if (kind === 'trial') {
    return {
      subject: 'We received your free assessment request — MG Tuition India',
      textbody: `Hi ${name},\n\nThank you for requesting a free assessment with MG Tuition India. Our team will review your details and contact you shortly.\n\n${textLines(pairs)}\n\n${note}`,
      htmlbody: wrapHtml({
        eyebrow: 'Thank you',
        title: 'Your assessment request is in',
        intro: `Hi ${name}, thanks for requesting a free assessment with MG Tuition India. A member of our team will review your details and get in touch shortly.`,
        rowsHtml,
        note,
      }),
    }
  }

  if (kind === 'contact') {
    return {
      subject: 'We received your message — MG Tuition India',
      textbody: `Hi ${name},\n\nThank you for contacting MG Tuition India. We have received your message and will get back to you shortly.\n\n${textLines(pairs)}\n\n${note}`,
      htmlbody: wrapHtml({
        eyebrow: 'Thank you',
        title: 'We have received your message',
        intro: `Hi ${name}, thanks for writing to MG Tuition India. Our team has your message and will reply as soon as we can.`,
        rowsHtml,
        note,
      }),
    }
  }

  return {
    subject: 'We received your tutor application — MG Tuition India',
    textbody: `Hi ${name},\n\nThank you for applying to teach with MG Tuition India. Our team will review your application and get back to you within a few working days.\n\n${textLines(pairs)}\n\n${note}`,
    htmlbody: wrapHtml({
      eyebrow: 'Thank you',
      title: 'Your application is in',
      intro: `Hi ${name}, thanks for applying to teach with MG Tuition India. Our team will review your application and get back to you within a few working days.`,
      rowsHtml,
      note,
    }),
  }
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function logoImages() {
  if (!LOGO_BASE64) return undefined
  return [
    {
      mime_type: 'image/png',
      content: LOGO_BASE64,
      name: 'mg-tuition-logo.png',
      cid: LOGO_CID,
    },
  ]
}

async function postZeptoEmail(url, authorization, payload) {
  const bodyPayload = { ...payload }
  const images = logoImages()
  if (images) bodyPayload.inline_images = images

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(bodyPayload),
  })

  const body = await response.text()
  if (!response.ok) {
    throw new Error(zeptoErrorMessage(body, response.status))
  }
}

export async function sendZeptoMail(env, { kind, data }) {
  if (!KINDS.has(kind)) {
    throw new Error('Unknown form type.')
  }

  const url = normalizeZeptoUrl(env.ZEPTOMAIL_URL)
  const authorization = zeptoAuthHeader(env.ZEPTOMAIL_TOKEN)
  const fromAddress = env.ZEPTOMAIL_FROM_ADDRESS?.trim()
  const toAddress = env.ZEPTOMAIL_TO_ADDRESS?.trim() || fromAddress

  if (!url || !authorization || !fromAddress || !toAddress) {
    throw new Error('ZeptoMail is not configured. Add URL and token to .env.')
  }

  const staff = buildStaffEmail(kind, data)
  await postZeptoEmail(url, authorization, {
    from: {
      address: fromAddress,
      name: env.ZEPTOMAIL_FROM_NAME?.trim() || 'MG Tuition India',
    },
    to: [
      {
        email_address: {
          address: toAddress,
          name: env.ZEPTOMAIL_TO_NAME?.trim() || 'MG Tuition India',
        },
      },
    ],
    subject: staff.subject,
    htmlbody: staff.htmlbody,
    textbody: staff.textbody,
    reply_to: staff.replyTo?.address
      ? [{ address: staff.replyTo.address, name: staff.replyTo.name || staff.replyTo.address }]
      : undefined,
  })

  const submitterEmail = data.email?.trim()
  if (isEmail(submitterEmail)) {
    const ack = buildAckEmail(kind, data)
    await postZeptoEmail(url, authorization, {
      from: {
        address: fromAddress,
        name: env.ZEPTOMAIL_FROM_NAME?.trim() || 'MG Tuition India',
      },
      to: [
        {
          email_address: {
            address: submitterEmail,
            name: data.name || submitterEmail,
          },
        },
      ],
      subject: ack.subject,
      htmlbody: ack.htmlbody,
      textbody: ack.textbody,
      reply_to: [{ address: toAddress, name: env.ZEPTOMAIL_TO_NAME?.trim() || 'MG Tuition India' }],
    })
  }
}

function zeptoErrorMessage(body, status) {
  try {
    const parsed = JSON.parse(body)
    const details = parsed?.error?.details
    if (Array.isArray(details) && details.length) {
      const parts = details
        .map((item) => {
          if (item?.code === 'SM_111') {
            const address = item.target_value ? ` (${item.target_value})` : ''
            return `Sender address is not verified in your ZeptoMail Agent${address}. Verify that domain under Mail Agents → Domains, then use it as ZEPTOMAIL_FROM_ADDRESS.`
          }
          if (item?.code === 'SERR_157') {
            return 'The ZeptoMail send-mail token is invalid. Copy it again from Agents → SMTP/API.'
          }
          if (item?.code === 'SERR_156') {
            return 'This computer’s IP is not on the ZeptoMail allowed-IP list. Add it in Agent settings or turn off IP restriction while testing locally.'
          }
          return item?.message
        })
        .filter(Boolean)
      if (parts.length) return parts.join(' ')
    }
    if (parsed?.error?.message && parsed.error.message !== 'Access Denied') {
      return parsed.error.message
    }
    if (parsed?.message) return parsed.message
  } catch {
    // fall through
  }
  if (body && !body.trim().startsWith('<')) return body.slice(0, 280)
  return `ZeptoMail rejected the request (${status}).`
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request too large.'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        reject(new Error('Invalid JSON.'))
      }
    })
    req.on('error', reject)
  })
}

export function createEmailMiddleware(env) {
  return async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method === 'GET') {
      const configured = Boolean(
        normalizeZeptoUrl(env.ZEPTOMAIL_URL) &&
          zeptoAuthHeader(env.ZEPTOMAIL_TOKEN) &&
          env.ZEPTOMAIL_FROM_ADDRESS?.trim(),
      )
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true, configured }))
      return
    }

    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Allow', 'GET, POST')
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Method not allowed.' }))
      return
    }

    try {
      const body = await readJson(req)
      await sendZeptoMail(env, body)
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true }))
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to send email.' }))
    }
  }
}
