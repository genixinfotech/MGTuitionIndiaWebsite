import { getRegion } from '@/lib/region'

const GOOGLE_ADS_ID = 'AW-18451927038'
const FREE_ASSESSMENT_SEND_TO = 'AW-18451927038/TZIuCPikookdEP6fyN5E'

export function installGoogleAdsTag() {
  if (typeof window === 'undefined') return

  if (typeof window.gtag !== 'function') {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments)
    }
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`
    document.head.appendChild(script)
    window.gtag('js', new Date())
  }

  window.gtag('config', GOOGLE_ADS_ID)
}

export function trackFreeAssessmentConversion() {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'conversion', {
    send_to: FREE_ASSESSMENT_SEND_TO,
    value: 1.0,
    currency: getRegion() === 'GCC' ? 'USD' : 'INR',
  })
}
