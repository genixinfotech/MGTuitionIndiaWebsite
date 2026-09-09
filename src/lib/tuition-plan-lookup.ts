import type { PricingBoard, TuitionPlan } from '@/lib/regions/types'

export function gradeNumberFromLabel(grade?: string | null) {
  const n = Number(String(grade || '').match(/\d+/)?.[0] || 0)
  return Number.isFinite(n) ? n : 0
}

export function planForGrade(plans: TuitionPlan[], grade?: string | null) {
  const number = gradeNumberFromLabel(grade)
  if (!number) return undefined
  return plans.find((item) => gradeNumberFromLabel(item.grade) === number)
}

export function monthlyRateFromPlans(plans: TuitionPlan[], grade: string | null | undefined, fallback: number) {
  return planForGrade(plans, grade)?.rate ?? fallback
}

export function sessionsFromPlans(plans: TuitionPlan[], grade: string | null | undefined, fallback: number) {
  return planForGrade(plans, grade)?.sessionsMin ?? fallback
}

export function filterPlansForBoard(plans: TuitionPlan[], boardId: PricingBoard['id']) {
  if (boardId === 'igcse') {
    return plans.filter((plan) => gradeNumberFromLabel(plan.grade) >= 6)
  }
  return plans
}
