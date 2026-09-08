import { useEffect, useMemo, useState } from 'react'
import { Inbox, Loader2 } from 'lucide-react'
import { OneViewListToolbar } from '@/components/oneview/OneViewListToolbar'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { usePagination } from '@/hooks/usePagination'
import {
  enquiryDetailLines,
  enquiryHaystack,
  enquiryKindLabels,
  enquiryStatusLabels,
  enquiryStatuses,
  listEnquiries,
  updateEnquiryStatus,
} from '@/lib/enquiries'
import { matchesLetterFilter, type LetterFilter } from '@/lib/oneview-filters'
import type { Enquiry, EnquiryKind, EnquiryStatus } from '@/lib/database.types'
import { cn } from '@/lib/utils'

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusTone(status: EnquiryStatus) {
  if (status === 'new') return 'bg-crimson/[0.08] text-crimson'
  if (status === 'contacted') return 'bg-amber-50 text-amber-800'
  if (status === 'enrolled') return 'bg-emerald-50 text-emerald-700'
  return 'bg-charcoal/[0.05] text-charcoal/55'
}

const emptyMessages: Record<EnquiryKind, string> = {
  contact: 'No general enquiries yet.',
  trial: 'No free trial enquiries yet.',
  tutor: 'No tutor applications yet.',
}

export function OneViewEnquiryList({ kind, title }: { kind: EnquiryKind; title?: string }) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<LetterFilter>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const rows = await listEnquiries(kind)
        if (!cancelled) setEnquiries(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load enquiries.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [kind])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    let rows = enquiries.filter((row) => {
      if (!matchesLetterFilter(row.name, letter)) return false
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!term) return true
      return enquiryHaystack(row).includes(term)
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
  }, [enquiries, letter, query, sort, statusFilter])

  const pagination = usePagination(filtered, [kind, query, letter, statusFilter, sort])

  async function handleStatusChange(id: number, status: EnquiryStatus) {
    setError('')
    setEnquiries((rows) => rows.map((row) => (row.id === id ? { ...row, status } : row)))
    try {
      await updateEnquiryStatus(id, status)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update enquiry status.')
    }
  }

  const kindLabel = enquiryKindLabels[kind].toLowerCase()

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title={title} />

      <OneViewListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder={`Search ${kindLabel}…`}
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? 'enquiry' : 'enquiries'}
        loading={loading}
        letter={letter}
        onLetterChange={setLetter}
        filters={[
          {
            id: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'all', label: 'All statuses' },
              ...enquiryStatuses.map((status) => ({
                value: status,
                label: enquiryStatusLabels[status],
              })),
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
          itemLabel={filtered.length === 1 ? 'enquiry' : 'enquiries'}
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
                <th className="px-5 py-3.5 font-semibold">Submitted</th>
                <th className="px-5 py-3.5 font-semibold">Name</th>
                <th className="px-5 py-3.5 font-semibold">Contact</th>
                <th className="px-5 py-3.5 font-semibold">Details</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
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
                    <Inbox className="mx-auto h-8 w-8 text-charcoal/20" />
                    <p className="mt-3 font-medium text-charcoal/60">
                      {query || letter !== 'all' || statusFilter !== 'all'
                        ? 'No enquiries match your filters.'
                        : emptyMessages[kind]}
                    </p>
                  </td>
                </tr>
              ) : (
                pagination.paginatedItems.map((row) => {
                  const details = enquiryDetailLines(row)

                  return (
                    <tr key={row.id} className="border-t border-charcoal/[0.05] hover:bg-[#faf7f7]/80">
                      <td className="whitespace-nowrap px-5 py-4 text-charcoal/60">
                        {formatWhen(row.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-charcoal">{row.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-charcoal/80">{row.email}</p>
                        {row.phone ? <p className="mt-0.5 text-charcoal/50">{row.phone}</p> : null}
                      </td>
                      <td className="max-w-sm px-5 py-4 text-charcoal/70">
                        {details.length === 0 ? (
                          <span className="text-charcoal/40">—</span>
                        ) : (
                          <div className="space-y-1">
                            {details.map((line) => (
                              <p key={`${row.id}-${line}`} className="leading-snug">
                                {line}
                              </p>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          className={cn(
                            'rounded-lg border border-charcoal/10 bg-white px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide',
                            statusTone(row.status),
                          )}
                          value={row.status}
                          onChange={(event) =>
                            void handleStatusChange(row.id, event.target.value as EnquiryStatus)
                          }
                        >
                          {enquiryStatuses.map((status) => (
                            <option key={status} value={status}>
                              {enquiryStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      </td>
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
          itemLabel={filtered.length === 1 ? 'enquiry' : 'enquiries'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}
    </div>
  )
}
