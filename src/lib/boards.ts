import { BookOpen, Globe, GraduationCap, type LucideIcon } from 'lucide-react'
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
    badgeGradient: string
  }
> = {
  cbse: {
    icon: BookOpen,
    mark: 'CBSE',
    gradient: 'from-[#1d4ed8] via-[#2563eb] to-[#38bdf8]',
    soft: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-200/70',
    shadow: 'shadow-blue-500/20',
    glow: 'group-hover:shadow-[0_28px_56px_-18px_rgba(37,99,235,0.55)]',
    check: 'bg-blue-500',
    orb: 'bg-sky-300/40',
    badgeGradient: 'from-[#0f172a] via-[#1e3a8a] to-[#0f172a]',
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
    badgeGradient: 'from-[#0f172a] via-[#4c1d95] to-[#0f172a]',
  },
  igcse: {
    icon: Globe,
    mark: 'IGC',
    gradient: 'from-[#047857] via-[#0d9488] to-[#0891b2]',
    soft: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-200/70',
    shadow: 'shadow-emerald-500/20',
    glow: 'group-hover:shadow-[0_28px_56px_-18px_rgba(5,150,105,0.55)]',
    check: 'bg-emerald-500',
    orb: 'bg-teal-300/40',
    badgeGradient: 'from-[#0f172a] via-[#134e4a] to-[#0f172a]',
  },
}

export const pricingBoardThemes: Record<
  BoardId,
  {
    tabActive: string
    tabInactiveHover: string
    panel: string
    panelBorder: string
  }
> = {
  cbse: {
    tabActive:
      'bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#0284c7] text-white shadow-[0_12px_32px_-10px_rgba(59,130,246,0.4)]',
    tabInactiveHover: 'hover:bg-blue-500/15 hover:text-blue-100',
    panel: 'bg-gradient-to-br from-[#070b16] via-[#0c1730] to-[#0a2038]',
    panelBorder: 'border-blue-400/20',
  },
  icse: {
    tabActive:
      'bg-gradient-to-r from-[#5b21b6] via-[#7e22ce] to-[#be185d] text-white shadow-[0_12px_32px_-10px_rgba(168,85,247,0.4)]',
    tabInactiveHover: 'hover:bg-violet-500/15 hover:text-violet-100',
    panel: 'bg-gradient-to-br from-[#0a0612] via-[#150a28] to-[#1f0a18]',
    panelBorder: 'border-violet-400/20',
  },
  igcse: {
    tabActive:
      'bg-gradient-to-r from-[#064e3b] via-[#0f766e] to-[#0e7490] text-white shadow-[0_12px_32px_-10px_rgba(20,184,166,0.4)]',
    tabInactiveHover: 'hover:bg-emerald-500/15 hover:text-emerald-100',
    panel: 'bg-gradient-to-br from-[#061612] via-[#0a2420] to-[#082028]',
    panelBorder: 'border-teal-400/20',
  },
}
