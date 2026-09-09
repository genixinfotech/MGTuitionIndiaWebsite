import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { normalizeRegion } from './regions.mjs'
import {
  addSubjectSessions,
  coveredThroughFromAdmission,
  coverageTotalCents,
  defaultDaysOfWeekForSessionCount,
  formatClassCoverage,
  nextCoveredThrough,
  quoteSubjectBilling,
  sessionCreditsFromAdmission,
  sessionsPerMonthFromGrade,
} from './class-billing.mjs'

const MAX_BODY_BYTES = 200_000

function supabaseUrl(env) {
  return (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim()
}

function publishableKey(env) {
  return (env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_ANON_KEY || '').trim()
}

function serviceRoleKey(env) {
  return (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
}

function readEnv(env, key) {
  return String(env?.[key] || process.env[key] || '').trim()
}

function stripeSecret(env) {
  return readEnv(env, 'STRIPE_SECRET_KEY')
}

function regionForEnv(env) {
  return normalizeRegion(readEnv(env, 'Region') || readEnv(env, 'VITE_REGION'))
}

function paymentProviderForEnv(env) {
  return regionForEnv(env) === 'GCC' ? 'stripe' : 'manual'
}

function gradeNumberFromLabel(grade) {
  return Number(String(grade || '').match(/\d+/)?.[0] || 0)
}

async function catalogPlan(admin, region, grade) {
  const gradeNumber = gradeNumberFromLabel(grade)
  if (!gradeNumber) return null
  const { data, error } = await admin
    .from('tuition_plans')
    .select('monthly_rate, sessions_min, currency')
    .eq('region', region)
    .eq('grade_number', gradeNumber)
    .maybeSingle()
  if (error) return null
  return data
}

async function monthlyRateForQuotedSubject(admin, student, subject, region, requestedRate) {
  const { data: assigned } = await admin
    .from('student_subjects')
    .select('monthly_rate')
    .eq('student_id', student.id)
    .eq('subject', subject)
    .maybeSingle()
  if (assigned?.monthly_rate) return Number(assigned.monthly_rate)

  const plan = await catalogPlan(admin, region, student.grade)
  if (plan?.monthly_rate != null) return Number(plan.monthly_rate)

  const requested = Number(requestedRate)
  return Number.isFinite(requested) && requested > 0 ? requested : 0
}

export function paymentPublicConfig(env) {
  const provider = paymentProviderForEnv(env)
  return {
    paymentProvider: provider,
    cardCheckoutEnabled: provider === 'stripe' && Boolean(stripeSecret(env)),
  }
}

function bearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() || ''
}

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readRawBody(req) {
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
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function readJson(req) {
  const raw = await readRawBody(req)
  try {
    return JSON.parse(raw.toString('utf8') || '{}')
  } catch {
    throw new Error('Invalid JSON.')
  }
}

function adminClient(env) {
  const url = supabaseUrl(env)
  const service = serviceRoleKey(env)
  if (!url || !service) {
    const error = new Error('Payments are not configured. Add SUPABASE_SERVICE_ROLE_KEY on the server.')
    error.status = 500
    throw error
  }
  return createClient(url, service)
}

function stripeClient(env) {
  const secret = stripeSecret(env)
  if (!secret) {
    const error = new Error('Stripe is not configured. Add STRIPE_SECRET_KEY on the server.')
    error.status = 500
    throw error
  }
  return new Stripe(secret)
}

async function authenticateParent(req, env) {
  const url = supabaseUrl(env)
  const anon = publishableKey(env)
  if (!url || !anon) {
    const error = new Error('Supabase is not configured.')
    error.status = 500
    throw error
  }

  const token = bearerToken(req)
  if (!token) {
    const error = new Error('Please sign in again to continue payment.')
    error.status = 401
    throw error
  }

  const publicClient = createClient(url, anon)
  const {
    data: { user },
    error: authError,
  } = await publicClient.auth.getUser(token)
  if (authError || !user) {
    const error = new Error('Please sign in again to continue payment.')
    error.status = 401
    throw error
  }
  return user
}

async function daysOfWeekForSubject(admin, student, subject) {
  const { data: assigned } = await admin
    .from('batch_students')
    .select('batch:batches ( subject, days_of_week )')
    .eq('student_id', student.id)
  const assignedMatch = (assigned ?? [])
    .map((row) => row.batch)
    .find((batch) => batch && String(batch.subject) === subject && Array.isArray(batch.days_of_week) && batch.days_of_week.length > 0)
  if (assignedMatch) return assignedMatch.days_of_week

  let query = admin.from('batches').select('days_of_week').eq('subject', subject).limit(8)
  if (student.grade) query = query.eq('grade', student.grade)
  if (student.board) query = query.eq('syllabus', student.board)
  const { data: candidates } = await query
  const match = (candidates ?? []).find((row) => Array.isArray(row.days_of_week) && row.days_of_week.length > 0)
  if (match) return match.days_of_week

  return defaultDaysOfWeekForSessionCount(sessionsPerMonthFromGrade(student.grade))
}

function coverageLines(value) {
  return Array.isArray(value)
    ? value.filter((row) => row && row.subject && Number.isFinite(Number(row.classesPaid)))
    : []
}

async function loadAdmissionBilling(admin, studentId) {
  const withCoverage = await admin
    .from('admissions')
    .select('id, amount, status, subjects, subject_months, subject_sessions, subject_covered_through, paid_at, parent_id, student_id')
    .eq('student_id', studentId)
    .maybeSingle()
  if (!withCoverage.error) return withCoverage.data
  const legacy = await admin.from('admissions').select('*').eq('student_id', studentId).maybeSingle()
  if (legacy.error) throw new Error(legacy.error.message || 'Unable to load admission.')
  return legacy.data
}

async function quoteStudentSubjects(admin, student, subjects, region) {
  const admission = await loadAdmissionBilling(admin, student.id)
  const covered = coveredThroughFromAdmission(admission)
  const plan = await catalogPlan(admin, region, student.grade)
  const sessionsPerMonth = Number(plan?.sessions_min) || sessionsPerMonthFromGrade(student.grade)
  const lines = []
  for (const row of subjects) {
    const daysOfWeek = await daysOfWeekForSubject(admin, student, row.subject)
    const monthlyRate = await monthlyRateForQuotedSubject(
      admin,
      student,
      row.subject,
      region,
      row.monthly_rate,
    )
    lines.push(
      quoteSubjectBilling({
        subject: row.subject,
        monthlyRate,
        daysOfWeek,
        sessionsPerMonth,
        coveredThrough: covered[row.subject] || null,
      }),
    )
  }
  return lines
}

function incrementSubjectMonths(existing, subjects) {
  const next = { ...(existing ?? {}) }
  for (const subject of subjects) {
    const trimmed = String(subject || '').trim()
    if (!trimmed) continue
    next[trimmed] = (next[trimmed] ?? 0) + 1
  }
  return next
}

function missingSchemaColumn(error) {
  const message = String(error?.message || error?.details || '')
  return error?.code === 'PGRST204' || /subject_sessions|subject_covered_through|coverage/i.test(message)
}

async function applyPaidAdmission(admin, payment) {
  const subjects = Array.isArray(payment.subjects) ? payment.subjects : []
  const { data: existingRow, error: loadError } = await admin
    .from('admissions')
    .select('*')
    .eq('student_id', payment.student_id)
    .maybeSingle()
  if (loadError) throw new Error(loadError.message || 'Unable to load admission.')

  const existing = existingRow ?? null
  const coverage = coverageLines(payment.coverage)
  const { data: studentRow } = await admin
    .from('students')
    .select('grade')
    .eq('id', payment.student_id)
    .maybeSingle()
  const mergedSubjects = [...new Set([...(existing?.subjects ?? []), ...subjects])]
  const mergedAmount = (existing?.amount ?? 0) + payment.amount
  const paid = {
    amount: mergedAmount,
    status: 'paid',
    subjects: mergedSubjects,
    subject_months: incrementSubjectMonths(existing?.subject_months, subjects),
    subject_sessions: addSubjectSessions(
      sessionCreditsFromAdmission(existing, studentRow?.grade),
      coverage,
    ),
    subject_covered_through: nextCoveredThrough(coveredThroughFromAdmission(existing), coverage),
    paid_at: new Date().toISOString(),
  }
  const legacyPaid = {
    amount: paid.amount,
    status: paid.status,
    subjects: paid.subjects,
    subject_months: paid.subject_months,
    paid_at: paid.paid_at,
  }

  if (existing?.id) {
    let result = await admin.from('admissions').update(paid).eq('id', existing.id).select('*').single()
    if (result.error && missingSchemaColumn(result.error)) {
      result = await admin.from('admissions').update(legacyPaid).eq('id', existing.id).select('*').single()
    }
    if (result.error) throw new Error(result.error.message || 'Unable to complete admission.')
    return result.data
  }

  let result = await admin
    .from('admissions')
    .insert({
      student_id: payment.student_id,
      parent_id: payment.parent_id,
      ...paid,
    })
    .select('*')
    .single()
  if (result.error && missingSchemaColumn(result.error)) {
    result = await admin
      .from('admissions')
      .insert({
        student_id: payment.student_id,
        parent_id: payment.parent_id,
        ...legacyPaid,
      })
      .select('*')
      .single()
  }
  if (result.error) throw new Error(result.error.message || 'Unable to complete admission.')
  return result.data
}

function stripeCharge(session) {
  const intent = session?.payment_intent
  if (!intent || typeof intent === 'string') return null
  const charge = intent.latest_charge
  if (!charge || typeof charge === 'string') return null
  return charge
}

function paymentIntentId(session, payment) {
  const intent = session?.payment_intent
  if (typeof intent === 'string' && intent) return intent
  if (intent?.id) return intent.id
  return payment?.provider_payment_id || null
}

function receiptNumberFor(payment, _charge) {
  return `MGT-${String(payment.id).padStart(6, '0')}`
}

function paidAtIso(payment, session, charge) {
  if (payment?.paid_at) return payment.paid_at
  const unix = Number(charge?.created || session?.created || 0)
  if (unix > 0) return new Date(unix * 1000).toISOString()
  return new Date().toISOString()
}

function stripePaymentExtras(session) {
  const charge = stripeCharge(session)
  return {
    provider_payment_id: paymentIntentId(session, null),
    receipt_url: charge?.receipt_url || null,
  }
}

async function buildPaymentReceipt(admin, payment, session, parentEmail) {
  const { data: student } = await admin
    .from('students')
    .select('full_name, grade')
    .eq('id', payment.student_id)
    .maybeSingle()
  const charge = stripeCharge(session)
  const amountTotal = Number(session?.amount_total)
  return {
    receiptNumber: receiptNumberFor(payment, charge),
    transactionId: paymentIntentId(session, payment),
    sessionId: session?.id || payment.provider_session_id || null,
    paidAt: paidAtIso(payment, session, charge),
    amount: Number.isFinite(amountTotal) && amountTotal > 0 ? amountTotal / 100 : payment.amount,
    currency: String(session?.currency || payment.currency || 'usd').toUpperCase(),
    studentName: student?.full_name || 'Student',
    studentGrade: student?.grade || null,
    parentEmail: parentEmail || null,
    subjects: Array.isArray(payment.subjects) ? payment.subjects : [],
    coverage: coverageLines(payment.coverage),
    renewal: Boolean(payment.renewal),
    provider: payment.provider,
  }
}

async function loadAdmissionForStudent(admin, studentId) {
  const { data } = await admin.from('admissions').select('*').eq('student_id', studentId).maybeSingle()
  return data ?? null
}

async function markPaymentPaid(admin, paymentId, extras = {}) {
  const { data, error } = await admin
    .from('tuition_payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      ...extras,
    })
    .eq('id', paymentId)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle()
  if (error) throw new Error(error.message || 'Unable to update payment.')
  return data
}

async function fulfillCheckoutSession(env, session) {
  const admin = adminClient(env)
  const sessionId = session.id
  const { data: payment, error } = await admin
    .from('tuition_payments')
    .select('*')
    .eq('provider', 'stripe')
    .eq('provider_session_id', sessionId)
    .maybeSingle()
  if (error) throw new Error(error.message || 'Unable to load payment.')
  if (!payment) throw new Error('Payment record was not found.')
  if (payment.status === 'paid') {
    return {
      admission: await loadAdmissionForStudent(admin, payment.student_id),
      payment,
    }
  }

  const updated = await markPaymentPaid(admin, payment.id, stripePaymentExtras(session))
  if (!updated) {
    const { data: latest } = await admin.from('tuition_payments').select('*').eq('id', payment.id).maybeSingle()
    return {
      admission: await loadAdmissionForStudent(admin, payment.student_id),
      payment: latest ?? payment,
    }
  }

  const admission = await applyPaidAdmission(admin, {
    ...updated,
    subjects: updated.subjects ?? payment.subjects,
  })
  return { admission, payment: updated }
}

async function createCheckout(req, res, env) {
  if (paymentProviderForEnv(env) !== 'stripe') {
    json(res, 400, { error: 'Card checkout is only available for the GCC site.' })
    return
  }

  const user = await authenticateParent(req, env)
  const body = await readJson(req)
  const studentId = Number(body.studentId)
  const renewal = Boolean(body.renewal)
  const subjects = Array.isArray(body.subjects)
    ? body.subjects
        .map((row) => ({
          subject: String(row?.subject || '').trim(),
          monthly_rate: Number(row?.monthly_rate),
        }))
        .filter((row) => row.subject && Number.isFinite(row.monthly_rate) && row.monthly_rate > 0)
    : []

  if (!studentId || subjects.length === 0) {
    json(res, 400, { error: 'Select at least one subject to pay.' })
    return
  }

  const admin = adminClient(env)
  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id, parent_id, full_name, grade, board')
    .eq('id', studentId)
    .maybeSingle()
  if (studentError || !student || student.parent_id !== user.id) {
    json(res, 403, { error: 'You can only pay for your own children.' })
    return
  }

  const coverage = await quoteStudentSubjects(admin, student, subjects, regionForEnv(env))
  const amountCents = coverageTotalCents(coverage)
  if (amountCents < 1) {
    json(res, 400, { error: 'There are no remaining classes to pay for yet.' })
    return
  }
  const amount = amountCents / 100
  const stripe = stripeClient(env)
  const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
  const subjectNames = subjects.map((row) => row.subject)

  const { data: payment, error: insertError } = await admin
    .from('tuition_payments')
    .insert({
      student_id: studentId,
      parent_id: user.id,
      provider: 'stripe',
      status: 'pending',
      amount,
      currency: 'USD',
      subjects: subjectNames,
      coverage,
      renewal,
    })
    .select('*')
    .single()
  if (insertError || !payment) {
    json(res, 500, { error: insertError?.message || 'Unable to create payment.' })
    return
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email || undefined,
    success_url: `${origin}/portal/students?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/portal/students?payment=cancelled`,
    line_items: coverage.map((line) => ({
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: line.amountCents,
        product_data: {
          name: formatClassCoverage(line),
          description: `MG Tuition GCC · ${student.full_name} · ${line.classesPaid} of ${line.classesInMonth} classes`,
        },
      },
    })),
    metadata: {
      payment_id: String(payment.id),
      student_id: String(studentId),
      parent_id: user.id,
      subjects: subjectNames.join(','),
    },
  })

  const { error: sessionError } = await admin
    .from('tuition_payments')
    .update({ provider_session_id: session.id })
    .eq('id', payment.id)
  if (sessionError) {
    json(res, 500, { error: sessionError.message || 'Unable to store checkout session.' })
    return
  }

  json(res, 200, { url: session.url })
}

