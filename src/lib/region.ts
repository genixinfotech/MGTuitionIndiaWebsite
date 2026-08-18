import { gccRegion } from '@/lib/regions/gcc'
import { indiaRegion } from '@/lib/regions/india'
import type { RegionBundle, RegionId } from '@/lib/regions/types'

const bundles: Record<RegionId, RegionBundle> = {
  India: indiaRegion,
  GCC: gccRegion,
}

export function normalizeRegion(value?: string | null): RegionId {
  const trimmed = value?.trim().toUpperCase()
  if (trimmed === 'GCC') return 'GCC'
  return 'India'
}

export function readRegion(): RegionId {
  if (typeof window !== 'undefined') {
    const runtime = window.__MG_PUBLIC_CONFIG__?.region
    if (runtime) return normalizeRegion(runtime)
  }
  return normalizeRegion(import.meta.env.VITE_REGION || import.meta.env.Region)
}

let activeRegion: RegionId | null = null

export function getRegion(): RegionId {
  if (!activeRegion) activeRegion = readRegion()
  return activeRegion
}

export function getRegionBundle(): RegionBundle {
  return bundles[getRegion()]
}

export function getSiteConfig() {
  return getRegionBundle().site
}

export function getTuitionConfig() {
  return getRegionBundle().tuition
}

export function getLocationOptions() {
  return getRegionBundle().locationOptions
}

export function isGcc() {
  return getRegion() === 'GCC'
}

export function isIndia() {
  return getRegion() === 'India'
}
