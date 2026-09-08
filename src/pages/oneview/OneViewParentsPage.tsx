import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, GraduationCap, Loader2, Plus, UserRound } from 'lucide-react'
import { AddParentFlyout } from '@/components/oneview/AddParentFlyout'
import { EnrolStudentFlyout } from '@/components/oneview/EnrolStudentFlyout'
import { OneViewListToolbar } from '@/components/oneview/OneViewListToolbar'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import { listParents } from '@/lib/parents'
import { matchesLetterFilter, type LetterFilter } from '@/lib/oneview-filters'
import type { ParentWithStudents, Student } from '@/lib/database.types'
import { cn } from '@/lib/utils'

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function locationLabel(student: Student) {
  const parts = [student.city, student.state].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

function parentHaystack(parent: ParentWithStudents) {
  return [
    parent.full_name,
    parent.email,
    parent.phone,
    ...parent.students.flatMap((student) => [
      student.full_name,
      student.email,
      student.grade,
      student.board,
      student.school_name,
      student.city,
      student.state,
    ]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function OneViewParentsPage() {
  const [parents, setParents] = useState<ParentWithStudents[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<LetterFilter>('all')
  const [childrenFilter, setChildrenFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [enrolParent, setEnrolParent] = useState<ParentWithStudents | null>(null)
  const [addParentOpen, setAddParentOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const rows = await listParents()
        if (!cancelled) setParents(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load parents.')
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

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    let rows = parents.filter((row) => {
      if (!matchesLetterFilter(row.full_name, letter)) return false
      if (childrenFilter === 'with-children' && row.students.length === 0) return false
      if (childrenFilter === 'no-children' && row.students.length > 0) return false
      if (!term) return true
      return parentHaystack(row).includes(term)
    })

    rows = [...rows].sort((a, b) => {
      if (sort === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      if (sort === 'name-asc') {
        return (a.full_name || a.email).localeCompare(b.full_name || b.email, 'en-IN')
      }
      if (sort === 'name-desc') {
        return (b.full_name || b.email).localeCompare(a.full_name || a.email, 'en-IN')
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return rows
  }, [childrenFilter, letter, parents, query, sort])

  const pagination = usePagination(filtered, [query, letter, childrenFilter, sort])

  function toggleParent(id: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleEnrolled(parentId: string, student: Student) {
    setParents((rows) =>
      rows.map((row) =>
        row.id === parentId ? { ...row, students: [student, ...row.students] } : row,
      ),
    )
    setExpanded((current) => new Set(current).add(parentId))
  }

  function handleParentCreated(parent: ParentWithStudents) {
    setParents((rows) => [parent, ...rows])
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader>
        <button
          type="button"
          onClick={() => setAddParentOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Add Parent
        </button>
      </OneViewPageHeader>

      <OneViewListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search parent or child…"
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? 'parent' : 'parents'}
        loading={loading}
        letter={letter}
        onLetterChange={setLetter}
        filters={[
          {
            id: 'children',
            label: 'Children',
            value: childrenFilter,
            onChange: setChildrenFilter,
            options: [
              { value: 'all', label: 'All parents' },
              { value: 'with-children', label: 'With children' },
              { value: 'no-children', label: 'No children' },
            ],
          },
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
          itemLabel={filtered.length === 1 ? 'parent' : 'parents'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-charcoal/[0.06] bg-white py-16 text-charcoal/45">
          <Loader2 className="h-5 w-5 animate-spin text-crimson" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/[0.06] bg-white py-16 text-center">
          <UserRound className="mx-auto h-8 w-8 text-charcoal/20" />
          <p className="mt-3 font-medium text-charcoal/60">
            {query || letter !== 'all' || childrenFilter !== 'all'
              ? 'No parents match your filters.'
              : 'No parent accounts yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagination.paginatedItems.map((parent) => {
            const isOpen = expanded.has(parent.id)
            const childCount = parent.students.length

            return (
              <section
                key={parent.id}
                className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white"
              >
                <div className="flex w-full items-start gap-3 px-4 py-4 sm:items-center sm:gap-4 sm:px-5">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label={isOpen ? 'Collapse parent' : 'Expand parent'}
                    onClick={() => toggleParent(parent.id)}
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-charcoal/[0.05] text-charcoal/55 transition-transform hover:bg-charcoal/[0.08] sm:mt-0',
                      isOpen && 'rotate-180 bg-crimson/[0.08] text-crimson',
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleParent(parent.id)}
                    className="min-w-0 flex-1 text-left transition-colors hover:opacity-90"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-charcoal">{parent.full_name || 'Unnamed'}</p>
                        <p className="mt-0.5 truncate text-sm text-charcoal/50">{parent.email}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {parent.phone ? (
                          <span className="rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-xs font-medium text-charcoal/60">
                            {parent.phone}
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-crimson/[0.08] px-2.5 py-1 text-xs font-bold text-crimson">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {childCount} {childCount === 1 ? 'child' : 'children'}
                        </span>
                        <span className="text-xs text-charcoal/40">Joined {formatWhen(parent.created_at)}</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEnrolParent(parent)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-crimson/20 bg-crimson/[0.06] px-3 py-2 text-xs font-semibold text-crimson transition-colors hover:bg-crimson hover:text-white sm:px-4 sm:text-sm"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Enrol
                  </button>
                </div>

                {isOpen ? (
                  <div className="border-t border-charcoal/[0.06] bg-[#faf7f7]/60">
                    {childCount === 0 ? (
                      <p className="px-5 py-8 text-sm text-charcoal/50">No students enrolled under this parent yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="table-head">
                            <tr>
                              <th className="px-5 py-3 font-semibold">Student</th>
                              <th className="px-5 py-3 font-semibold">Grade / Board</th>
                              <th className="px-5 py-3 font-semibold">School</th>
                              <th className="px-5 py-3 font-semibold">Location</th>
                              <th className="px-5 py-3 font-semibold">Login</th>
                              <th className="px-5 py-3 font-semibold">Enrolled</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parent.students.map((student) => (
                              <tr key={student.id} className="border-t border-charcoal/[0.05] bg-white">
                                <td className="px-5 py-3.5">
                                  <p className="font-semibold text-charcoal">{student.full_name}</p>
                                  <p className="mt-0.5 text-charcoal/50">{student.email || 'No login email'}</p>
                                </td>
                                <td className="px-5 py-3.5">
                                  <p className="font-medium">{student.grade || '—'}</p>
                                  <p className="mt-0.5 text-charcoal/50">{student.board || '—'}</p>
                                </td>
                                <td className="px-5 py-3.5 text-charcoal/70">{student.school_name || '—'}</td>
                                <td className="px-5 py-3.5 text-charcoal/70">{locationLabel(student)}</td>
                                <td className="px-5 py-3.5">
                                  <span
                                    className={
                                      student.user_id
                                        ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700'
                                        : 'inline-flex rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal/50'
                                    }
                                  >
                                    {student.user_id ? 'Active' : 'Pending'}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-5 py-3.5 text-charcoal/60">
                                  {formatWhen(student.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      )}

      {!loading && filtered.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="bottom"
          itemLabel={filtered.length === 1 ? 'parent' : 'parents'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <EnrolStudentFlyout
        parent={enrolParent}
        open={Boolean(enrolParent)}
        onClose={() => setEnrolParent(null)}
        onEnrolled={handleEnrolled}
      />

      <AddParentFlyout
        open={addParentOpen}
        onClose={() => setAddParentOpen(false)}
        onCreated={handleParentCreated}
      />
    </div>
  )
}
