import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { AccountMenu } from '@/components/layout/AccountMenu'

export function OneViewTopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-end gap-3 border-b border-charcoal/[0.06] bg-white/90 px-4 backdrop-blur-md md:px-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-charcoal/60 transition-colors hover:bg-charcoal/[0.05] hover:text-charcoal"
      >
        <ExternalLink className="h-4 w-4" />
        <span className="hidden sm:inline">Public Site</span>
      </Link>

      <AccountMenu />
    </header>
  )
}
