import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Receipt } from 'lucide-react'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'
import { PaymentStatusBadge } from '@/components/payments/PaymentStatusBadge'
import { formatReceiptAmount, formatReceiptDate } from '@/lib/payments'
import { downloadPaymentReceiptPdf } from '@/lib/payment-receipt-pdf'
import {
  listTuitionPayments,
  receiptFromPayment,
  type TuitionPaymentWithPeople,
} from '@/lib/tuition-payments'

export function PortalReceiptsPage() {
  const [payments, setPayments] = useState<TuitionPaymentWithPeople[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void listTuitionPayments()
      .then((rows) => {
        if (!cancelled) setPayments(rows)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load receipts.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const receipts = useMemo(() => payments.filter((row) => row.status === 'paid'), [payments])

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <DashboardPageHeader title="Receipts" icon={Receipt} />

      {error ? (
        <p className="rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson">{error}</p>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-charcoal/[0.06] bg-white py-16 text-charcoal/45">
          <Loader2 className="h-5 w-5 animate-spin text-crimson" />
        </div>
      ) : receipts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-charcoal/15 bg-white px-6 py-16 text-center">
          <Receipt className="mx-auto h-8 w-8 text-charcoal/20" />
          <p className="mt-3 font-medium text-charcoal/60">No receipts yet</p>
          <p className="mt-1 text-sm text-charcoal/45">
            Paid tuition receipts will appear here after a successful card payment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {receipts.map((payment) => {
            const receipt = receiptFromPayment(payment)
            return (
              <article
                key={payment.id}
                className="flex flex-col rounded-2xl border border-charcoal/[0.06] bg-white p-5 shadow-[0_16px_40px_-32px_rgba(45,45,45,0.45)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-crimson">
                      {receipt.receiptNumber}
                    </p>
                    <h2 className="mt-1 text-lg font-extrabold tracking-tight text-charcoal">
                      {receipt.studentName}
                    </h2>
                  </div>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <p className="mt-3 text-2xl font-extrabold text-charcoal">
                  {formatReceiptAmount(receipt.amount, receipt.currency)}
                </p>
                <p className="mt-1 text-sm text-charcoal/50">{formatReceiptDate(receipt.paidAt)}</p>
                <p className="mt-3 text-sm text-charcoal/70">
                  {receipt.subjects.length > 0 ? receipt.subjects.join(', ') : 'Tuition fee'}
                  {receipt.renewal ? ' · Next month' : ' · First month'}
                </p>
                <button
                  type="button"
                  onClick={() => downloadPaymentReceiptPdf(receipt)}
                  className="btn-outline mt-5 w-full"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
