import { Check, Loader2, Mail, X } from 'lucide-react'
import { fieldClass } from '@/components/forms/FormField'
import type { StudentEmailCheckStatus } from '@/hooks/useStudentEmailCheck'
import { cn } from '@/lib/utils'

export function StudentLoginEmailField({
  value,
  onChange,
  status: _status,
  message,
  isChecking,
  isAvailable,
  isUnavailable,
  label = 'Student login email',
  placeholder = 'student@email.com',
}: {
  value: string
  onChange: (value: string) => void
  status: StudentEmailCheckStatus
  message: string
  isChecking: boolean
  isAvailable: boolean
  isUnavailable: boolean
  label?: string
  placeholder?: string
}) {
  const showFeedback = isChecking || isAvailable || isUnavailable
  const showStatusIcon = isAvailable || isUnavailable

  return (
    <div className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
        {label}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-0 top-1/2 z-10 flex w-11 -translate-y-1/2 justify-center text-crimson">
          <Mail className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <input
          required
          type="email"
          className={cn(fieldClass(true), showStatusIcon && 'pr-12')}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={isUnavailable}
          aria-describedby="student-email-feedback"
        />
        {isChecking ? (
          <span className="pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-charcoal/35">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        ) : null}
        {isAvailable ? (
          <span
            className="pointer-events-none absolute right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm"
            aria-hidden
          >
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </span>
        ) : null}
        {isUnavailable ? (
          <span
            className="pointer-events-none absolute right-3 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#ff6b6b] to-crimson shadow-sm"
            aria-hidden
          >
            <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <div
        id="student-email-feedback"
        className={cn('mt-1.5 text-xs', showFeedback && 'min-h-[1.125rem]')}
      >
        {isChecking ? (
          <p className="text-charcoal/45">Checking if this email is already used…</p>
        ) : null}
        {isAvailable ? <p className="font-medium text-emerald-700">{message}</p> : null}
        {isUnavailable ? <p className="font-medium text-crimson">{message}</p> : null}
      </div>
    </div>
  )
}
