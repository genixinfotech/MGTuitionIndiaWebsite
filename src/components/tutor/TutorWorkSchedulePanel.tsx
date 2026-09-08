import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Loader2, Pencil } from 'lucide-react'
import { EditTutorWorkScheduleFlyout } from '@/components/tutor/EditTutorWorkScheduleFlyout'
import {
  formatScheduleDuration,
  formatScheduleRange,
  listTutorScheduleSlots,
  scheduleDayLabels,
  schedulePeriodForTime,
  schedulePeriodLabels,
  schedulePeriodStyles,
  weeklyScheduleFromRows,
  type DayOfWeek,
} from '@/lib/tutor-schedule'
import type { TutorScheduleSlot } from '@/lib/database.types'
import { cn } from '@/lib/utils'

const defaultTimezone = 'Asia/Kolkata'

export function TutorWorkSchedulePanel({
  tutorId,
  timezone = defaultTimezone,
  canEdit = false,
}: {
  tutorId: string
  timezone?: string
  canEdit?: boolean
}) {
  const [slots, setSlots] = useState<TutorScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const rows = await listTutorScheduleSlots(tutorId)
        if (!cancelled) setSlots(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load work schedule.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [tutorId])

  const weekly = useMemo(() => weeklyScheduleFromRows(slots), [slots])
  const hasSlots = slots.length > 0

  function handleSaved(rows: TutorScheduleSlot[]) {
    setSlots(rows)
    setEditOpen(false)
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-white">
        <div className="border-b border-charcoal/[0.06] px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <CalendarClock className="h-5 w-5 shrink-0 text-crimson" />
                <h3 className="text-lg font-bold text-charcoal">Preferred Work Schedule</h3>
              </div>
              <p className="mt-1.5 text-sm text-charcoal/50">
                Times are in your profile timezone ({timezone}). Slots must be in 0.5 hour increments.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(schedulePeriodLabels) as Array<keyof typeof schedulePeriodLabels>).map(
                  (period) => (
                    <span
                      key={period}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
                        schedulePeriodStyles[period].chip,
                      )}
                    >
                      {schedulePeriodLabels[period]}
                    </span>
                  ),
                )}
              </div>
            </div>

            {canEdit ? (
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2 text-sm font-semibold text-charcoal/70 transition-colors hover:border-crimson/20 hover:text-crimson"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="mx-5 my-4 rounded-xl border border-crimson/20 bg-crimson/5 px-4 py-3 text-sm text-crimson md:mx-6">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center px-5 py-16">
            <Loader2 className="h-5 w-5 animate-spin text-crimson" />
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-7 md:p-5">
            {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
              const daySlots = weekly[day]

              return (
                <div
                  key={day}
                  className="flex min-h-[220px] flex-col rounded-xl border border-charcoal/[0.08] bg-[#fcfbfa]"
                >
                  <div className="border-b border-charcoal/[0.06] px-3 py-2.5 text-center">
                    <p className="text-sm font-extrabold tracking-wide text-crimson">
                      {scheduleDayLabels[day]}
                    </p>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-2.5">
                    {daySlots.length === 0 ? (
                      <p className="flex flex-1 items-center justify-center px-2 text-center text-xs text-charcoal/35">
                        No slots
                      </p>
                    ) : (
                      daySlots.map((slot) => {
                        const period = schedulePeriodForTime(slot.start_time)
                        const styles = schedulePeriodStyles[period]

                        return (
                          <div key={`${day}-${slot.start_time}-${slot.end_time}`} className="space-y-1">
                            <p
                              className={cn(
                                'text-[10px] font-bold uppercase tracking-[0.14em]',
                                styles.label,
                              )}
                            >
                              {schedulePeriodLabels[period]}
                            </p>
                            <div
                              className={cn(
                                'rounded-xl border px-2.5 py-2 text-center shadow-sm',
                                styles.block,
                              )}
                            >
                              <p className="text-xs font-bold leading-snug text-charcoal">
                                {formatScheduleRange(slot.start_time, slot.end_time)}
                              </p>
                              <p className="mt-0.5 text-[11px] font-medium text-charcoal/55">
                                {formatScheduleDuration(slot.start_time, slot.end_time)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && !hasSlots && !error ? (
          <p className="border-t border-charcoal/[0.06] px-5 py-4 text-sm text-charcoal/45 md:px-6">
            {canEdit
              ? 'No preferred slots yet. Click Edit to add your weekly availability.'
              : 'No preferred work schedule on file yet.'}
          </p>
        ) : null}
      </section>

      {canEdit ? (
        <EditTutorWorkScheduleFlyout
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initialSlots={slots}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  )
}
