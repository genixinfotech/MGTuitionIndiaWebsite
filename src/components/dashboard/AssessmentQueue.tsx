import { useState } from 'react'
import { ClipboardList, FileText, ShieldCheck } from 'lucide-react'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import {
  admissionForStudent,
  assessmentStatuses,
  assignAssessmentExpert,
  formatPreferredSlot,
  paidMonthsForSubject,
  isAdmissionPaidForSubject,
  monthlyRateForTuitionSubject,
  secureAdmissionForSubject,
  subjectsForStudent,
  updateAssessmentStatus,
} from '@/lib/assessments'
import type {
  Admission,
  AssessmentRequestDetails,
  AssessmentStatus,
  StudentSubject,
  WeakSubjectNote,
} from '@/lib/database.types'
import type { SubjectExpertOption } from '@/lib/subject-experts'
import { AssessmentConsultantFlyout } from '@/components/dashboard/AssessmentConsultantFlyout'

export type AssessmentPatch = {
  status?: AssessmentStatus
  report?: string
  report_path?: string | null
  weak_subjects?: WeakSubjectNote[]
  assigned_expert_id?: string | null
}

export function AssessmentQueue({
  rows,
  assignedSubjects,
  admissions = [],
  subjectExperts,
  loading,
  onChange,
  onSubjectsChange,
  onAdmissionChange,
  onError,
}: {
  rows: AssessmentRequestDetails[]
  assignedSubjects: StudentSubject[]
  admissions?: Admission[]
  subjectExperts: SubjectExpertOption[]
  loading: boolean
  onChange: (id: number, patch: AssessmentPatch) => void
  onSubjectsChange: (studentId: number, rows: StudentSubject[]) => void
  onAdmissionChange?: (row: Admission) => void
  onError: (message: string) => void
}) {
  const [savingId, setSavingId] = useState<number | null>(null)
  const [securingId, setSecuringId] = useState<number | null>(null)
  const [editing, setEditing] = useState<AssessmentRequestDetails | null>(null)
  const pagination = usePagination(rows)

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

  async function onAssignExpert(id: number, expertId: string) {
    const row = rows.find((item) => item.id === id)
    const previous = row?.assigned_expert_id ?? null
    const nextExpertId = expertId || null
    onChange(id, { assigned_expert_id: nextExpertId })
    setSavingId(id)
    try {
      await assignAssessmentExpert(id, nextExpertId)
    } catch (err) {
      onChange(id, { assigned_expert_id: previous })
      onError(err instanceof Error ? err.message : 'Unable to assign this subject expert.')
    } finally {
      setSavingId(null)
    }
  }

  async function onSecureAdmission(row: AssessmentRequestDetails, renewal = false) {
    if (!row.student || !row.parent_id || !onAdmissionChange) return
    const admission = admissionForStudent(admissions, row.student_id)
    const alreadyPaid = isAdmissionPaidForSubject(admission, row.subject)
    if (alreadyPaid && !renewal) return

    const tuitionSubjects = subjectsForStudent(assignedSubjects, row.student.id)
    const monthlyRate = monthlyRateForTuitionSubject(row.student, tuitionSubjects, row.subject)

    setSecuringId(row.id)
    try {
      const updated = await secureAdmissionForSubject({
        studentId: row.student_id,
        parentId: row.parent_id,
        subject: row.subject,
        monthlyRate,
      })
      onAdmissionChange(updated)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to record this payment.')
    } finally {
      setSecuringId(null)
    }
  }

  return (
    <>
      {!loading && rows.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="top"
          itemLabel={rows.length === 1 ? 'request' : 'requests'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
        <div className="border-b border-charcoal/[0.06] px-5 py-4">
          <div className="flex items-center gap-2 font-bold">
            <ClipboardList className="h-5 w-5 text-crimson" />
            Assessment Requests (Portal)
          </div>
          <p className="mt-1 text-sm text-charcoal/50">
            Assign experts, prepare reports, and manage tuition subjects for enrolled students.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-5 py-3 font-semibold">Preferred slot</th>
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">Parent</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Subject expert</th>
                <th className="px-5 py-3 font-semibold">Report</th>
                <th className="px-5 py-3 font-semibold">Tuition</th>
                <th className="px-5 py-3 font-semibold">Admission</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-charcoal/50">
                    No assessment requests yet.
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((row) => {
                  const student = row.student
                  const parent = row.parent
                  const tuitionSubjects = student ? subjectsForStudent(assignedSubjects, student.id) : []
                  const admission = student ? admissionForStudent(admissions, student.id) : null
                  const admissionSecured = isAdmissionPaidForSubject(admission, row.subject)
                  const reportLabel = row.report_path ? 'Update' : 'Prepare Report'
                  return (
                    <tr key={row.id} className="border-t border-charcoal/[0.05] align-top">
                      <td className="whitespace-nowrap px-5 py-3 text-charcoal/60">
                        {formatPreferredSlot(row.preferred_date, row.preferred_time)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-crimson/10 px-2.5 py-1 text-xs font-semibold text-crimson">
                          {row.subject}
                        </span>
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
                        <select
                          className="max-w-[180px] rounded-lg border border-charcoal/10 bg-white px-2 py-1 text-sm disabled:opacity-60"
                          value={row.assigned_expert_id ?? ''}
                          disabled={savingId === row.id}
                          onChange={(e) => void onAssignExpert(row.id, e.target.value)}
                        >
                          <option value="">Assign expert…</option>
                          {subjectExperts.map((expert) => (
                            <option key={expert.id} value={expert.id}>
                              {expert.full_name || expert.email}
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
                        {tuitionSubjects.some((item) => item.subject === row.subject) ? (
                          <span className="rounded-full bg-charcoal/5 px-2 py-0.5 text-[11px] font-semibold text-charcoal/70">
                            {row.subject}
                          </span>
                        ) : (
                          <span className="text-charcoal/40">Not assigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {admissionSecured ? (
                          onAdmissionChange ? (
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {paidMonthsForSubject(admission, row.subject)}{' '}
                                {paidMonthsForSubject(admission, row.subject) === 1 ? 'month' : 'months'}
                              </span>
                              <button
                                type="button"
                                disabled={securingId === row.id || savingId === row.id}
                                onClick={() => void onSecureAdmission(row, true)}
                                className="block rounded-full border border-charcoal/15 px-3 py-1 text-[11px] font-semibold text-charcoal/70 transition hover:border-crimson/30 hover:text-crimson disabled:opacity-60"
                              >
                                {securingId === row.id ? 'Recording…' : 'Record month payment'}
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Secured
                            </span>
                          )
                        ) : onAdmissionChange ? (
                          <button
                            type="button"
                            disabled={securingId === row.id || savingId === row.id}
                            onClick={() => void onSecureAdmission(row)}
                            className="inline-flex items-center gap-1.5 rounded-full border-2 border-crimson bg-crimson px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-crimson-dark disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {securingId === row.id ? 'Securing…' : 'Secure admission'}
                          </button>
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

      {!loading && rows.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="bottom"
          itemLabel={rows.length === 1 ? 'request' : 'requests'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      {editing ? (
        <AssessmentConsultantFlyout
          request={editing}
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
