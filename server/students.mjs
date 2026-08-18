import { createClient } from '@supabase/supabase-js'

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

export function createStudentsMiddleware(env) {
  return async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204
      res.end()
      return
    }

    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed.' })
      return
    }

    const url = supabaseUrl(env)
    const anon = publishableKey(env)
    const service = serviceRoleKey(env)
    if (!url || !anon || !service) {
      json(res, 500, {
        error:
          'Student accounts are not configured. Add SUPABASE_SERVICE_ROLE_KEY to the server .env (never prefix it with VITE_).',
      })
      return
    }

    try {
      const token = bearerToken(req)
      if (!token) {
        json(res, 401, { error: 'Please sign in again to enrol a student.' })
        return
      }

      const publicClient = createClient(url, anon)
      const {
        data: { user: parent },
        error: authError,
      } = await publicClient.auth.getUser(token)
      if (authError || !parent) {
        json(res, 401, { error: 'Please sign in again to enrol a student.' })
        return
      }

      const admin = createClient(url, service)
      const { data: parentProfile, error: profileError } = await admin
        .from('profiles')
        .select('id, role')
        .eq('id', parent.id)
        .maybeSingle()

      if (profileError || !parentProfile) {
        json(res, 403, { error: 'Your parent profile was not found.' })
        return
      }
      if (!['parent', 'staff'].includes(parentProfile.role)) {
        json(res, 403, { error: 'Only a parent account can enrol a student.' })
        return
      }

      const body = await readJson(req)
      const fullName = String(body.full_name || '').trim()
      const email = String(body.email || '').trim().toLowerCase()
      const city = String(body.city || '').trim()
      const state = String(body.state || '').trim()
      const grade = String(body.grade || '').trim()
      const board = String(body.board || '').trim()
      const schoolName = String(body.school_name || '').trim()
      const password = String(body.password || '')

      if (!fullName || !email || !password || !city || !state || !grade || !board || !schoolName) {
        json(res, 400, { error: 'Please fill in every enrolment field.' })
        return
      }
      if (password.length < 8) {
        json(res, 400, { error: 'Student password must be at least 8 characters.' })
        return
      }
      if (email === (parent.email || '').toLowerCase()) {
        json(res, 400, { error: 'Use a different email for the student login — not the parent email.' })
        return
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
        app_metadata: { role: 'student' },
      })

      if (createError || !created.user) {
        const message = createError?.message || 'Unable to create the student login.'
        if (/already/i.test(message) || /registered/i.test(message)) {
          json(res, 409, { error: 'That email already has an account. Use a different student email.' })
          return
        }
        json(res, 400, { error: message })
        return
      }

      const studentUserId = created.user.id
      const { error: roleError } = await admin
        .from('profiles')
        .update({ role: 'student', full_name: fullName, email })
        .eq('id', studentUserId)

      if (roleError) {
        await admin.auth.admin.deleteUser(studentUserId)
        json(res, 500, { error: roleError.message })
        return
      }

      const { data: student, error: insertError } = await admin
        .from('students')
        .insert({
          parent_id: parent.id,
          user_id: studentUserId,
          email,
          full_name: fullName,
          city,
          state,
          grade,
          board,
          school_name: schoolName,
        })
        .select('*')
        .single()

      if (insertError || !student) {
        await admin.auth.admin.deleteUser(studentUserId)
        json(res, 500, { error: insertError?.message || 'Unable to save the student record.' })
        return
      }

      json(res, 200, {
        ok: true,
        student,
      })
    } catch (error) {
      json(res, 500, {
        error: error instanceof Error ? error.message : 'Unable to enrol this student.',
      })
    }
  }
}
