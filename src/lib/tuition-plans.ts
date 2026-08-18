import { getTuitionConfig } from '@/lib/region'

const tuition = getTuitionConfig()

export const batchSizeLabel = tuition.batchSizeLabel
export const pricingBoards = tuition.pricingBoards
export const tuitionPlans = tuition.tuitionPlans
export const pricingReady = tuition.pricingReady
export const minEnrolmentGrade = tuition.minEnrolmentGrade
export const maxEnrolmentGrade = tuition.maxEnrolmentGrade

export type PricingBoardId = (typeof pricingBoards)[number]['id']
export type TuitionPlanGrade = (typeof tuitionPlans)[number]['grade']

export function batchLabelForBoard(boardId: PricingBoardId) {
  const board = pricingBoards.find((item) => item.id === boardId)
  return board?.oneToOne ? 'One-to-one' : batchSizeLabel
}

export function plansForBoard(boardId: PricingBoardId) {
  return tuition.plansForBoard(boardId)
}

export function formatPrice(amount: number) {
  return tuition.formatPrice(amount)
}

/** Formats monthly rate — INR or USD depending on region. */
export const formatInr = formatPrice

export function monthlyRateForGrade(grade: string | null | undefined) {
  return tuition.monthlyRateForGrade(grade)
}

export function formatSessionsLabel(plan: { sessionsMin: number; sessionsMax: number }) {
  if (plan.sessionsMin === plan.sessionsMax) {
    return `${plan.sessionsMin} sessions`
  }
  return `${plan.sessionsMin}–${plan.sessionsMax} sessions`
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
