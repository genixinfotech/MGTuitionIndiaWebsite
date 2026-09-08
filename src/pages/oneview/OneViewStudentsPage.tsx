import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, Loader2, Plus } from 'lucide-react'
import { AddStudentFlyout } from '@/components/oneview/AddStudentFlyout'
import { OneViewListToolbar } from '@/components/oneview/OneViewListToolbar'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import { listStudents } from '@/lib/students'
import { matchesLetterFilter, type LetterFilter, uniqueSorted } from '@/lib/oneview-filters'
import type { StudentWithParent } from '@/lib/database.types'

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function locationLabel(student: StudentWithParent) {
  const parts = [student.city, student.state].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

function schoolLocationLabel(student: StudentWithParent) {
  const school = student.school_name?.trim()
  const location = locationLabel(student)
  if (school && location) return `${school} · ${location}`
  return school || location || null
}

export function OneViewStudentsPage() {
  const [students, setStudents] = useState<StudentWithParent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<LetterFilter>('all')
  const [loginFilter, setLoginFilter] = useState('all')
  const [boardFilter, setBoardFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [addStudentOpen, setAddStudentOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const rows = await listStudents()
        if (!cancelled) setStudents(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load students.')
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

  const boardOptions = useMemo(() => uniqueSorted(students.map((row) => row.board)), [students])
  const gradeOptions = useMemo(() => uniqueSorted(students.map((row) => row.grade)), [students])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    return students.filter((row) => {
      if (!matchesLetterFilter(row.full_name, letter)) return false
      if (loginFilter === 'active' && !row.user_id) return false
      if (loginFilter === 'pending' && row.user_id) return false
      if (boardFilter !== 'all' && row.board !== boardFilter) return false
      if (gradeFilter !== 'all' && row.grade !== gradeFilter) return false
      if (!term) return true

      const haystack = [
        row.full_name,
        row.email,
        row.grade,
        row.board,
        row.school_name,
        row.city,
        row.state,
        row.parent?.full_name,
        row.parent?.email,
        row.parent?.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [boardFilter, gradeFilter, letter, loginFilter, query, students])

  const pagination = usePagination(filtered, [query, letter, loginFilter, boardFilter, gradeFilter])

  function handleStudentCreated(student: StudentWithParent) {
    setStudents((rows) => [student, ...rows])
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader>
        <button
          type="button"
          onClick={() => setAddStudentOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </OneViewPageHeader>

      <OneViewListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search name, email, board…"
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? 'student' : 'students'}
        loading={loading}
        letter={letter}
        onLetterChange={setLetter}
        filters={[
          {
            id: 'login',
            label: 'Login status',
            value: loginFilter,
            onChange: setLoginFilter,
            options: [
              { value: 'all', label: 'All logins' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
            ],
          },
          {
            id: 'board',
            label: 'Board',
            value: boardFilter,
            onChange: setBoardFilter,
            options: [
              { value: 'all', label: 'All boards' },
              ...boardOptions.map((board) => ({ value: board, label: board })),
            ],
          },
          {
            id: 'grade',
            label: 'Grade',
            value: gradeFilter,
            onChange: setGradeFilter,
            options: [
              { value: 'all', label: 'All grades' },
              ...gradeOptions.map((grade) => ({ value: grade, label: grade })),
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
          itemLabel={filtered.length === 1 ? 'student' : 'students'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
              <thead className="table-head">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Student</th>
                <th className="px-5 py-3.5 font-semibold">Grade / Board</th>
                <th className="px-5 py-3.5 font-semibold">Parent</th>
                <th className="px-5 py-3.5 font-semibold">Login</th>
                <th className="px-5 py-3.5 font-semibold">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-charcoal/45">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-crimson" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <GraduationCap className="mx-auto h-8 w-8 text-charcoal/20" />
                    <p className="mt-3 font-medium text-charcoal/60">
                      {query || letter !== 'all' || loginFilter !== 'all' || boardFilter !== 'all' || gradeFilter !== 'all'
                        ? 'No students match your filters.'
                        : 'No students enrolled yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((row) => {
                  const schoolLocation = schoolLocationLabel(row)

                  return (
                    <tr key={row.id} className="border-t border-charcoal/[0.05] hover:bg-[#faf7f7]/80">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-charcoal">{row.full_name}</p>
                        <p className="mt-0.5 text-charcoal/50">{row.email || 'No login email'}</p>
                        {schoolLocation ? (
                          <p className="mt-1 text-xs text-charcoal/45">{schoolLocation}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{row.grade || '—'}</p>
                        <p className="mt-0.5 text-charcoal/50">{row.board || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{row.parent?.full_name || '—'}</p>
                        <p className="mt-0.5 text-charcoal/50">{row.parent?.email || '—'}</p>
                        {row.parent?.phone ? (
                          <p className="mt-0.5 text-charcoal/40">{row.parent.phone}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            row.user_id
                              ? 'inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700'
                              : 'inline-flex rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-charcoal/50'
                          }
                        >
                          {row.user_id ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-charcoal/60">{formatWhen(row.created_at)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {!loading && filtered.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="bottom"
          itemLabel={filtered.length === 1 ? 'student' : 'students'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <AddStudentFlyout
        open={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        onCreated={handleStudentCreated}
      />
    </div>
  )
}