async function quoteCheckout(req, res, env) {
  const user = await authenticateParent(req, env)
  const body = await readJson(req)
  const studentId = Number(body.studentId)
  const subjects = Array.isArray(body.subjects)
    ? body.subjects
        .map((row) => ({
          subject: String(row?.subject || '').trim(),
          monthly_rate: Number(row?.monthly_rate),
        }))
        .filter((row) => row.subject && Number.isFinite(row.monthly_rate) && row.monthly_rate > 0)
    : []

  if (!studentId || subjects.length === 0) {
    json(res, 400, { error: 'Select at least one subject to pay.' })
    return
  }

  const admin = adminClient(env)
  const { data: student, error: studentError } = await admin
    .from('students')
    .select('id, parent_id, full_name, grade, board')
    .eq('id', studentId)
    .maybeSingle()
  if (studentError || !student || student.parent_id !== user.id) {
    json(res, 403, { error: 'You can only pay for your own children.' })
    return
  }

  const coverage = await quoteStudentSubjects(admin, student, subjects, regionForEnv(env))
  json(res, 200, {
    coverage,
    amount: coverageTotalCents(coverage) / 100,
    currency: 'USD',
  })
}

async function confirmCheckout(req, res, env) {
  const user = await authenticateParent(req, env)
  const body = await readJson(req)
  const sessionId = String(body.sessionId || '').trim()
  if (!sessionId) {
    json(res, 400, { error: 'Missing checkout session.' })
    return
  }

  const stripe = stripeClient(env)
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent.latest_charge'],
  })
  if (session.metadata?.parent_id && session.metadata.parent_id !== user.id) {
    json(res, 403, { error: 'This payment does not belong to your account.' })
    return
  }
  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    json(res, 409, { error: 'This payment is not complete yet.' })
    return
  }

  const { admission, payment } = await fulfillCheckoutSession(env, session)
  if (!admission || !payment) {
    json(res, 500, { error: 'Unable to confirm this payment.' })
    return
  }
  const receipt = await buildPaymentReceipt(adminClient(env), payment, session, user.email)
  json(res, 200, { admission, receipt })
}

