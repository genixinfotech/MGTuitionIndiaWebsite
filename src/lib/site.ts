import { getSiteConfig } from '@/lib/region'

export const site = getSiteConfig()

export function whatsappUrl(message?: string) {
  if (!site.whatsappNumber) return '#'
  const text = message ?? site.whatsappMessage
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`
}
