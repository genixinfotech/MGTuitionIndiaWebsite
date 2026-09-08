import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SubjectMultiSelect({
  value,
  onChange,
  subjects,
  disabledSubjects = [],
  label = 'Subjects for assessment',
  loading = false,
  emptyMessage = 'Select a grade first to see available subjects.',
}: {
  value: string[]
  onChange: (subjects: string[]) => void
  subjects: string[]
  disabledSubjects?: string[]
  label?: string
  loading?: boolean
  emptyMessage?: string
}) {
  function toggle(subject: string) {
    if (disabledSubjects.includes(subject)) return
    onChange(value.includes(subject) ? value.filter((item) => item !== subject) : [...value, subject])
  }

  return (
    <div>
      <p className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-charcoal/45">
        {label}
      </p>
      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-charcoal/15 px-4 py-6 text-sm text-charcoal/50">
          <Loader2 className="h-4 w-4 animate-spin text-crimson" />
          Loading subjects…
        </div>
      ) : subjects.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-charcoal/15 px-4 py-4 text-sm text-charcoal/50">
          {emptyMessage}
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {subjects.map((subject) => {
            const checked = value.includes(subject)
            const disabled = disabledSubjects.includes(subject)
            return (
              <label
                key={subject}
                className={cn(
                  'flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors',
                  disabled
                    ? 'cursor-not-allowed border-charcoal/[0.06] bg-gray-50 text-charcoal/35'
                    : checked
                      ? 'cursor-pointer border-crimson/30 bg-crimson/5 text-crimson'
                      : 'cursor-pointer border-charcoal/[0.08] bg-gray-50 text-charcoal hover:border-crimson/20',
                )}
              >
                <input
                  type="checkbox"
                  className="accent-crimson"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(subject)}
                />
                <span className="min-w-0">{subject}</span>
                {disabled ? (
                  <span className="ml-auto text-[10px] font-semibold uppercase text-charcoal/35">
                    Requested
                  </span>
                ) : null}
              </label>
            )
          })}
        </div>
      )}
      {subjects.length > 0 && value.length === 0 ? (
        <p className="mt-2 text-xs text-charcoal/45">Select at least one subject for the free assessment.</p>
      ) : null}
    </div>
  )
}
