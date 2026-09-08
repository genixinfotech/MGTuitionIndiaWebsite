import { useState } from 'react'
import { Globe, Loader2 } from 'lucide-react'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import { assessmentStatuses } from '@/lib/assessments'
import type { AssessmentStatus } from '@/lib/database.types'
import type { SubjectExpertOption } from '@/lib/subject-experts'
import {
  assignWebAssessmentExpert,
  updateWebAssessmentStatus,
  type WebAssessmentRequestDetails,
} from '@/lib/web-assessments'

export type WebAssessmentPatch = {
  status?: AssessmentStatus
  assigned_expert_id?: string | null
}

export function WebAssessmentQueue({
  rows,
  subjectExperts,
  loading,
  onChange,
  onError,
}: {
  rows: WebAssessmentRequestDetails[]
  subjectExperts: SubjectExpertOption[]
  loading: boolean
  onChange: (id: number, patch: WebAssessmentPatch) => void
  onError: (message: string) => void
}) {
  const [savingId, setSavingId] = useState<number | null>(null)
  const pagination = usePagination(rows)

  async function onStatus(id: number, status: AssessmentStatus) {
    const row = rows.find((item) => item.id === id)
    const previous = row?.status
    onChange(id, { status })
    setSavingId(id)
    try {
      await updateWebAssessmentStatus(id, status)
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
      await assignWebAssessmentExpert(id, nextExpertId)
    } catch (err) {
      onChange(id, { assigned_expert_id: previous })
      onError(err instanceof Error ? err.message : 'Unable to assign this subject expert.')
    } finally {
      setSavingId(null)
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
            <Globe className="h-5 w-5 text-crimson" />
            Assessment Requests (Web)
          </div>
          <p className="mt-1 text-sm text-charcoal/50">
            Assign subject experts and update status for website leads.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="table-head">
              <tr>
                <th className="px-5 py-3 font-semibold">Submitted</th>
                <th className="px-5 py-3 font-semibold">Subject</th>
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Parent</th>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Subject expert</th>
                <th className="px-5 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-charcoal/50">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-crimson" />
                      Loading website requests…
                    </span>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-charcoal/50">
                    No website assessment requests yet.
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((row) => (
                  <tr key={row.id} className="border-t border-charcoal/[0.05] align-top">
                    <td className="whitespace-nowrap px-5 py-3 text-charcoal/60">
                      {new Date(row.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-crimson/10 px-2.5 py-1 text-xs font-semibold text-crimson">
                        {row.subject}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{row.student_name}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{row.parent_name}</p>
                      <p className="text-charcoal/45">{row.email}</p>
                      {row.phone ? <p className="text-charcoal/45">{row.phone}</p> : null}
                    </td>
                    <td className="px-5 py-3">
                      <p>{row.grade}</p>
                      <p className="text-charcoal/45">{row.board}</p>
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
                    <td className="max-w-xs px-5 py-3 text-charcoal/55">
                      {[row.notes, row.referral ? `Referral: ${row.referral}` : null]
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                  </tr>
                ))
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
    </>
  )
}
