export const tuitionPlans = [
  { grade: '6th Grade/Class', sessions: 8, studentsPerBatch: 6, rate: 2500, offer: 2000 },
  { grade: '7th Grade/Class', sessions: 8, studentsPerBatch: 6, rate: 2500, offer: 2000 },
  { grade: '8th Grade/Class', sessions: 8, studentsPerBatch: 6, rate: 3000, offer: 2500 },
  { grade: '9th Grade/Class', sessions: 8, studentsPerBatch: 6, rate: 3000, offer: 2500 },
  { grade: '10th Grade/Class', sessions: 8, studentsPerBatch: 6, rate: 3500, offer: 3000 },
  { grade: '11th Grade/Class', sessions: 8, studentsPerBatch: 6, rate: 3500, offer: 3000 },
  { grade: '12th Grade/Class', sessions: 8, studentsPerBatch: 6, rate: 3500, offer: 3000 },
] as const

export type TuitionPlanGrade = (typeof tuitionPlans)[number]['grade']

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
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
