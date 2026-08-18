import { useState } from 'react'
import { ClipboardList, FileText } from 'lucide-react'
import {
  assessmentStatuses,
  formatPreferredSlot,
  subjectsForStudent,
  updateAssessmentStatus,
} from '@/lib/assessments'
import type {
  AssessmentRequestDetails,
  AssessmentStatus,
  StudentSubject,
  WeakSubjectNote,
} from '@/lib/database.types'
import { AssessmentConsultantModal } from '@/components/dashboard/AssessmentConsultantModal'

export type AssessmentPatch = {
  status?: AssessmentStatus
  report?: string
  report_path?: string | null
  weak_subjects?: WeakSubjectNote[]
}

export function AssessmentQueue({
  rows,
  assignedSubjects,
  loading,
  onChange,
  onSubjectsChange,
  onError,
}: {
  rows: AssessmentRequestDetails[]
  assignedSubjects: StudentSubject[]
  loading: boolean
  onChange: (id: number, patch: AssessmentPatch) => void
  onSubjectsChange: (studentId: number, rows: StudentSubject[]) => void
  onError: (message: string) => void
}) {
  const [savingId, setSavingId] = useState<number | null>(null)
  const [editing, setEditing] = useState<AssessmentRequestDetails | null>(null)

  async function onStatus(id: number, status: AssessmentStatus) {
    const row = rows.find((item) => item.id === id)
    if (status === 'completed') {
      if (row) setEditing(row)
      return
    }
    const previous = row?.status
    onChange(id, { status })
    setSavingId(id)
    try {
      await updateAssessmentStatus(id, status)
    } catch (err) {
      if (previous) onChange(id, { status: previous })
      onError(err instanceof Error ? err.message : 'Unable to update this request.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
        <div className="border-b border-charcoal/[0.06] px-5 py-4">
          <div className="flex items-center gap-2 font-bold">
            <ClipboardList className="h-5 w-5 text-crimson" />
            Assessment requests
          </div>
          <p className="mt-1 text-sm text-charcoal/50">
            Prepare a weak-subject PDF, then assign the tuition subjects the parent will pay for.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#faf7f7] text-xs uppercase tracking-wider text-charcoal/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Preferred slot</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">Parent</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Report</th>
                <th className="px-5 py-3 font-semibold">Subjects</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-charcoal/50">
                    No assessment requests yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const student = row.student
                  const parent = row.parent
                  const subjects = student ? subjectsForStudent(assignedSubjects, student.id) : []
                  const reportLabel = row.report_path
                    ? subjects.length > 0
                      ? 'Update'
                      : 'Assign subjects'
                    : 'Prepare report'
                  return (
                    <tr key={row.id} className="border-t border-charcoal/[0.05] align-top">
                      <td className="whitespace-nowrap px-5 py-3 text-charcoal/60">
                        {formatPreferredSlot(row.preferred_date, row.preferred_time)}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{student?.full_name || 'Student'}</p>
                        <p className="text-charcoal/45">{student?.school_name}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p>{student?.grade || '—'}</p>
                        <p className="text-charcoal/45">{student?.board}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium">{parent?.full_name || 'Parent'}</p>
                        <p className="text-charcoal/45">{parent?.email}</p>
                        {parent?.phone ? <p className="text-charcoal/45">{parent.phone}</p> : null}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          className="rounded-lg border border-charcoal/10 bg-white px-2 py-1 text-sm capitalize disabled:opacity-60"
                          value={row.status}
                          disabled={savingId === row.id}
                          onChange={(e) => void onStatus(row.id, e.target.value as AssessmentStatus)}
                        >
                          {assessmentStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setEditing(row)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-crimson hover:text-crimson-dark"
                        >
                          <FileText className="h-4 w-4" />
                          {reportLabel}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        {subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {subjects.map((item) => (
                              <span
                                key={item.id}
                                className="rounded-full bg-crimson/10 px-2 py-0.5 text-[11px] font-semibold text-crimson"
                              >
                                {item.subject}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-charcoal/40">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing ? (
        <AssessmentConsultantModal
          request={editing}
          assignedSubjects={
            editing.student ? subjectsForStudent(assignedSubjects, editing.student.id).map((row) => row.subject) : []
          }
          onClose={() => setEditing(null)}
          onPublished={(path, weakSubjects, report) => {
            onChange(editing.id, {
              status: 'completed',
              report,
              report_path: path,
              weak_subjects: weakSubjects,
            })
            setEditing((current) =>
              current
                ? { ...current, status: 'completed', report, report_path: path, weak_subjects: weakSubjects }
                : current,
            )
          }}
          onSubjectsSaved={(nextRows) => {
            if (editing.student) onSubjectsChange(editing.student.id, nextRows)
          }}
          onError={onError}
        />
      ) : null}
    </>
  )
}
