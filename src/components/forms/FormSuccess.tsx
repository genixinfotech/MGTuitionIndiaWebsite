import { CheckCircle2 } from 'lucide-react'

export function FormSuccess({
  title = 'Message sent successfully',
  description = 'Thank you. We’ll get back to you shortly.',
  actionLabel,
  onAction,
  titleId,
}: {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  titleId?: string
}) {
  return (
    <div
      role="status"
      className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center"
    >
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden />
      <p id={titleId} className="mt-4 text-lg font-bold text-charcoal">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-charcoal/60">{description}</p>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} className="btn-primary mt-6">
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
