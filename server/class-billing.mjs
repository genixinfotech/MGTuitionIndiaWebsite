export function defaultDaysOfWeekForSessionCount(sessionsPerMonth) {
  return sessionsPerMonth >= 12 ? [1, 3, 5] : [1, 4]
}

export function sessionsPerMonthFromGrade(grade) {
  const n = Number(String(grade || '').match(/\d+/)?.[0] || 0)
  if (n >= 10) return 12
  return 8
}

export function monthKeyFromDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabelFromKey(key) {
  const [year, month] = String(key || '').split('-').map(Number)
  if (!year || !month) return key
  return new Date(year, month - 1, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

export function monthNameFromKey(key) {
  return monthLabelFromKey(key).split(' ')[0] || key
}

export function addMonthsKey(key, delta) {
  const [year, month] = String(key).split('-').map(Number)
  return monthKeyFromDate(new Date(year, month - 1 + delta, 1))
}

export function countWeekdaySessions(daysOfWeek, from, to) {
  const daySet = new Set(daysOfWeek)
  let count = 0
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setHours(0, 0, 0, 0)
  while (cursor <= end) {
    if (daySet.has(cursor.getDay())) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }
  return count
}

function monthRange(key) {
  const [year, month] = String(key).split('-').map(Number)
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0),
  }
}

export function coveredThroughFromAdmission(admission) {
  const covered = { ...(admission?.subject_covered_through ?? {}) }
  const months = admission?.subject_months ?? {}
  const paidMonth = admission?.paid_at ? monthKeyFromDate(new Date(admission.paid_at)) : null
  for (const [subject, count] of Object.entries(months)) {
    if (covered[subject]) continue
    const n = Number(count)
    if (!Number.isFinite(n) || n <= 0 || !paidMonth) continue
    covered[subject] = addMonthsKey(paidMonth, n - 1)
  }
  return covered
}

export function sessionCreditsFromAdmission(admission, grade) {
  const sessions = { ...(admission?.subject_sessions ?? {}) }
  const months = admission?.subject_months ?? {}
  const perMonth = sessionsPerMonthFromGrade(grade)
  for (const [subject, count] of Object.entries(months)) {
    if ((sessions[subject] ?? 0) > 0) continue
    const n = Number(count)
    if (Number.isFinite(n) && n > 0) sessions[subject] = n * perMonth
  }
  return sessions
}

export function quoteSubjectBilling(input) {
  const today = input.fromDate ? new Date(input.fromDate) : new Date()
  today.setHours(0, 0, 0, 0)
  const prefixed = Math.max(1, Number(input.sessionsPerMonth) || 8)
  const days = Array.isArray(input.daysOfWeek) && input.daysOfWeek.length > 0
    ? input.daysOfWeek
    : defaultDaysOfWeekForSessionCount(prefixed)

  let billingKey = input.coveredThrough ? addMonthsKey(input.coveredThrough, 1) : monthKeyFromDate(today)
  let periodFrom = input.coveredThrough ? monthRange(billingKey).start : today

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { start: monthStart, end: monthEnd } = monthRange(billingKey)
    const from = periodFrom < monthStart ? monthStart : periodFrom
    const remaining = from > monthEnd ? 0 : countWeekdaySessions(days, from, monthEnd)
    const classesPaid = Math.min(remaining, prefixed)

    if (classesPaid > 0) {
      const amountCents = Math.round(input.monthlyRate * 100 * (classesPaid / prefixed))
      return {
        subject: input.subject,
        monthlyRate: input.monthlyRate,
        month: billingKey,
        monthLabel: monthLabelFromKey(billingKey),
        classesPaid,
        classesInMonth: prefixed,
        amount: amountCents / 100,
        amountCents,
      }
    }

    billingKey = addMonthsKey(billingKey, 1)
    periodFrom = monthRange(billingKey).start
  }

  const amountCents = Math.round(input.monthlyRate * 100)
  return {
    subject: input.subject,
    monthlyRate: input.monthlyRate,
    month: billingKey,
    monthLabel: monthLabelFromKey(billingKey),
    classesPaid: prefixed,
    classesInMonth: prefixed,
    amount: amountCents / 100,
    amountCents,
  }
}

export function formatClassCoverage(line) {
  const monthName = String(line.monthLabel || monthNameFromKey(line.month || '')).split(' ')[0]
  const unit = line.classesPaid === 1 ? 'class' : 'classes'
  return `${line.subject} · ${monthName} · ${line.classesPaid} ${unit}`
}

export function addSubjectSessions(existing, lines) {
  const next = { ...(existing ?? {}) }
  for (const line of lines) {
    next[line.subject] = (next[line.subject] ?? 0) + line.classesPaid
  }
  return next
}

export function nextCoveredThrough(existing, lines) {
  const next = { ...(existing ?? {}) }
  for (const line of lines) {
    const current = next[line.subject]
    if (!current || line.month > current) next[line.subject] = line.month
  }
  return next
}

export function coverageTotalCents(lines) {
  return lines.reduce((sum, line) => sum + Number(line.amountCents || 0), 0)
}
