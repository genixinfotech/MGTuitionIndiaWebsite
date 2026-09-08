import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, UserCog } from 'lucide-react'
import { CreateUserFlyout } from '@/components/oneview/CreateUserFlyout'
import { OneViewListToolbar } from '@/components/oneview/OneViewListToolbar'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import { matchesLetterFilter, type LetterFilter } from '@/lib/oneview-filters'
import { creatableUserRoles, roleEntityTableLabel, roleLabel } from '@/lib/roles'
import { listUsers, userMatchesRoleFilter, type PortalUser } from '@/lib/users'

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const roleFilterOptions = [
  { value: 'all', label: 'All roles' },
  { value: 'internal', label: 'Internal team' },
  ...creatableUserRoles.map((role) => ({ value: role, label: roleLabel(role) })),
]

export function OneViewUsersPage() {
  const [users, setUsers] = useState<PortalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<LetterFilter>('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sort, setSort] = useState('newest')
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const rows = await listUsers()
        if (!cancelled) setUsers(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load users.')
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

    let rows = users.filter((row) => {
      if (!matchesLetterFilter(row.full_name || row.email, letter)) return false
      if (!userMatchesRoleFilter(String(row.role), roleFilter)) return false
      if (!term) return true
      const haystack = [row.full_name, row.email, row.phone, roleLabel(row.role)]
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
        return (a.full_name || a.email).localeCompare(b.full_name || b.email, 'en-IN')
      }
      if (sort === 'name-desc') {
        return (b.full_name || b.email).localeCompare(a.full_name || a.email, 'en-IN')
      }
      if (sort === 'role-asc') {
        return roleLabel(a.role).localeCompare(roleLabel(b.role), 'en-IN')
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return rows
  }, [letter, query, roleFilter, sort, users])

  const pagination = usePagination(filtered, [query, letter, roleFilter, sort])

  function handleUserCreated(user: PortalUser) {
    setUsers((rows) => [user, ...rows])
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Users & Roles" icon={UserCog}>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" />
          Create user
        </button>
      </OneViewPageHeader>

      <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-6 py-5 md:px-8">
        <p className="max-w-3xl text-sm leading-relaxed text-charcoal/55">
          Provision platform logins for internal team members, tutors, and parents. Each user gets an
          auth account, a profile with the selected role, and a linked record in{' '}
          <span className="font-medium text-charcoal">tutors</span>,{' '}
          <span className="font-medium text-charcoal">quality managers</span>,{' '}
          <span className="font-medium text-charcoal">student consultants</span>, or{' '}
          <span className="font-medium text-charcoal">parents</span> when applicable. Students are
          enrolled from Parents.
        </p>
      </div>

      <OneViewListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search name, email, phone, role…"
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? 'user' : 'users'}
        loading={loading}
        letter={letter}
        onLetterChange={setLetter}
        filters={[
          {
            id: 'role',
            label: 'Role',
            value: roleFilter,
            onChange: setRoleFilter,
            options: roleFilterOptions,
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
              { value: 'role-asc', label: 'Role A–Z' },
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
          itemLabel={filtered.length === 1 ? 'user' : 'users'}
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
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Role</th>
                <th className="px-5 py-3.5 font-semibold">Linked record</th>
                <th className="px-5 py-3.5 font-semibold">Email</th>
                <th className="px-5 py-3.5 font-semibold">Phone</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-charcoal/45">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-crimson" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <UserCog className="mx-auto h-8 w-8 text-charcoal/20" />
                    <p className="mt-3 font-medium text-charcoal/60">
                      {query || letter !== 'all' || roleFilter !== 'all'
                        ? 'No users match your filters.'
                        : 'No users on file yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((row) => (
                  <tr key={row.id} className="border-t border-charcoal/[0.05] hover:bg-[#faf7f7]/80">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-charcoal">{row.full_name || 'Unnamed'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-charcoal/[0.05] px-2.5 py-1 text-xs font-semibold text-charcoal/70">
                        {roleLabel(row.role)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-charcoal/60">
                      {roleEntityTableLabel(row.role) ?? '—'}
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
          itemLabel={filtered.length === 1 ? 'user' : 'users'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}

      <CreateUserFlyout
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleUserCreated}
      />
    </div>
  )
}
