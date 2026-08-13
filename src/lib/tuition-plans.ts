export const batchSizeLabel = '6–8'

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
