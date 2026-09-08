import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ClipboardCheck, Link2, Loader2, X } from 'lucide-react'
import { FormField, fieldClass } from '@/components/forms/FormField'
import { formatClassDate, formatClassTimeRange } from '@/lib/student-classes'
import {
  saveSessionOccurrence,
  type BatchSessionOccurrence,
} from '@/lib/sessions'
import { getSupabase } from '@/lib/supabase'

export function TutorSessionManageFlyout({
  open,
  batchId,
  sessionDate,
  batchName,
  startTime,
  endTime,
  onClose,
  onSaved,
}: {
  open: boolean
  batchId: number
  sessionDate: string
  batchName: string
  startTime: string
  endTime: string
  onClose: () => void
  onSaved: () => void
}) {
  const [occurrence, setOccurrence] = useState<BatchSessionOccurrence | null>(null)
  const [attendance, setAttendance] = useState<Record<number, boolean>>({})
  const [recordingLink, setRecordingLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError('')

    void loadOccurrence(batchId, sessionDate)
      .then((row) => {
        setOccurrence(row)
        setRecordingLink(row?.recordingLink ?? '')
        setAttendance(
          Object.fromEntries(
            (row?.students ?? []).map((student) => [
              student.sessionId,
              student.attended ?? false,
            ]),
          ),
        )
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load session details.')
      })
      .finally(() => setLoading(false))
  }, [batchId, open, sessionDate])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, saving, onClose])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!occurrence) return
    setSaving(true)
    setError('')
    try {
      await saveSessionOccurrence({
        batchId,
        sessionDate,
        recordingLink,
        attendance: occurrence.students.map((student) => ({
          sessionId: student.sessionId,
          attended: attendance[student.sessionId] ?? false,
        })),
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save session details.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
            aria-label="Close session panel"
            disabled={saving}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            className="fixed top-0 right-0 flex h-dvh w-full max-w-md flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <div className="flex items-center gap-2 font-bold text-charcoal">
                  <ClipboardCheck className="h-5 w-5 text-crimson" />
                  <h2>Session details</h2>
                </div>
                <p className="mt-1 text-sm font-semibold text-charcoal">{batchName}</p>
                <p className="mt-0.5 text-sm text-charcoal/50">
                  {formatClassDate(sessionDate)} · {formatClassTimeRange(startTime, endTime)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 hover:text-crimson"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {loading ? (
                  <p className="flex items-center gap-2 text-sm text-charcoal/50">
                    <Loader2 className="h-4 w-4 animate-spin text-crimson" />
                    Loading students…
                  </p>
                ) : null}

                <FormField label="Teams recording link" icon={Link2}>
                  <input
                    type="url"
                    className={fieldClass(true)}
                    placeholder="https://teams.microsoft.com/..."
                    value={recordingLink}
                    onChange={(event) => setRecordingLink(event.target.value)}
                  />
                </FormField>

                {occurrence ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-charcoal/45">
                      Attendance
                    </p>
                    <ul className="space-y-2">
                      {occurrence.students.map((student) => (
                        <li
                          key={student.sessionId}
                          className="flex items-center justify-between rounded-xl border border-charcoal/[0.08] px-3 py-2.5"
                        >
                          <span className="text-sm font-semibold text-charcoal">{student.studentName}</span>
                          <label className="inline-flex items-center gap-2 text-sm text-charcoal/70">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-crimson"
                              checked={attendance[student.sessionId] ?? false}
                              onChange={(event) =>
                                setAttendance((current) => ({
                                  ...current,
                                  [student.sessionId]: event.target.checked,
                                }))
                              }
                            />
                            Present
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {error ? (
                  <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">
                    {error}
                  </p>
                ) : null}
              </div>

              <div className="border-t border-charcoal/[0.06] px-5 py-4">
                <button
                  type="submit"
                  disabled={saving || loading || !occurrence}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save attendance & recording'
                  )}
                </button>
              </div>
            </form>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

async function loadOccurrence(batchId: number, sessionDate: string) {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select(
      `
      id,
      batch_id,
      student_id,
      session_date,
      starts_at,
      ends_at,
      status,
      attended,
      recording_link,
      student:students ( id, full_name )
    `,
    )
    .eq('batch_id', batchId)
    .eq('session_date', sessionDate)

  if (error) throw new Error(error.message || 'Unable to load session.')

  type Row = {
    id: number
    batch_id: number
    student_id: number
    session_date: string
    starts_at: string
    ends_at: string
    status: BatchSessionOccurrence['status']
    attended: boolean | null
    recording_link: string | null
    student: { id: number; full_name: string } | null
  }

  const rows = (data ?? []) as Row[]
  if (rows.length === 0) return null

  const first = rows[0]
  return {
    batchId,
    sessionDate,
    startsAt: first.starts_at,
    endsAt: first.ends_at,
    status: first.status,
    recordingLink: rows.find((row) => row.recording_link)?.recording_link ?? null,
    sessionIds: rows.map((row) => row.id),
    students: rows.map((row) => ({
      sessionId: row.id,
      studentId: row.student_id,
      studentName: row.student?.full_name?.trim() || 'Student',
      attended: row.attended,
    })),
  } satisfies BatchSessionOccurrence
}
