import { Link } from 'react-router-dom'
import { site } from '@/lib/site'

export function FormDisclaimer() {
  return (
    <p className="border-t border-charcoal/10 pt-4 text-[11px] leading-relaxed text-charcoal/45">
      {site.formDisclaimer}{' '}
      <Link
        to="/privacy-policy"
        className="font-semibold text-charcoal/60 underline-offset-2 hover:text-crimson hover:underline"
      >
        Privacy Policy
      </Link>
      .
    </p>
  )
}
