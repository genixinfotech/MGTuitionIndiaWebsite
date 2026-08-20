import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { classTimings } from '@/lib/tuition-plans'

type ClassTimingsProps = {
  className?: string
  timeClassName?: string
  compact?: boolean
  centered?: boolean
  /** `list` keeps rows left-aligned under table headers; `grid` aligns start/end columns. */
  layout?: 'grid' | 'list'
}

export function ClassTimings({
  className,
  timeClassName,
  compact = false,
  centered = false,
  layout = 'grid',
}: ClassTimingsProps) {
  if (layout === 'list') {
    return (
      <ul
        className={cn(compact ? 'space-y-0.5' : 'space-y-1', className)}
        role="list"
        aria-label="Class timings"
      >
        {classTimings.map((slot) => (
          <li
            key={`${slot.start}-${slot.end}`}
            className={cn(
              'whitespace-nowrap tabular-nums leading-snug',
              compact ? 'text-xs md:text-sm' : 'text-sm md:text-base',
              timeClassName,
            )}
          >
            {slot.start} – {slot.end}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-[minmax(4.25rem,auto)_auto_minmax(4.25rem,auto)] items-center',
        compact ? 'gap-x-1.5 gap-y-0.5' : 'gap-x-2.5 gap-y-1',
        centered && 'mx-auto',
        className,
      )}
      role="list"
      aria-label="Class timings"
    >
      {classTimings.map((slot) => (
        <Fragment key={`${slot.start}-${slot.end}`}>
          <span
            role="listitem"
            className={cn(
              'text-right tabular-nums leading-snug',
              compact ? 'text-xs md:text-sm' : 'text-sm md:text-base',
              timeClassName,
            )}
          >
            {slot.start}
          </span>
          <span
            aria-hidden
            className={cn(
              'text-center font-normal opacity-45',
              compact ? 'text-xs' : 'text-sm',
              timeClassName,
            )}
          >
            –
          </span>
          <span
            className={cn(
              'text-left tabular-nums leading-snug',
              compact ? 'text-xs md:text-sm' : 'text-sm md:text-base',
              timeClassName,
            )}
          >
            {slot.end}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

export function ClassTimingsBlock({ className }: { className?: string }) {
  return (
    <div className={cn('text-center', className)}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-charcoal/45">Timings</p>
      <ClassTimings
        centered
        timeClassName="font-semibold text-charcoal/75"
      />
    </div>
  )
}
