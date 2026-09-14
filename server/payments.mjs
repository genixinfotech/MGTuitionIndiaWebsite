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

export async function paymentRuntimeConfig(env) {
  return {
    ...paymentPublicConfig(env),
    paymentModel: await loadPaymentModel(env),
  }
}

async function loadPaymentModel(env) {
  try {
    const { data } = await adminClient(env)
      .from('app_settings')
      .select('payment_model')
      .eq('id', 1)
      .maybeSingle()
    return data?.payment_model === 'subscription' ? 'subscription' : 'one_time'
  } catch {
    return 'one_time'
  }
}

function nextMonthStartUnix() {
  const now = new Date()
  return Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime() / 1000)
}

function nextMonthLabel() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

function subscriptionIdFrom(session) {
  const value = session?.subscription
  if (typeof value === 'string' && value) return value
  return value?.id || null
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

function isCheckoutSuccessful(session) {
  return (
    session?.status === 'complete' ||
    session?.payment_status === 'paid' ||
    session?.payment_status === 'no_payment_required'
  )
}

function stripeInvoice(session) {
  const invoice = session?.invoice
  return invoice && typeof invoice !== 'string' ? invoice : null
}

function chargeFromPaymentIntent(intent) {
  if (!intent || typeof intent === 'string') return null
  const charge = intent.latest_charge
  if (!charge || typeof charge === 'string') return null
  return charge
}

function stripeCharge(session) {
  return (
    chargeFromPaymentIntent(session?.payment_intent) ||
    chargeFromPaymentIntent(stripeInvoice(session)?.payment_intent)
  )
}

function paymentIntentId(session, payment) {
  const intent = session?.payment_intent || stripeInvoice(session)?.payment_intent
  if (typeof intent === 'string' && intent) return intent
  if (intent?.id) return intent.id
  return payment?.provider_payment_id || session?.id || null
}

function compactExtras(extras) {
  return Object.fromEntries(
    Object.entries(extras).filter(([, value]) => value != null && value !== ''),
  )
}

async function retrieveCheckoutSession(stripe, sessionId) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['invoice.payment_intent.latest_charge', 'subscription'],
    })
  } catch {
    return stripe.checkout.sessions.retrieve(sessionId)
  }
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
  return compactExtras({
    provider_payment_id: paymentIntentId(session, null),
    receipt_url: charge?.receipt_url || null,
    provider_subscription_id: subscriptionIdFrom(session),
  })
}

function missingPaymentColumn(error) {
  const message = String(error?.message || error?.details || '')
  return error?.code === 'PGRST204' || /provider_subscription_id/i.test(message)
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
  const payload = {
    status: 'paid',
    paid_at: new Date().toISOString(),
    ...compactExtras(extras),
  }
  let result = await admin
    .from('tuition_payments')
    .update(payload)
    .eq('id', paymentId)
    .eq('status', 'pending')
    .select('*')
    .maybeSingle()
  if (result.error && missingPaymentColumn(result.error)) {
    const { provider_subscription_id: _ignored, ...withoutSubscription } = payload
    result = await admin
      .from('tuition_payments')
      .update(withoutSubscription)
      .eq('id', paymentId)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle()
  }
  if (result.error) throw new Error(result.error.message || 'Unable to update payment.')
  return result.data
}

async function loadPaymentForCheckoutSession(admin, session) {
  const bySession = await admin
    .from('tuition_payments')
    .select('*')
    .eq('provider', 'stripe')
    .eq('provider_session_id', session.id)
    .maybeSingle()
  if (bySession.error) throw new Error(bySession.error.message || 'Unable to load payment.')
  if (bySession.data) return bySession.data

  const paymentId = Number(session.metadata?.payment_id)
  if (!paymentId) throw new Error('Payment record was not found.')
  const byId = await admin.from('tuition_payments').select('*').eq('id', paymentId).maybeSingle()
  if (byId.error) throw new Error(byId.error.message || 'Unable to load payment.')
  if (!byId.data) throw new Error('Payment record was not found.')
  return byId.data
}

async function waitForAdmission(admin, studentId) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const admission = await loadAdmissionForStudent(admin, studentId)
    if (admission) return admission
    if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 300))
  }
  return null
}

