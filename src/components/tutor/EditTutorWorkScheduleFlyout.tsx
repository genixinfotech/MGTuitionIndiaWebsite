import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Copy, Loader2, Plus, RotateCcw, Trash2, X } from 'lucide-react'
import {
  emptyWeeklySchedule,
  flattenWeeklySchedule,
  formatScheduleDuration,
  replaceTutorScheduleSlots,
  scheduleDayLabels,
  scheduleTimeOptions,
  endTimeOptionsForStart,
  validateWeeklySchedule,
  weeklyScheduleFromRows,
  type DayOfWeek,
  type ScheduleSlotDraft,
} from '@/lib/tutor-schedule'
import type { TutorScheduleSlot } from '@/lib/database.types'
function cloneWeeklySchedule(schedule: Record<DayOfWeek, ScheduleSlotDraft[]>) {
  return {
    0: schedule[0].map((slot) => ({ ...slot })),
    1: schedule[1].map((slot) => ({ ...slot })),
    2: schedule[2].map((slot) => ({ ...slot })),
    3: schedule[3].map((slot) => ({ ...slot })),
    4: schedule[4].map((slot) => ({ ...slot })),
    5: schedule[5].map((slot) => ({ ...slot })),
    6: schedule[6].map((slot) => ({ ...slot })),
  }
}

export function EditTutorWorkScheduleFlyout({
  open,
  onClose,
  initialSlots,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initialSlots: TutorScheduleSlot[]
  onSaved: (rows: TutorScheduleSlot[]) => void
}) {
  const [schedule, setSchedule] = useState(emptyWeeklySchedule())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setSchedule(weeklyScheduleFromRows(initialSlots))
    setError('')
  }, [initialSlots, open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, saving, onClose])

  function updateDay(day: DayOfWeek, nextSlots: ScheduleSlotDraft[]) {
    setSchedule((current) => ({
      ...current,
      [day]: nextSlots.map((slot) => ({ ...slot, day_of_week: day })),
    }))
  }

  function addSlot(day: DayOfWeek) {
    updateDay(day, [
      ...schedule[day],
      { day_of_week: day, start_time: '09:00', end_time: '10:00' },
    ])
  }

  function removeSlot(day: DayOfWeek, index: number) {
    updateDay(
      day,
      schedule[day].filter((_, slotIndex) => slotIndex !== index),
    )
  }

  function updateSlot(day: DayOfWeek, index: number, patch: Partial<ScheduleSlotDraft>) {
    updateDay(
      day,
      schedule[day].map((slot, slotIndex) => (slotIndex === index ? { ...slot, ...patch } : slot)),
    )
  }

  function clearDay(day: DayOfWeek) {
    updateDay(day, [])
  }

  function copyDayToAll(sourceDay: DayOfWeek) {
    const template = schedule[sourceDay].map((slot) => ({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
    }))

    setSchedule((current) => {
      const next = cloneWeeklySchedule(current)
      for (const day of [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]) {
        next[day] = template.map((slot) => ({ ...slot, day_of_week: day }))
      }
      return next
    })
  }

  async function handleSave() {
    setError('')
    const validationError = validateWeeklySchedule(schedule)
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    try {
      const rows = await replaceTutorScheduleSlots(flattenWeeklySchedule(schedule))
      onSaved(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save work schedule.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="edit-tutor-schedule"
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm disabled:cursor-not-allowed"
            aria-label="Close schedule editor"
            disabled={saving}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-tutor-schedule-title"
            className="fixed top-0 right-0 flex h-dvh w-full max-w-2xl flex-col bg-white shadow-[-24px_0_60px_-28px_rgba(45,45,45,0.45)]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-charcoal/[0.06] px-5 py-5">
              <div>
                <h2 id="edit-tutor-schedule-title" className="text-lg font-bold text-charcoal">
                  Edit Preferred Work Schedule
                </h2>
                <p className="mt-1 text-sm text-charcoal/50">
                  Add 30-minute slots for each day you are available to teach.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 transition-colors hover:border-crimson/30 hover:text-crimson disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => (
                  <section
                    key={day}
                    className="overflow-hidden rounded-2xl border border-charcoal/[0.08] bg-[#fcfbfa]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal/[0.06] px-4 py-3">
                      <h3 className="font-bold text-charcoal">{scheduleDayLabels[day]}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyDayToAll(day)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy to all days
                        </button>
                        <button
                          type="button"
                          onClick={() => clearDay(day)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-charcoal/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal/60 transition-colors hover:border-charcoal/20 hover:text-charcoal"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Clear day
                        </button>
                        <button
                          type="button"
                          onClick={() => addSlot(day)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-charcoal/10 bg-white px-2.5 py-1.5 text-xs font-semibold text-charcoal/70 transition-colors hover:border-crimson/20 hover:text-crimson"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add slot
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 px-4 py-4">
                      {schedule[day].length === 0 ? (
                        <p className="text-sm text-charcoal/45">No slots for this day.</p>
                      ) : (
                        schedule[day].map((slot, index) => {
                          const endOptions = endTimeOptionsForStart(slot.start_time)

                          return (
                            <div
                              key={`${day}-${index}`}
                              className="grid gap-3 rounded-xl border border-charcoal/[0.06] bg-white p-3 md:grid-cols-[1fr_1fr_auto_auto]"
                            >
                              <label className="block text-sm">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/45">
                                  Start
                                </span>
                                <select
                                  className="w-full rounded-lg border border-charcoal/10 bg-white px-3 py-2 text-sm font-medium text-charcoal"
                                  value={slot.start_time}
                                  onChange={(event) => {
                                    const start_time = event.target.value
                                    const validEnds = endTimeOptionsForStart(start_time)
                                    const end_time = validEnds.some(
                                      (option) => option.value === slot.end_time,
                                    )
                                      ? slot.end_time
                                      : validEnds[0]?.value || start_time
                                    updateSlot(day, index, { start_time, end_time })
                                  }}
                                >
                                  {scheduleTimeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="block text-sm">
                                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-charcoal/45">
                                  End
                                </span>
                                <select
                                  className="w-full rounded-lg border border-charcoal/10 bg-white px-3 py-2 text-sm font-medium text-charcoal"
                                  value={slot.end_time}
                                  onChange={(event) =>
                                    updateSlot(day, index, { end_time: event.target.value })
                                  }
                                >
                                  {endOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <div className="flex items-end pb-1">
                                <p className="text-sm font-semibold text-charcoal/55">
                                  {formatScheduleDuration(slot.start_time, slot.end_time)}
                                </p>
                              </div>

                              <div className="flex items-end justify-end pb-0.5">
                                <button
                                  type="button"
                                  onClick={() => removeSlot(day, index)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-crimson transition-colors hover:bg-crimson/10"
                                  aria-label="Remove slot"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="border-t border-charcoal/[0.06] px-5 py-4">
              {error ? (
                <p className="mb-3 rounded-xl border border-crimson/20 bg-crimson/5 px-3 py-2 text-sm text-crimson">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-full border border-charcoal/10 px-4 py-2.5 text-sm font-semibold text-charcoal/60 transition-colors hover:border-charcoal/20 hover:text-charcoal disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save schedule'
                  )}
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
