import { getRegion, getTuitionConfig } from '@/lib/region'
import type { TuitionPlan } from '@/lib/regions/types'
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase'
import {
  filterPlansForBoard,
  monthlyRateFromPlans,
  sessionsFromPlans,
} from '@/lib/tuition-plan-lookup'

const tuition = getTuitionConfig()

export const batchSizeLabel = tuition.batchSizeLabel
export const pricingBoards = tuition.pricingBoards
export const pricingReady = tuition.pricingReady
export const minEnrolmentGrade = tuition.minEnrolmentGrade
export const maxEnrolmentGrade = tuition.maxEnrolmentGrade

let catalogPlans: TuitionPlan[] | null = null

export type ClassTimingSlot = {
  start: string
  end: string
}

export const classTimings: readonly ClassTimingSlot[] = [
  { start: '4:00 pm', end: '5:00 pm' },
  { start: '5:15 pm', end: '6:15 pm' },
  { start: '6:30 pm', end: '7:30 pm' },
  { start: '7:45 pm', end: '8:45 pm' },
]

export function classTimingIndex(startTime: string, endTime: string) {
  const exact = classTimings.findIndex((slot) => slot.start === startTime && slot.end === endTime)
  if (exact >= 0) return exact
  const byStart = classTimings.findIndex((slot) => slot.start === startTime)
  return byStart >= 0 ? byStart : 0
}

export type PricingBoardId = (typeof pricingBoards)[number]['id']
export type TuitionPlanGrade = TuitionPlan['grade']

export function listTuitionPlans() {
  return catalogPlans ?? getTuitionConfig().tuitionPlans
}

export function batchLabelForBoard(boardId: PricingBoardId) {
  const board = pricingBoards.find((item) => item.id === boardId)
  return board?.oneToOne ? 'One-to-one' : batchSizeLabel
}

export function plansForBoard(boardId: PricingBoardId) {
  return filterPlansForBoard(listTuitionPlans(), boardId)
}

export function formatPrice(amount: number) {
  return getTuitionConfig().formatPrice(amount)
}

/** Formats monthly rate — INR or USD depending on region. */
export const formatInr = formatPrice

export function monthlyRateForGrade(grade: string | null | undefined) {
  const fallback = getTuitionConfig().monthlyRateForGrade(grade)
  if (!catalogPlans) return fallback
  return monthlyRateFromPlans(catalogPlans, grade, fallback)
}

export function sessionsPerMonthForGrade(grade: string | null | undefined) {
  const fallback = getTuitionConfig().sessionsPerMonthForGrade(grade)
  if (!catalogPlans) return fallback
  return sessionsFromPlans(catalogPlans, grade, fallback)
}

export function formatSessionsLabel(plan: { sessionsMin: number; sessionsMax: number }) {
  const count =
    plan.sessionsMin === plan.sessionsMax
      ? plan.sessionsMin
      : `${plan.sessionsMin}–${plan.sessionsMax}`
  return `${count} Sessions / Month (1 Hour Each)`
}

/** Split grade labels like "6th Grade/Class" for superscript rendering. */
export function parseGradeLabel(grade: string): { number: string; suffix: string; rest: string } | null {
  const match = grade.match(/^(\d+)(st|nd|rd|th)(\s+.*)?$/i)
  if (!match) return null
  return {
    number: match[1],
    suffix: match[2],
    rest: match[3] ?? '',
  }
}

export async function loadTuitionPlans() {
  if (catalogPlans) return catalogPlans
  if (!isSupabaseConfigured()) return listTuitionPlans()

  try {
    const { data, error } = await getSupabase()
      .from('tuition_plans')
      .select('grade_label, sessions_min, sessions_max, monthly_rate')
      .eq('region', getRegion())
      .order('grade_number')
    if (error || !data?.length) return listTuitionPlans()
    catalogPlans = data.map((row) => ({
      grade: row.grade_label,
      sessionsMin: row.sessions_min,
      sessionsMax: row.sessions_max,
      rate: Number(row.monthly_rate),
    }))
    return catalogPlans
  } catch {
    return listTuitionPlans()
  }
}
