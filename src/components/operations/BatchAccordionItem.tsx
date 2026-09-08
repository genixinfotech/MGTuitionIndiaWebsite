import { Link } from 'react-router-dom'
import { GraduationCap, Loader2, Pencil, Trash2, UserRound, Users, ChevronDown } from 'lucide-react'
import { formatBatchSchedule } from '@/lib/batch-heroes'
import type { BatchStudentRow } from '@/lib/batches'
import { cn } from '@/lib/utils'

type BatchAccordionItemProps = {
  batch: {
    id: number
    name: string
    hero_full_name: string
    subject: string
    syllabus: string
    grade: string
    days_of_week: number[]
    start_time: string
    end_time: string
    start_date: string
    min_students: number
    max_students: number
    qualityManagerLabel: string
    tutorLabel: string
    tutorId: string
  }
  students: BatchStudentRow[]
  eligibleStudents: Array<{ id: number; full_name: string; email: string | null }>
  isOpen: boolean
  onToggle: () => void
  assignStudentId: string
  onAssignStudentIdChange: (value: string) => void
  onAssign: () => void
  onRemove: (batchStudentId: number) => void
  onEdit: () => void
  assigning: boolean
  removingId: number | null
}

export function BatchAccordionItem({
  batch,
  students,
  eligibleStudents,
  isOpen,
  onToggle,
  assignStudentId,
  onAssignStudentIdChange,
  onAssign,
  onRemove,
  onEdit,
  assigning,
  removingId,
}: BatchAccordionItemProps) {
  const atCapacity = students.length >= batch.max_students
  const schedule = formatBatchSchedule({
    days_of_week: batch.days_of_week,
    start_time: batch.start_time,
    end_time: batch.end_time,
    start_date: batch.start_date,
  })

  return (
    <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-[#faf7f7]/80 sm:items-center sm:gap-4 sm:px-5"
      >
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-charcoal/[0.05] text-charcoal/55 transition-transform sm:mt-0',
            isOpen && 'rotate-180 bg-crimson/[0.08] text-crimson',
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-charcoal">{batch.name}</p>
              <p className="mt-0.5 truncate text-sm text-charcoal/50">
                {batch.syllabus} · {batch.grade} · {batch.subject}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-xs font-medium text-charcoal/60">
                {schedule}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson/[0.08] px-2.5 py-1 text-xs font-bold text-crimson">
                <GraduationCap className="h-3.5 w-3.5" />
                {students.length}/{batch.max_students} students
              </span>
              <span className="rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-xs font-medium text-charcoal/60">
                {batch.tutorLabel}
              </span>
            </div>
          </div>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-charcoal/[0.06] bg-[#faf7f7]/60 px-4 py-5 sm:px-5">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-3.5 py-2 text-sm font-semibold text-charcoal transition-colors hover:border-crimson/30 hover:text-crimson"
            >
              <Pencil className="h-4 w-4" />
              Edit batch
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-charcoal/[0.06] bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                <Users className="h-4 w-4 text-crimson" />
                Tutor
              </div>
              <p className="mt-2 font-semibold text-charcoal">{batch.tutorLabel}</p>
              <Link
                to={`/oneview/tutors/${batch.tutorId}`}
                className="mt-2 inline-flex text-sm font-semibold text-crimson hover:text-crimson-dark"
              >
                View tutor profile
              </Link>
              <p className="mt-4 text-xs text-charcoal/45">
                Quality manager: <span className="font-medium text-charcoal/70">{batch.qualityManagerLabel}</span>
              </p>
              <p className="mt-1 text-xs text-charcoal/45">
                Capacity: {batch.min_students}–{batch.max_students} students · Hero: {batch.hero_full_name}
              </p>
            </div>

            <div className="rounded-xl border border-charcoal/[0.06] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                  <UserRound className="h-4 w-4 text-crimson" />
                  Allocated students
                </div>
                {!atCapacity ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <select
                      value={assignStudentId}
                      onChange={(event) => onAssignStudentIdChange(event.target.value)}
                      className="input-field max-w-[180px] py-2 text-sm"
                    >
                      <option value="">
                        {eligibleStudents.length ? 'Add student…' : 'No matches'}
                      </option>
                      {eligibleStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.full_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!assignStudentId || assigning}
                      onClick={onAssign}
                      className="shrink-0 rounded-full bg-crimson px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    >
                      {assigning ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-charcoal/45">Batch is full</span>
                )}
              </div>

              {students.length === 0 ? (
                <p className="mt-4 text-sm text-charcoal/50">No students allocated yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {students.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-charcoal/[0.06] px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-charcoal">
                          {row.student?.full_name || 'Unnamed student'}
                        </p>
                        <p className="truncate text-xs text-charcoal/50">
                          {row.student?.email || 'No login email'}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={removingId === row.id}
                        onClick={() => onRemove(row.id)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-charcoal/40 transition-colors hover:bg-crimson/10 hover:text-crimson disabled:opacity-40"
                        aria-label={`Remove ${row.student?.full_name || 'student'}`}
                      >
                        {removingId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