async function handleWebhook(req, res, env) {
  const raw = await readRawBody(req)
  const signature = req.headers['stripe-signature']
  const webhookSecret = readEnv(env, 'STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    json(res, 500, { error: 'STRIPE_WEBHOOK_SECRET is not configured.' })
    return
  }

  const stripe = stripeClient(env)
  const event = stripe.webhooks.constructEvent(raw, signature, webhookSecret)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    if (session.payment_status === 'paid' || session.status === 'complete') {
      await fulfillCheckoutSession(env, session)
    }
  }
  json(res, 200, { received: true })
}

export function createPaymentsMiddleware(env) {
  return async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const path = url.pathname.replace(/^\/api\/payments/, '') || '/'

    try {
      if ((path === '/' || path === '/config') && req.method === 'GET') {
        json(res, 200, { ok: true, ...paymentPublicConfig(env) })
        return
      }
      if (path === '/quote' && req.method === 'POST') {
        await quoteCheckout(req, res, env)
        return
      }
      if (path === '/checkout' && req.method === 'POST') {
        await createCheckout(req, res, env)
        return
      }
      if (path === '/confirm' && req.method === 'POST') {
        await confirmCheckout(req, res, env)
        return
      }
      if (path === '/webhook' && req.method === 'POST') {
        await handleWebhook(req, res, env)
        return
      }
      json(res, 404, { error: 'Not found' })
    } catch (err) {
      const status = err.status || 500
      json(res, status, { error: err.message || 'Payment request failed.' })
    }
  }
}
