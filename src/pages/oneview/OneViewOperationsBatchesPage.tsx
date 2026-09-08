import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Loader2, Plus } from 'lucide-react'
import { BatchAccordionItem } from '@/components/operations/BatchAccordionItem'
import { CreateBatchFlyout } from '@/components/operations/CreateBatchFlyout'
import { EditBatchFlyout } from '@/components/operations/EditBatchFlyout'
import { OneViewListToolbar } from '@/components/oneview/OneViewListToolbar'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import {
  assignStudentToBatch,
  listAllBatchStudents,
  listBatches,
  removeStudentFromBatch,
  studentEligibleForBatch,
  type Batch,
  type BatchStudentRow,
} from '@/lib/batches'
import { matchesLetterFilter, type LetterFilter } from '@/lib/oneview-filters'
import { listQualityManagers } from '@/lib/staff'
import { listStudents } from '@/lib/students'
import { listTutors } from '@/lib/tutors'
import { getSupabase } from '@/lib/supabase'
import type { Profile, Student } from '@/lib/database.types'

type BatchRow = Batch & {
  qualityManagerLabel: string
  tutorLabel: string
}

function staffLabel(profile: { full_name: string | null; email: string } | null | undefined) {
  if (!profile) return '—'
  return profile.full_name?.trim() || profile.email
}

