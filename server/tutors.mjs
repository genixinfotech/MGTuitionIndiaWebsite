import { createClient } from '@supabase/supabase-js'
import { isInternalRole, normalizeRole } from './roles.mjs'

const MAX_BODY_BYTES = 50_000

function supabaseUrl(env) {
  return (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim()
}

function publishableKey(env) {
  return (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || '').trim()
}

function serviceRoleKey(env) {
  return (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
}

function bearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
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

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function requestRoute(req) {
  const url = new URL(req.url || '/', 'http://local')
  const pathname = url.pathname.replace(/\/+$/, '') || '/'
  const apiPath = pathname.replace(/^\/api\/tutors/, '') || '/'
  return { url, route: apiPath }
}

async function authenticateInternalCaller(req, env) {
  const url = supabaseUrl(env)
  const anon = publishableKey(env)
  const service = serviceRoleKey(env)
  if (!url || !anon || !service) {
    const error = new Error(
      'Tutor accounts are not configured. Add SUPABASE_SERVICE_ROLE_KEY to the server .env (never prefix it with VITE_).',
    )
    error.status = 500
    throw error
  }

  const token = bearerToken(req)
  if (!token) {
    const error = new Error('Please sign in again to manage tutors.')
    error.status = 401
    throw error
  }

  const publicClient = createClient(url, anon)
  const {
    data: { user: caller },
    error: authError,
  } = await publicClient.auth.getUser(token)
  if (authError || !caller) {
    const error = new Error('Please sign in again to manage tutors.')
    error.status = 401
    throw error
  }

  const admin = createClient(url, service)
  const { data: callerProfile, error: profileError } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', caller.id)
    .maybeSingle()

  if (profileError || !callerProfile) {
    const error = new Error('Your profile was not found.')
    error.status = 403
    throw error
  }
  if (!isInternalRole(normalizeRole(callerProfile.role))) {
    const error = new Error('You do not have permission to manage tutors.')
    error.status = 403
    throw error
  }

  return { admin }
}

async function checkEmailInUse(admin, email) {
  const normalized = String(email || '')
    .trim()
    .toLowerCase()

  if (!normalized) {
    return { available: false, message: 'Enter an email address.' }
  }
  if (!isValidEmail(normalized)) {
    return { available: false, message: 'Enter a valid email address.' }
  }

  const { data: profileMatch, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('email', normalized)
    .maybeSingle()

  if (profileError) {
    return { available: false, message: profileError.message }
  }
  if (profileMatch) {
    return {
      available: false,
      message: 'This email is already registered on the platform',
    }
  }

  return { available: true }
}

async function handleCheckEmail(req, res, env, query) {
  if (req.method !== 'GET') {
    json(res, 405, { error: 'Method not allowed.' })
    return
  }

  try {
    const { admin } = await authenticateInternalCaller(req, env)
    const email = String(query.get('email') || '').trim()
    const result = await checkEmailInUse(admin, email)
    json(res, 200, result)
  } catch (error) {
    json(res, error.status || 500, {
      available: false,
      message: error instanceof Error ? error.message : 'Unable to check this email.',
    })
  }
}

async function handleCreateTutor(req, res, env) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed.' })
    return
  }

  try {
    const { admin } = await authenticateInternalCaller(req, env)
    const body = await readJson(req)

    const fullName = String(body.full_name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const phone = String(body.phone || '').trim()
    const password = String(body.password || '')

    if (!fullName || !email || !password) {
      json(res, 400, { error: 'Please fill in name, email, and password.' })
      return
    }
    if (password.length < 8) {
      json(res, 400, { error: 'Password must be at least 8 characters.' })
      return
    }

    const emailCheck = await checkEmailInUse(admin, email)
    if (!emailCheck.available) {
      json(res, 409, { error: emailCheck.message || 'This email is already in use.' })
      return
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { role: 'tutor' },
    })

    if (createError || !created.user) {
      const message = createError?.message || 'Unable to create the tutor login.'
      if (/already/i.test(message) || /registered/i.test(message)) {
        json(res, 409, { error: 'This email is already registered on the platform' })
        return
      }
      json(res, 400, { error: message })
      return
    }

    const tutorUserId = created.user.id

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        role: 'tutor',
        full_name: fullName,
        email,
        phone: phone || null,
      })
      .eq('id', tutorUserId)

    if (profileError) {
      await admin.auth.admin.deleteUser(tutorUserId)
      json(res, 500, { error: profileError.message })
      return
    }

    const { data: tutorRow, error: tutorError } = await admin
      .from('tutors')
      .upsert({ id: tutorUserId }, { onConflict: 'id' })
      .select('id, created_at, updated_at')
      .single()

    if (tutorError || !tutorRow) {
      await admin.auth.admin.deleteUser(tutorUserId)
      json(res, 500, { error: tutorError?.message || 'Unable to save the tutor record.' })
      return
    }

    const { data: profile, error: readError } = await admin
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at, updated_at')
      .eq('id', tutorUserId)
      .single()

    if (readError || !profile) {
      json(res, 500, { error: readError?.message || 'Tutor created but profile could not be loaded.' })
      return
    }

    json(res, 200, {
      ok: true,
      tutor: profile,
    })
  } catch (error) {
    json(res, error.status || 500, {
      error: error instanceof Error ? error.message : 'Unable to add this tutor.',
    })
  }
}

export function createTutorsMiddleware(env) {
  return async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    const { url, route } = requestRoute(req)

    if (route === '/check-email') {
      await handleCheckEmail(req, res, env, url.searchParams)
      return
    }

    if (route === '/' || route === '') {
      await handleCreateTutor(req, res, env)
      return
    }

    json(res, 404, { error: 'Not found.' })
  }
}