async function fulfillCheckoutSession(env, session) {
  const admin = adminClient(env)
  const payment = await loadPaymentForCheckoutSession(admin, session)

  if (payment.status === 'paid') {
    let admission = await waitForAdmission(admin, payment.student_id)
    if (!admission) admission = await applyPaidAdmission(admin, payment)
    return { admission, payment }
  }

  const updated = await markPaymentPaid(admin, payment.id, stripePaymentExtras(session))
  if (updated) {
    const admission = await applyPaidAdmission(admin, {
      ...updated,
      subjects: updated.subjects ?? payment.subjects,
    })
    return { admission, payment: updated }
  }

  const { data: latest } = await admin.from('tuition_payments').select('*').eq('id', payment.id).maybeSingle()
  const paid = latest ?? payment
  let admission = await waitForAdmission(admin, payment.student_id)
  if (!admission) admission = await applyPaidAdmission(admin, paid)
  return { admission, payment: paid }
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
  const amount = Number((amountCents / 100).toFixed(2))
  const stripe = stripeClient(env)
  const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
  const subjectNames = subjects.map((row) => row.subject)
  const paymentModel = await loadPaymentModel(env)
  const useSubscription = paymentModel === 'subscription'
  const prorataFirstMonth = coverage.some((line) => line.classesPaid < line.classesInMonth)

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

  const metadata = {
    payment_id: String(payment.id),
    student_id: String(studentId),
    parent_id: user.id,
    subjects: subjectNames.join(','),
    payment_model: paymentModel,
  }

  const lineItems = useSubscription
    ? coverage.flatMap((line) => {
        const monthlyCents = Math.max(1, Math.round(Number(line.monthlyRate) * 100))
        const items = [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              recurring: { interval: 'month' },
              unit_amount: monthlyCents,
              product_data: {
                name: `${line.subject} · monthly tuition`,
                description: `MG Tuition GCC · ${student.full_name} · starts ${nextMonthLabel()}`,
              },
            },
          },
        ]
        if (prorataFirstMonth && line.amountCents > 0) {
          items.push({
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: line.amountCents,
              product_data: {
                name: `${line.subject} · Prorata Plan`,
                description: `On Prorata Basis · ${line.classesPaid} of ${line.classesInMonth} classes in ${line.monthLabel}`,
              },
            },
          })
        }
        return items
      })
    : coverage.map((line) => ({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: line.amountCents,
          product_data: {
            name: formatClassCoverage(line),
            description: `MG Tuition GCC · ${student.full_name} · ${line.classesPaid} of ${line.classesInMonth} classes`,
          },
        },
      }))

  const session = await stripe.checkout.sessions.create({
    mode: useSubscription ? 'subscription' : 'payment',
    customer_email: user.email || undefined,
    success_url: `${origin}/portal/students?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/portal/students?payment=cancelled`,
    line_items: lineItems,
    metadata,
    ...(useSubscription
      ? {
          custom_text: prorataFirstMonth
            ? {
                submit: {
                  message:
                    'Today you pay the Prorata Plan for remaining classes this month. The monthly subscription starts next month.',
                },
              }
            : undefined,
          subscription_data: {
            metadata,
            ...(prorataFirstMonth ? { trial_end: nextMonthStartUnix() } : {}),
          },
        }
      : {}),
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
  const session = await retrieveCheckoutSession(stripe, sessionId)
  if (session.metadata?.parent_id && session.metadata.parent_id !== user.id) {
    json(res, 403, { error: 'This payment does not belong to your account.' })
    return
  }
  if (!isCheckoutSuccessful(session)) {
    json(res, 409, { error: 'This payment is not complete yet.' })
    return
  }

  const { admission, payment } = await fulfillCheckoutSession(env, session)
  if (!admission || !payment) {
    json(res, 500, { error: 'Payment was received, but admission could not be updated. Please contact us.' })
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
    if (
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required' ||
      session.status === 'complete'
    ) {
      await fulfillCheckoutSession(env, session)
    }
  }
  if (event.type === 'invoice.paid') {
    await fulfillSubscriptionInvoice(env, event.data.object)
  }
  json(res, 200, { received: true })
}

async function fulfillSubscriptionInvoice(env, invoice) {
  if (invoice?.billing_reason !== 'subscription_cycle') return
  const subscriptionId =
    typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
  if (!subscriptionId) return

  const stripe = stripeClient(env)
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const studentId = Number(subscription.metadata?.student_id)
  const parentId = String(subscription.metadata?.parent_id || '')
  const subjectNames = String(subscription.metadata?.subjects || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (!studentId || !parentId || subjectNames.length === 0) return

  const admin = adminClient(env)
  const { data: existing } = await admin
    .from('tuition_payments')
    .select('id')
    .eq('provider', 'stripe')
    .eq('provider_payment_id', invoice.id)
    .maybeSingle()
  if (existing) return

  const { data: student } = await admin
    .from('students')
    .select('id, parent_id, full_name, grade, board')
    .eq('id', studentId)
    .maybeSingle()
  if (!student || student.parent_id !== parentId) return

  const { data: assigned } = await admin
    .from('student_subjects')
    .select('subject, monthly_rate')
    .eq('student_id', studentId)
    .in('subject', subjectNames)
  const subjects = subjectNames.map((subject) => {
    const row = (assigned ?? []).find((item) => item.subject === subject)
    return { subject, monthly_rate: Number(row?.monthly_rate) || 1 }
  })

  const coverage = await quoteStudentSubjects(admin, student, subjects, regionForEnv(env))
  const amount = Number((coverageTotalCents(coverage) / 100).toFixed(2))
  const { data: payment, error } = await admin
    .from('tuition_payments')
    .insert({
      student_id: studentId,
      parent_id: parentId,
      provider: 'stripe',
      status: 'paid',
      amount,
      currency: 'USD',
      subjects: subjectNames,
      coverage,
      renewal: true,
      provider_payment_id: invoice.id,
      provider_subscription_id: subscriptionId,
      paid_at: new Date().toISOString(),
    })
    .select('*')
    .single()
  if (error || !payment) throw new Error(error?.message || 'Unable to record subscription payment.')
  await applyPaidAdmission(admin, payment)
}

export function createPaymentsMiddleware(env) {
  return async (req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
    const path = url.pathname.replace(/^\/api\/payments/, '') || '/'

    try {
      if ((path === '/' || path === '/config') && req.method === 'GET') {
        json(res, 200, { ok: true, ...(await paymentRuntimeConfig(env)) })
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
