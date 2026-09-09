import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Wallet } from 'lucide-react'
import { OneViewListToolbar } from '@/components/oneview/OneViewListToolbar'
import { OneViewPageHeader } from '@/components/oneview/OneViewPageHeader'
import { OneViewPagination } from '@/components/oneview/OneViewPagination'
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge'
import { usePagination } from '@/hooks/usePagination'
import { matchesLetterFilter, type LetterFilter } from '@/lib/oneview-filters'
import { receiptCoverageText } from '@/lib/class-billing'
import { formatReceiptAmount, formatReceiptDate, receiptNumberForPayment } from '@/lib/payments'
import { downloadPaymentReceiptPdf } from '@/lib/payment-receipt-pdf'
import type { TuitionPaymentStatus } from '@/lib/database.types'
import {
  listTuitionPayments,
  paymentProviderLabels,
  receiptFromPayment,
  type TuitionPaymentWithPeople,
} from '@/lib/tuition-payments'

function paymentHaystack(row: TuitionPaymentWithPeople) {
  return [
    row.student?.full_name,
    row.student?.email,
    row.parent?.full_name,
    row.parent?.email,
    row.provider_payment_id,
    receiptNumberForPayment(row.id),
    ...(row.subjects ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function OneViewFinancePage() {
  const [payments, setPayments] = useState<TuitionPaymentWithPeople[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState<LetterFilter>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    let cancelled = false
    void listTuitionPayments()
      .then((rows) => {
        if (!cancelled) setPayments(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load payments.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    let rows = payments.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (!matchesLetterFilter(row.student?.full_name || row.parent?.full_name || '', letter)) return false
      if (!term) return true
      return paymentHaystack(row).includes(term)
    })

    rows = [...rows].sort((a, b) => {
      const aTime = new Date(a.paid_at || a.created_at).getTime()
      const bTime = new Date(b.paid_at || b.created_at).getTime()
      if (sort === 'oldest') return aTime - bTime
      if (sort === 'amount-desc') return b.amount - a.amount
      if (sort === 'amount-asc') return a.amount - b.amount
      return bTime - aTime
    })
    return rows
  }, [letter, payments, query, sort, statusFilter])

  const pagination = usePagination(filtered, [query, letter, statusFilter, sort])
  const paid = payments.filter((row) => row.status === 'paid')
  const pending = payments.filter((row) => row.status === 'pending')
  const paidTotal = paid.reduce((sum, row) => sum + row.amount, 0)
  const currency = paid[0]?.currency || payments[0]?.currency || 'USD'

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <OneViewPageHeader title="Finance" icon={Wallet} />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Paid" value={String(paid.length)} hint={formatReceiptAmount(paidTotal, currency)} />
        <SummaryCard label="Pending" value={String(pending.length)} hint="Awaiting checkout completion" />
        <SummaryCard label="All payments" value={String(payments.length)} hint="Including failed and cancelled" />
      </div>

      <OneViewListToolbar
        searchValue={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search student, parent, receipt, or transaction…"
        resultCount={filtered.length}
        resultLabel={filtered.length === 1 ? 'payment' : 'payments'}
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
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
              { value: 'cancelled', label: 'Cancelled' },
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
              { value: 'amount-desc', label: 'Amount high–low' },
              { value: 'amount-asc', label: 'Amount low–high' },
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
          itemLabel={filtered.length === 1 ? 'payment' : 'payments'}
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
          <Wallet className="mx-auto h-8 w-8 text-charcoal/20" />
          <p className="mt-3 font-medium text-charcoal/60">
            {query || letter !== 'all' || statusFilter !== 'all'
              ? 'No payments match your filters.'
              : 'No tuition payments yet.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="table-head">
                <tr>
                  <th className="px-5 py-3 font-semibold">Receipt</th>
                  <th className="px-5 py-3 font-semibold">Student / Parent</th>
                  <th className="px-5 py-3 font-semibold">Subjects</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.map((payment) => {
                  const receipt = receiptFromPayment(payment)
                  return (
                    <tr key={payment.id} className="border-t border-charcoal/[0.05]">
                      <td className="whitespace-nowrap px-5 py-3.5">
                        <p className="font-semibold text-charcoal">{receipt.receiptNumber}</p>
                        <p className="mt-0.5 text-xs text-charcoal/45">
                          {paymentProviderLabels[payment.provider]}
                          {receipt.coverage.length > 0
                            ? ` · ${receipt.coverage.map((line) => line.monthLabel).join(', ')}`
                            : payment.renewal
                              ? ' · Renewal'
                              : ''}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-charcoal">{payment.student?.full_name || 'Student'}</p>
                        <p className="mt-0.5 text-charcoal/50">{payment.parent?.full_name || payment.parent?.email || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5 text-charcoal/70">
                        {receiptCoverageText({
                          coverage: receipt.coverage,
                          subjects: payment.subjects,
                          paidAt: receipt.paidAt,
                          grade: receipt.studentGrade,
                        }) || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-charcoal">
                        {formatReceiptAmount(payment.amount, payment.currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <PaymentStatusBadge status={payment.status as TuitionPaymentStatus} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-charcoal/60">
                        {formatReceiptDate(payment.paid_at || payment.created_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {payment.status === 'paid' ? (
                          <button
                            type="button"
                            onClick={() => downloadPaymentReceiptPdf(receipt)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-crimson/20 px-3 py-1.5 text-xs font-semibold text-crimson hover:bg-crimson hover:text-white"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filtered.length > 0 ? (
        <OneViewPagination
          {...pagination}
          position="bottom"
          itemLabel={filtered.length === 1 ? 'payment' : 'payments'}
          loading={loading}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      ) : null}
    </div>
  )
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-charcoal/[0.06] bg-white px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/40">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-charcoal">{value}</p>
      <p className="mt-1 text-sm text-charcoal/50">{hint}</p>
    </div>
  )
}
