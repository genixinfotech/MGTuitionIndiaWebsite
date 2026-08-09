import { BookOpen, GraduationCap, Landmark, type LucideIcon } from 'lucide-react'
import { site } from '@/lib/site'

export type BoardId = (typeof site.boards)[number]['id']

export const boardThemes: Record<
  BoardId,
  {
    icon: LucideIcon
    gradient: string
    soft: string
    text: string
    ring: string
    shadow: string
    glow: string
    check: string
  }
> = {
  cbse: {
    icon: BookOpen,
    gradient: 'from-[#2563eb] via-[#4f46e5] to-[#6366f1]',
    soft: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-100',
    shadow: 'shadow-blue-500/20',
    glow: 'group-hover:shadow-[0_24px_48px_-16px_rgba(37,99,235,0.45)]',
    check: 'bg-blue-500',
  },
  icse: {
    icon: GraduationCap,
    gradient: 'from-[#7c3aed] via-[#9333ea] to-[#a855f7]',
    soft: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'ring-violet-100',
    shadow: 'shadow-violet-500/20',
    glow: 'group-hover:shadow-[0_24px_48px_-16px_rgba(124,58,237,0.45)]',
    check: 'bg-violet-500',
  },
  kerala: {
    icon: Landmark,
    gradient: 'from-[#059669] via-[#0d9488] to-[#14b8a6]',
    soft: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
    shadow: 'shadow-emerald-500/20',
    glow: 'group-hover:shadow-[0_24px_48px_-16px_rgba(5,150,105,0.45)]',
    check: 'bg-emerald-500',
  },
}
