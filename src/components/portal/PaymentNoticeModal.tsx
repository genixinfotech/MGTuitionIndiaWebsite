import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Download, Loader2 } from 'lucide-react'
import {
  formatReceiptAmount,
  formatReceiptDate,
  type TuitionPaymentReceipt,
} from '@/lib/payments'
import { downloadPaymentReceiptPdf } from '@/lib/payment-receipt-pdf'

export type PaymentNoticeTone = 'success' | 'error' | 'info' | 'loading'

function ReceiptDetails({ receipt }: { receipt: TuitionPaymentReceipt }) {
  const rows = [
    { label: 'Receipt number', value: receipt.receiptNumber },
    { label: 'Transaction date', value: formatReceiptDate(receipt.paidAt) },
    { label: 'Amount paid', value: formatReceiptAmount(receipt.amount, receipt.currency) },
    { label: 'Student', value: receipt.studentName },
    {
      label: 'Subjects',
      value: receipt.subjects.length > 0 ? receipt.subjects.join(', ') : 'Tuition fee',
    },
    receipt.transactionId ? { label: 'Stripe transaction ID', value: receipt.transactionId } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  return (
    <dl className="mt-5 space-y-2.5 rounded-2xl border border-charcoal/[0.08] bg-gray-50 px-4 py-3 text-left">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[7.5rem_1fr] items-start gap-3">
          <dt className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/40">{row.label}</dt>
          <dd className="break-all text-sm font-semibold text-charcoal">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PaymentNoticeModal({
  open,
  tone,
  title,
  message,
  receipt,
  onConfirm,
}: {
  open: boolean
  tone: PaymentNoticeTone
  title: string
  message: string
  receipt?: TuitionPaymentReceipt | null
  onConfirm?: () => void
}) {
  const waiting = tone === 'loading'
  const showReceipt = tone === 'success' && Boolean(receipt)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  const icon =
    tone === 'success' ? (
      <CheckCircle2 className="h-14 w-14 text-emerald-600" aria-hidden />
    ) : tone === 'loading' ? (
      <Loader2 className="h-14 w-14 animate-spin text-crimson" aria-hidden />
    ) : (
      <AlertCircle className={`h-14 w-14 ${tone === 'error' ? 'text-crimson' : 'text-amber-600'}`} aria-hidden />
    )

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm" />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="payment-notice-title"
            aria-describedby="payment-notice-message"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-lg rounded-[28px] bg-white px-6 py-8 text-center shadow-[0_32px_80px_-24px_rgba(0,0,0,0.45)]"
          >
            <div className="flex justify-center">{icon}</div>
            <h2 id="payment-notice-title" className="mt-4 text-xl font-extrabold tracking-tight text-charcoal">
              {title}
            </h2>
            <p id="payment-notice-message" className="mt-2 text-sm leading-relaxed text-charcoal/60">
              {message}
            </p>
            {showReceipt && receipt ? <ReceiptDetails receipt={receipt} /> : null}
            {waiting ? null : (
              <div className="mt-7 flex flex-col gap-2">
                {showReceipt && receipt ? (
                  <button
                    type="button"
                    onClick={() => downloadPaymentReceiptPdf(receipt)}
                    className="btn-outline w-full"
                  >
                    <Download className="h-4 w-4" />
                    Download receipt PDF
                  </button>
                ) : null}
                <button type="button" autoFocus={!showReceipt} onClick={onConfirm} className="btn-primary w-full">
                  OK
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
