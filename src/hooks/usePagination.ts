import { useEffect, useMemo, useState } from 'react'

export const PAGE_SIZE_OPTIONS = [50, 100] as const

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

/** Show top pagination bar when total results exceed this count. */
export const TOP_PAGINATION_THRESHOLD = PAGE_SIZE_OPTIONS[0]

export function usePagination<T>(items: T[], resetKeys: readonly unknown[] = []) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(50)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(page, totalPages)

  useEffect(() => {
    setPage(1)
  }, [pageSize, ...resetKeys])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, pageSize, safePage])

  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalItems)

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    paginatedItems,
    totalItems,
    totalPages,
    rangeStart,
    rangeEnd,
  }
}
