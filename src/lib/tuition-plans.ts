export const batchSizeLabel = '6–8'

export const pricingBoards = [
  { id: 'cbse', label: 'CBSE', oneToOne: false },
  { id: 'icse', label: 'ICSE', oneToOne: false },
  { id: 'igcse', label: 'IGCSE', oneToOne: true },
] as const

export type PricingBoardId = (typeof pricingBoards)[number]['id']

export function batchLabelForBoard(boardId: PricingBoardId) {
  const board = pricingBoards.find((item) => item.id === boardId)
  return board?.oneToOne ? 'One-to-one' : batchSizeLabel
}

export const tuitionPlans = [
  { grade: '6th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 2500 },
  { grade: '7th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 2500 },
  { grade: '8th Grade/Class', sessionsMin: 8, sessionsMax: 8, rate: 3000 },
  { grade: '9th Grade/Class', sessionsMin: 8, sessionsMax: 12, rate: 3000 },
  { grade: '10th Grade/Class', sessionsMin: 8, sessionsMax: 12, rate: 3500 },
  { grade: '11th Grade/Class', sessionsMin: 8, sessionsMax: 12, rate: 3500 },
  { grade: '12th Grade/Class', sessionsMin: 8, sessionsMax: 12, rate: 3500 },
] as const

export type TuitionPlanGrade = (typeof tuitionPlans)[number]['grade']

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

export function monthlyRateForGrade(grade: string | null | undefined) {
  const number = grade?.match(/\d+/)?.[0]
  if (!number) return 3000
  const plan = tuitionPlans.find((item) => item.grade.startsWith(`${number}th`) || item.grade.startsWith(number))
  return plan?.rate ?? (Number(number) <= 7 ? 2500 : 3000)
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
