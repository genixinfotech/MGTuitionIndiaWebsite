import {
  Atom,
  BookOpenText,
  Calculator,
  Dna,
  FlaskConical,
  Globe,
  type LucideIcon,
} from 'lucide-react'
import { getTuitionConfig } from '@/lib/region'
import { site } from '@/lib/site'

export type SubjectName = (typeof site.subjects)[number]

const { minEnrolmentGrade, maxEnrolmentGrade } = getTuitionConfig()
const classRangeLabel = `Class ${minEnrolmentGrade} – ${maxEnrolmentGrade}`
const socialScienceMax = Math.min(maxEnrolmentGrade, 10)
const socialScienceLabel = `Class ${minEnrolmentGrade} – ${socialScienceMax}`

export const subjectIcons: Record<SubjectName, LucideIcon> = {
  Mathematics: Calculator,
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  English: BookOpenText,
  'Social Science': Globe,
}

export const subjectDetails: Record<
  SubjectName,
  {
    color: string
    bgColor: string
    lightColor: string
    level: string
    description: string
    features: string[]
  }
> = {
  Mathematics: {
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white',
    lightColor: 'bg-blue-100',
    level: classRangeLabel,
    description: 'Build strong foundations in algebra, geometry, and board-exam problem solving.',
    features: ['Algebra & geometry', 'Board exam prep', 'Step-by-step methods'],
  },
  Physics: {
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-gradient-to-br from-violet-50 via-purple-50/50 to-white',
    lightColor: 'bg-violet-100',
    level: classRangeLabel,
    description: 'Master concepts, numericals, and derivations with clear visual explanations.',
    features: ['Mechanics & optics', 'Numericals practice', 'Concept clarity'],
  },
  Chemistry: {
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-gradient-to-br from-teal-50 via-cyan-50/50 to-white',
    lightColor: 'bg-teal-100',
    level: classRangeLabel,
    description: 'From periodic trends to organic reactions — taught with board-focused clarity.',
    features: ['Organic & inorganic', 'Reaction mechanisms', 'Exam-style drills'],
  },
  Biology: {
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-gradient-to-br from-emerald-50 via-green-50/50 to-white',
    lightColor: 'bg-emerald-100',
    level: classRangeLabel,
    description: 'Diagrams, definitions, and life processes explained for strong exam scores.',
    features: ['Botany & zoology', 'Labelled diagrams', 'Syllabus-aligned notes'],
  },
  English: {
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-50 via-orange-50/50 to-white',
    lightColor: 'bg-amber-100',
    level: classRangeLabel,
    description: 'Grammar, comprehension, and writing skills that lift marks across subjects.',
    features: ['Grammar & writing', 'Literature analysis', 'Reading comprehension'],
  },
  'Social Science': {
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-gradient-to-br from-rose-50 via-pink-50/50 to-white',
    lightColor: 'bg-rose-100',
    level: socialScienceLabel,
    description: 'History, geography, and civics made engaging with maps, timelines, and recall.',
    features: ['History & geography', 'Map work', 'Board-style answers'],
  },
}
