import { Link } from 'react-router-dom'
import { ExternalLink, Menu } from 'lucide-react'
import { AccountMenu } from '@/components/layout/AccountMenu'
import { useDashboardLayout } from '@/components/dashboard/DashboardLayoutContext'

export function DashboardTopBar() {
  const { toggleMobileOpen } = useDashboardLayout()

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-charcoal/[0.06] bg-white/90 px-4 backdrop-blur-md md:px-6">
      <button
        type="button"
        onClick={toggleMobileOpen}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-charcoal/10 text-charcoal/70 transition-colors hover:border-crimson/20 hover:text-crimson lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-charcoal/60 transition-colors hover:bg-charcoal/[0.05] hover:text-charcoal"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Public Site</span>
        </Link>

        <AccountMenu />
      </div>
    </header>
  )
}
