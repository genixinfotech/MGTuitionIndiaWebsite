import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZE_OPTIONS, TOP_PAGINATION_THRESHOLD, type PageSize } from '@/hooks/usePagination'
import { cn } from '@/lib/utils'

const selectClass =
  'h-8 w-[4.25rem] shrink-0 rounded-lg border border-charcoal/10 bg-white px-2 text-xs font-semibold text-charcoal focus:border-crimson/30 focus:outline-none focus:ring-2 focus:ring-crimson/10 disabled:cursor-not-allowed disabled:opacity-50'

const navButtonClass =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-charcoal/10 bg-white text-charcoal/70 transition-colors hover:border-crimson/20 hover:text-crimson disabled:cursor-not-allowed disabled:border-charcoal/[0.06] disabled:bg-charcoal/[0.03] disabled:text-charcoal/30'

export function OneViewPagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  rangeStart,
  rangeEnd,
  itemLabel,
  loading = false,
  position = 'bottom',
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: PageSize
  totalItems: number
  totalPages: number
  rangeStart: number
  rangeEnd: number
  itemLabel: string
  loading?: boolean
  position?: 'top' | 'bottom'
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSize) => void
}) {
  if (!loading && totalItems === 0) return null
  if (position === 'top' && totalItems <= TOP_PAGINATION_THRESHOLD) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-charcoal/[0.06] bg-white px-3 py-2 sm:px-4',
        loading && 'opacity-70',
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-charcoal/55">
        <label className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span className="font-medium text-charcoal/65">Rows per page</span>
          <select
            value={pageSize}
            disabled={loading}
            onChange={(event) => onPageSizeChange(Number(event.target.value) as PageSize)}
            aria-label="Rows per page"
            className={selectClass}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <span className="hidden h-4 w-px shrink-0 bg-charcoal/10 sm:block" aria-hidden />
        <span className="whitespace-nowrap">
          {loading ? (
            <>Loading {itemLabel}…</>
          ) : (
            <>
              <span className="font-medium text-charcoal/70">
                {rangeStart}–{rangeEnd}
              </span>
              <span className="text-charcoal/45"> of {totalItems} {itemLabel}</span>
            </>
          )}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={navButtonClass}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[5.5rem] px-1 text-center text-xs font-medium tabular-nums text-charcoal/60">
          Page {loading ? '—' : page} of {loading ? '—' : totalPages}
        </span>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={navButtonClass}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
