import { getSupabase } from '@/lib/supabase'
import type { TutorScheduleSlot } from '@/lib/database.types'

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type SchedulePeriod = 'day' | 'afternoon' | 'evening' | 'night'

export type ScheduleSlotDraft = {
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
}

export const scheduleDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export const schedulePeriodLabels: Record<SchedulePeriod, string> = {
  day: 'Day',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Night',
}

export const schedulePeriodStyles: Record<
  SchedulePeriod,
  { chip: string; block: string; label: string }
> = {
  day: {
    chip: 'bg-amber-100 text-amber-800',
    block: 'border-amber-200/80 bg-amber-50',
    label: 'text-amber-700',
  },
  afternoon: {
    chip: 'bg-sky-100 text-sky-800',
    block: 'border-sky-200/80 bg-sky-50',
    label: 'text-sky-700',
  },
  evening: {
    chip: 'bg-orange-100 text-orange-800',
    block: 'border-orange-200/80 bg-orange-50',
    label: 'text-orange-700',
  },
  night: {
    chip: 'bg-violet-100 text-violet-800',
    block: 'border-violet-200/80 bg-violet-50',
    label: 'text-violet-700',
  },
}

const scheduleStartMinutes = 5 * 60
const scheduleEndMinutes = 23 * 60 + 30

export const scheduleTimeOptions = Array.from(
  { length: (scheduleEndMinutes - scheduleStartMinutes) / 30 + 1 },
  (_, index) => {
    const minutes = scheduleStartMinutes + index * 30
    const value = minutesToTimeValue(minutes)
    return { value, label: formatScheduleTime(value) }
  },
)

function minutesToTimeValue(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function normalizeScheduleTime(value: string) {
  return value.trim().slice(0, 5)
}

export function timeToMinutes(value: string) {
  const normalized = normalizeScheduleTime(value)
  const [hours, minutes] = normalized.split(':').map(Number)
  return hours * 60 + minutes
}

export function formatScheduleTime(value: string) {
  const normalized = normalizeScheduleTime(value)
  const parsed = new Date(`1970-01-01T${normalized}:00`)
  if (Number.isNaN(parsed.getTime())) return normalized
  return parsed.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatScheduleRange(start: string, end: string) {
  const startLabel = formatScheduleTime(start)
  const endLabel = formatScheduleTime(end)
  const startMeridiem = startLabel.includes('AM') ? 'AM' : 'PM'
  const endMeridiem = endLabel.includes('AM') ? 'AM' : 'PM'
  const startCore = startLabel.replace(` ${startMeridiem}`, '')
  const endCore = endLabel.replace(` ${endMeridiem}`, '')

  if (startMeridiem === endMeridiem) {
    return `${startCore} – ${endCore} ${endMeridiem}`
  }

  return `${startLabel} – ${endLabel}`
}

export function formatScheduleDuration(start: string, end: string) {
  const minutes = timeToMinutes(end) - timeToMinutes(start)
  if (minutes <= 0) return '—'
  if (minutes % 60 === 0) {
    const hours = minutes / 60
    return hours === 1 ? '1 hr' : `${hours} hrs`
  }
  return `${minutes / 60} hrs`
}

export function schedulePeriodForTime(value: string): SchedulePeriod {
  const minutes = timeToMinutes(value)
  if (minutes >= 5 * 60 && minutes < 12 * 60) return 'day'
  if (minutes >= 12 * 60 && minutes < 17 * 60 + 30) return 'afternoon'
  if (minutes >= 17 * 60 + 30 && minutes < 21 * 60) return 'evening'
  return 'night'
}

export function endTimeOptionsForStart(start: string) {
  const startMinutes = timeToMinutes(start)
  return scheduleTimeOptions.filter((option) => timeToMinutes(option.value) > startMinutes)
}

export function emptyWeeklySchedule(): Record<DayOfWeek, ScheduleSlotDraft[]> {
  return {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  }
}

export function weeklyScheduleFromRows(rows: TutorScheduleSlot[]) {
  const schedule = emptyWeeklySchedule()

  for (const row of rows) {
    const day = row.day_of_week as DayOfWeek
    schedule[day].push({
      day_of_week: day,
      start_time: normalizeScheduleTime(row.start_time),
      end_time: normalizeScheduleTime(row.end_time),
    })
  }

  for (const day of Object.keys(schedule) as unknown as DayOfWeek[]) {
    schedule[day].sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))
  }

  return schedule
}

export function flattenWeeklySchedule(schedule: Record<DayOfWeek, ScheduleSlotDraft[]>) {
  const rows: ScheduleSlotDraft[] = []

  for (const day of [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]) {
    for (const slot of schedule[day]) {
      rows.push({
        day_of_week: day,
        start_time: normalizeScheduleTime(slot.start_time),
        end_time: normalizeScheduleTime(slot.end_time),
      })
    }
  }

  return rows
}

export function validateWeeklySchedule(schedule: Record<DayOfWeek, ScheduleSlotDraft[]>) {
  for (const day of [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]) {
    const dayLabel = scheduleDayLabels[day]
    const slots = [...schedule[day]].sort(
      (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time),
    )

    for (const slot of slots) {
      const start = timeToMinutes(slot.start_time)
      const end = timeToMinutes(slot.end_time)

      if (end - start < 30) {
        return `${dayLabel}: each slot must be at least 30 minutes.`
      }
      if (start % 30 !== 0 || end % 30 !== 0) {
        return `${dayLabel}: slots must use 30-minute increments.`
      }
    }

    for (let index = 1; index < slots.length; index += 1) {
      const previous = slots[index - 1]
      const current = slots[index]
      if (timeToMinutes(current.start_time) < timeToMinutes(previous.end_time)) {
        return `${dayLabel}: time slots cannot overlap.`
      }
    }
  }

  return null
}

export async function listTutorScheduleSlots(tutorId: string) {
  const { data, error } = await getSupabase()
    .from('tutor_schedule_slots')
    .select('*')
    .eq('tutor_id', tutorId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw new Error(error.message || 'Unable to load work schedule.')
  return (data ?? []) as TutorScheduleSlot[]
}

export async function replaceTutorScheduleSlots(slots: ScheduleSlotDraft[]) {
  const supabase = getSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Please sign in again to save your schedule.')

  const { error: deleteError } = await supabase
    .from('tutor_schedule_slots')
    .delete()
    .eq('tutor_id', user.id)

  if (deleteError) throw new Error(deleteError.message || 'Unable to save work schedule.')

  if (slots.length === 0) return [] as TutorScheduleSlot[]

  const rows = slots.map((slot) => ({
    tutor_id: user.id,
    day_of_week: slot.day_of_week,
    start_time: normalizeScheduleTime(slot.start_time),
    end_time: normalizeScheduleTime(slot.end_time),
  }))

  const { data, error } = await supabase.from('tutor_schedule_slots').insert(rows).select('*')

  if (error) throw new Error(error.message || 'Unable to save work schedule.')
  return (data ?? []) as TutorScheduleSlot[]
}
