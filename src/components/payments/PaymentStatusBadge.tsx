import type { TuitionPaymentStatus } from '@/lib/database.types'
import { paymentStatusLabels } from '@/lib/tuition-payments'
import { cn } from '@/lib/utils'

const tones: Record<TuitionPaymentStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-800',
  failed: 'bg-crimson/10 text-crimson',
  cancelled: 'bg-charcoal/[0.06] text-charcoal/55',
}

export function PaymentStatusBadge({ status }: { status: TuitionPaymentStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        tones[status],
      )}
    >
      {paymentStatusLabels[status]}
    </span>
  )
}
