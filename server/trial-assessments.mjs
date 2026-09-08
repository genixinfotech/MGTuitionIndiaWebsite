import { createClient } from '@supabase/supabase-js'

function supabaseUrl(env) {
  return (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim()
}

function serviceRoleKey(env) {
  return (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function normalizeSubjects(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((subject) => String(subject || '').trim()).filter(Boolean))]
  }
  if (typeof value === 'string' && value.trim()) {
    return [...new Set(value.split(',').map((subject) => subject.trim()).filter(Boolean))]
  }
  return []
}

function normalizeStudents(data) {
  if (Array.isArray(data.students) && data.students.length > 0) {
    return data.students
      .map((student) => ({
        studentName: String(student.studentName || student.name || '').trim(),
        board: String(student.board || '').trim(),
        grade: String(student.grade || student.plan || '').trim(),
        subjects: normalizeSubjects(student.subjects),
      }))
      .filter((student) => student.studentName && student.board && student.grade && student.subjects.length > 0)
  }

  const parentLegacyName = String(data.name || data.parentName || '').trim()
  const board = String(data.board || '').trim()
  const grade = String(data.grade || data.plan || '').trim()
  const subjects = normalizeSubjects(data.subjects)

  if (parentLegacyName && board && grade && subjects.length > 0) {
    return [{ studentName: parentLegacyName, board, grade, subjects }]
  }

  return []
}

export async function createTrialAssessmentRequests(env, data = {}) {
  const url = supabaseUrl(env)
  const service = serviceRoleKey(env)
  if (!url || !service) {
    return { created: [], skipped: true, reason: 'not_configured' }
  }

  const parentName = String(data.parentName || data.name || '').trim()
  const email = String(data.email || '')
    .trim()
    .toLowerCase()
  const phone = String(data.phone || '').trim() || null
  const message = String(data.message || '').trim() || null
  const referral = String(data.referral || '').trim() || null
  const students = normalizeStudents(data)

  if (!parentName || !isValidEmail(email) || students.length === 0) {
    return { created: [], skipped: true, reason: 'invalid_payload' }
  }

  const admin = createClient(url, service)
  const created = []

  for (const student of students) {
    for (const subject of student.subjects) {
      const { data: row, error } = await admin
        .from('web_assessment_requests')
        .insert({
          parent_name: parentName,
          student_name: student.studentName,
          email,
          phone,
          board: student.board,
          grade: student.grade,
          subject,
          notes: message,
          referral,
        })
        .select('id, student_name, subject')
        .maybeSingle()

      if (error) {
        if (error.code === '23505') continue
        throw new Error(error.message || 'Unable to create web assessment requests.')
      }

      if (row) created.push(row)
    }
  }

  return { created, skipped: false }
}
