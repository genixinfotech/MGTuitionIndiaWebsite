import { site } from '@/lib/site'

export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const

export const enrolmentGrades = Array.from({ length: 7 }, (_, i) => `Class ${i + 6}`)

export const enrolmentSyllabi = [...site.boards.map((board) => board.name), 'Other State Board'] as const

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
