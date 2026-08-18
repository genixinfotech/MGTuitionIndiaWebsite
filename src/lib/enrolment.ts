import { getLocationOptions, getSiteConfig, getTuitionConfig } from '@/lib/region'

export const locationOptions = getLocationOptions()

/** @deprecated Use locationOptions — kept for portal compatibility */
export const indianStates = locationOptions

const { minEnrolmentGrade, maxEnrolmentGrade } = getTuitionConfig()

export const enrolmentGrades = Array.from(
  { length: maxEnrolmentGrade - minEnrolmentGrade + 1 },
  (_, i) => `Class ${i + minEnrolmentGrade}`,
)

export const enrolmentSyllabi = [
  ...getSiteConfig().boards.map((board) => board.name),
  'Other State Board',
] as const

export const emptyEnrolment = {
  full_name: '',
  email: '',
  password: '',
  city: '',
  state: '',
  grade: '',
  board: '',
  school_name: '',
}

export type EnrolmentForm = typeof emptyEnrolment
