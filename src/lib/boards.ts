import { BookOpen, GraduationCap, Landmark, type LucideIcon } from 'lucide-react'
import { site } from '@/lib/site'

export type BoardId = (typeof site.boards)[number]['id']

export const boardThemes: Record<
  BoardId,
  {
    icon: LucideIcon
    mark: string
    gradient: string
    soft: string
    text: string
    ring: string
    shadow: string
    glow: string
    check: string
    orb: string
  }
> = {
  cbse: {
    icon: BookOpen,
    mark: 'CBSE',
    gradient: 'from-[#1d4ed8] via-[#4f46e5] to-[#7c3aed]',
    soft: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-200/70',
    shadow: 'shadow-blue-500/20',
    glow: 'group-hover:shadow-[0_28px_56px_-18px_rgba(37,99,235,0.55)]',
    check: 'bg-blue-500',
    orb: 'bg-sky-300/40',
  },
  icse: {
    icon: GraduationCap,
    mark: 'ICSE',
    gradient: 'from-[#6d28d9] via-[#9333ea] to-[#db2777]',
    soft: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'ring-violet-200/70',
    shadow: 'shadow-violet-500/20',
    glow: 'group-hover:shadow-[0_28px_56px_-18px_rgba(124,58,237,0.55)]',
    check: 'bg-violet-500',
    orb: 'bg-fuchsia-300/40',
  },
  kerala: {
    icon: Landmark,
    mark: 'KSB',
    gradient: 'from-[#047857] via-[#0d9488] to-[#0891b2]',
    soft: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-200/70',
    shadow: 'shadow-emerald-500/20',
    glow: 'group-hover:shadow-[0_28px_56px_-18px_rgba(5,150,105,0.55)]',
    check: 'bg-emerald-500',
    orb: 'bg-teal-300/40',
  },
}