export function OneViewOperationsBatchesPage() {
  const [batches, setBatches] = useState<BatchRow[]>([])
  const [batchStudents, setBatchStudents] = useState<BatchStudentRow[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [paidSubjectsByStudent, setPaidSubjectsByStudent] = useState<Map<number, string[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<LetterFilter>('all')
  const [sort, setSort] = useState('newest')
  const [createOpen, setCreateOpen] = useState(false)
  const [editBatch, setEditBatch] = useState<Batch | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [assignDrafts, setAssignDrafts] = useState<Record<number, string>>({})
  const [assigningBatchId, setAssigningBatchId] = useState<number | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [batchRows, qualityManagers, tutors, assignmentRows, studentRows, admissionsResult] =
          await Promise.all([
            listBatches(),
            listQualityManagers(),
            listTutors(),
            listAllBatchStudents(),
            listStudents(),
            getSupabase().from('admissions').select('student_id, subjects'),
          ])
        if (cancelled) return

        if (admissionsResult.error) {
          throw new Error(admissionsResult.error.message || 'Unable to load admissions.')
        }

        const qualityManagerById = new Map(qualityManagers.map((manager) => [manager.id, manager]))
        const tutorById = new Map(tutors.map((tutor) => [tutor.id, tutor]))
        const paidMap = new Map<number, string[]>()
        for (const row of admissionsResult.data ?? []) {
          paidMap.set(row.student_id as number, (row.subjects as string[]) ?? [])
        }

        setBatches(
          batchRows.map((row) => ({
            ...row,
            qualityManagerLabel: staffLabel(qualityManagerById.get(row.quality_manager_id)),
            tutorLabel: staffLabel(tutorById.get(row.tutor_id)),
          })),
        )
        setBatchStudents(assignmentRows)
        setStudents(studentRows)
        setPaidSubjectsByStudent(paidMap)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load batches.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const studentsByBatch = useMemo(() => {
    const map = new Map<number, BatchStudentRow[]>()
    for (const row of batchStudents) {
      const bucket = map.get(row.batch_id) ?? []
      bucket.push(row)
      map.set(row.batch_id, bucket)
    }
    return map
  }, [batchStudents])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    let rows = batches.filter((row) => {
      if (!matchesLetterFilter(row.name, letter)) return false
      if (!term) return true
      const allocated = (studentsByBatch.get(row.id) ?? [])
        .map((item) => item.student?.full_name)
        .filter(Boolean)
      const haystack = [
        row.name,
        row.hero_full_name,
        row.subject,
        row.syllabus,
        row.grade,
        row.qualityManagerLabel,
        row.tutorLabel,
        ...allocated,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })

    rows = [...rows].sort((a, b) => {
      if (sort === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sort === 'name-asc') {
        return a.name.localeCompare(b.name, 'en-IN')
      }
      if (sort === 'name-desc') {
        return b.name.localeCompare(a.name, 'en-IN')
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return rows
  }, [batches, letter, query, sort, studentsByBatch])

  const pagination = usePagination(filtered, [query, letter, sort])

  function toggleBatch(batchId: number) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })
  }

  function eligibleStudentsForBatch(batch: Batch, allocated: BatchStudentRow[]) {
    const assignedIds = new Set(allocated.map((row) => row.student_id))
    const paidSubjects = (studentId: number) => paidSubjectsByStudent.get(studentId) ?? []

    return students
      .filter((student) =>
        studentEligibleForBatch(
          student,
          batch,
          paidSubjects(student.id),
          allocated.length,
          assignedIds,
        ),
      )
      .map((student) => ({
        id: student.id,
        full_name: student.full_name,
        email: student.email,
      }))
  }

  function handleCreated(
    batch: Batch,
    qualityManagers: Array<{ id: string; full_name: string | null; email: string }>,
    tutors: Profile[],
  ) {
    const qualityManager = qualityManagers.find((row) => row.id === batch.quality_manager_id)
    const tutor = tutors.find((row) => row.id === batch.tutor_id)
    setBatches((rows) => [
      {
        ...batch,
        qualityManagerLabel: staffLabel(qualityManager ?? null),
        tutorLabel: staffLabel(tutor ?? null),
      },
      ...rows,
    ])
    setExpanded((current) => new Set(current).add(batch.id))
  }

  function handleUpdated(
    batch: Batch,
    qualityManagers: Array<{ id: string; full_name: string | null; email: string }>,
    tutors: Profile[],
  ) {
    const qualityManager = qualityManagers.find((row) => row.id === batch.quality_manager_id)
    const tutor = tutors.find((row) => row.id === batch.tutor_id)
    setBatches((rows) =>
      rows.map((row) =>
        row.id === batch.id
          ? {
              ...batch,
              qualityManagerLabel: staffLabel(qualityManager ?? null),
              tutorLabel: staffLabel(tutor ?? null),
            }
          : row,
      ),
    )
  }

  async function handleAssign(batch: Batch) {
    const studentId = Number(assignDrafts[batch.id])
    if (!studentId) return

    setAssigningBatchId(batch.id)
    setError('')
    try {
      const row = await assignStudentToBatch(batch.id, studentId)
      setBatchStudents((rows) => [...rows, row])
      setAssignDrafts((current) => ({ ...current, [batch.id]: '' }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to allocate this student.')
    } finally {
      setAssigningBatchId(null)
    }
  }

  async function handleRemove(batchStudentId: number) {
    setRemovingId(batchStudentId)
    setError('')
    try {
      await removeStudentFromBatch(batchStudentId)
      setBatchStudents((rows) => rows.filter((row) => row.id !== batchStudentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove this student.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Batches" icon={Layers}>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Create batch
        </button>
      </OneViewPageHeader>

      <OneViewListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search batch, subject, tutor, student…"
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? 'batch' : 'batches'}
        loading={loading}
        letter={letter}
        onLetterChange={setLetter}
        filters={[
          {
            id: 'sort',
            label: 'Sort by',
            value: sort,
            onChange: setSort,
            options: [
              { value: 'newest', label: 'Newest first' },
              { value: 'oldest', label: 'Oldest first' },
              { value: 'name-asc', label: 'Name A–Z' },
              { value: 'name-desc', label: 'Name Z–A' },
            ],
          },
        ]}
      />

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">{error}</p>
      ) : null}

      {!loading && filtered.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="top"
          itemLabel={filtered.length === 1 ? 'batch' : 'batches'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-charcoal/[0.06] bg-white px-6 py-16 text-sm text-charcoal/50">
          <Loader2 className="h-5 w-5 animate-spin text-crimson" />
          Loading batches…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-6 py-16 text-center">
          <p className="text-sm text-charcoal/50">
            {batches.length === 0
              ? 'No batches yet. Create the first batch to get started.'
              : 'No batches match your search.'}
          </p>
          {batches.length === 0 ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-crimson hover:text-crimson-dark"
            >
              <Plus className="h-4 w-4" />
              Create batch
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {pagination.paginatedItems.map((batch) => {
            const allocated = studentsByBatch.get(batch.id) ?? []
            const eligible = eligibleStudentsForBatch(batch, allocated)

            return (
              <BatchAccordionItem
                key={batch.id}
                batch={{
                  id: batch.id,
                  name: batch.name,
                  hero_full_name: batch.hero_full_name,
                  subject: batch.subject,
                  syllabus: batch.syllabus,
                  grade: batch.grade,
                  days_of_week: batch.days_of_week,
                  start_time: batch.start_time,
                  end_time: batch.end_time,
                  start_date: batch.start_date,
                  min_students: batch.min_students,
                  max_students: batch.max_students,
                  qualityManagerLabel: batch.qualityManagerLabel,
                  tutorLabel: batch.tutorLabel,
                  tutorId: batch.tutor_id,
                }}
                students={allocated}
                eligibleStudents={eligible}
                isOpen={expanded.has(batch.id)}
                onToggle={() => toggleBatch(batch.id)}
                assignStudentId={assignDrafts[batch.id] ?? ''}
                onAssignStudentIdChange={(value) =>
                  setAssignDrafts((current) => ({ ...current, [batch.id]: value }))
                }
                onAssign={() => void handleAssign(batch)}
                onRemove={(id) => void handleRemove(id)}
                onEdit={() => setEditBatch(batch)}
                assigning={assigningBatchId === batch.id}
                removingId={removingId}
              />
            )
          })}
        </div>
      )}

      {!loading && filtered.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="bottom"
          itemLabel={filtered.length === 1 ? 'batch' : 'batches'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <Link
        to="/oneview/operations"
        className="inline-flex text-sm font-semibold text-crimson hover:text-crimson-dark"
      >
        Back to Operations
      </Link>

      <CreateBatchFlyout
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(batch) => {
          void Promise.all([listQualityManagers(), listTutors()])
            .then(([qualityManagers, tutors]) => handleCreated(batch, qualityManagers, tutors))
            .catch(() =>
              setBatches((rows) => [
                {
                  ...batch,
                  qualityManagerLabel: '—',
                  tutorLabel: '—',
                },
                ...rows,
              ]),
            )
        }}
      />

      <EditBatchFlyout
        open={editBatch !== null}
        batch={editBatch}
        allocatedCount={editBatch ? (studentsByBatch.get(editBatch.id) ?? []).length : 0}
        onClose={() => setEditBatch(null)}
        onUpdated={(batch) => {
          void Promise.all([listQualityManagers(), listTutors()])
            .then(([qualityManagers, tutors]) => handleUpdated(batch, qualityManagers, tutors))
            .catch(() =>
              setBatches((rows) =>
                rows.map((row) =>
                  row.id === batch.id
                    ? { ...batch, qualityManagerLabel: '—', tutorLabel: '—' }
                    : row,
                ),
              ),
            )
        }}
      />
    </div>
  )
}
