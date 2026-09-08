import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Plus, Users } from 'lucide-react'
import { AddTutorFlyout } from '@/components/oneview/AddTutorFlyout'
import { OneViewListToolbar } from '@/components/oneview/OneViewListToolbar'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import { listTutors } from '@/lib/tutors'
import { matchesLetterFilter, type LetterFilter } from '@/lib/oneview-filters'
import type { Profile } from '@/lib/database.types'

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function OneViewTutorsPage() {
  const [tutors, setTutors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<LetterFilter>('all')
  const [sort, setSort] = useState('newest')
  const [contact, setContact] = useState('all')
  const [addTutorOpen, setAddTutorOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const rows = await listTutors()
        if (!cancelled) setTutors(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load tutors.')
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

    let rows = tutors.filter((row) => {
      if (!matchesLetterFilter(row.full_name, letter)) return false
      if (contact === 'with-phone' && !row.phone?.trim()) return false
      if (contact === 'without-phone' && row.phone?.trim()) return false
      if (!term) return true
      const haystack = [row.full_name, row.email, row.phone].filter(Boolean).join(' ').toLowerCase()
      return haystack.includes(term)
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
  }, [contact, letter, query, sort, tutors])

  const pagination = usePagination(filtered, [query, letter, sort, contact])

  function handleTutorCreated(tutor: Profile) {
    setTutors((rows) => [tutor, ...rows])
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader>
        <button
          type="button"
          onClick={() => setAddTutorOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Add Tutor
        </button>
      </OneViewPageHeader>

      <OneViewListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search name, email, phone…"
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? 'tutor' : 'tutors'}
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
          {
            id: 'contact',
            label: 'Contact',
            value: contact,
            onChange: setContact,
            options: [
              { value: 'all', label: 'All tutors' },
              { value: 'with-phone', label: 'With phone' },
              { value: 'without-phone', label: 'Without phone' },
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
          itemLabel={filtered.length === 1 ? 'tutor' : 'tutors'}
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
                <th className="px-5 py-3.5 font-semibold">Tutor</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Phone</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-charcoal/45">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-crimson" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <Users className="mx-auto h-8 w-8 text-charcoal/20" />
                    <p className="mt-3 font-medium text-charcoal/60">
                      {query || letter !== 'all' ? 'No tutors match your filters.' : 'No tutors on file yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((row) => (
                  <tr key={row.id} className="border-t border-charcoal/[0.05] hover:bg-[#faf7f7]/80">
                    <td className="px-5 py-4">
                      <Link
                        to={`/oneview/tutors/${row.id}`}
                        className="font-semibold text-charcoal transition-colors hover:text-crimson"
                      >
                        {row.full_name || 'Unnamed'}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-charcoal/70">{row.email}</td>
                    <td className="px-5 py-4 text-charcoal/70">{row.phone || '—'}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-charcoal/60">{formatWhen(row.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {!loading && filtered.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="bottom"
          itemLabel={filtered.length === 1 ? 'tutor' : 'tutors'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <AddTutorFlyout
        open={addTutorOpen}
        onClose={() => setAddTutorOpen(false)}
        onCreated={handleTutorCreated}
      />
    </div>
  )
}
