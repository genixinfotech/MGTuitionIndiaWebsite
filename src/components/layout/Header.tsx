import { motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, LogIn, Menu, Phone, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'
import { useTrial } from '@/context/TrialContext'
import { useAuth } from '@/context/AuthContext'
import { homePathForRole, isDashboardRoute } from '@/lib/auth-paths'
import { AccountMenu } from '@/components/layout/AccountMenu'

function NavSecondaryButton({
  className,
  fullWidth,
  compact,
}: {
  className?: string
  fullWidth?: boolean
  compact?: boolean
}) {
  return (
    <Link
      to="/login"
      className={cn(
        'group inline-flex items-center justify-center gap-2 rounded-full',
        'bg-crimson/[0.06] text-sm font-semibold text-crimson',
        'transition-colors duration-300 hover:bg-crimson/[0.12] hover:text-crimson-dark',
        compact ? 'px-3 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm' : 'px-5 py-2.5',
        fullWidth && 'w-full py-3.5',
        className,
      )}
    >
      <LogIn className={cn('text-crimson', compact ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5')} />
      Login
    </Link>
  )
}

function NavDashboardButton({ className, compact }: { className?: string; compact?: boolean }) {
  const { user } = useAuth()
  if (!user) return null

  return (
    <Link
      to={homePathForRole(user.role)}
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-crimson/[0.06] font-semibold text-crimson transition-colors hover:bg-crimson/[0.12] hover:text-crimson-dark',
        compact ? 'px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm' : 'px-4 py-2 text-sm',
        className,
      )}
    >
      {user.role === 'student' ? 'My classes' : 'Dashboard'}
    </Link>
  )
}

function NavTrialButton({
  className,
  onClick,
  fullWidth,
}: {
  className?: string
  onClick: () => void
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full',
        'bg-gradient-to-r from-crimson via-[#e63946] to-crimson-dark',
        'px-5 py-2.5 text-sm font-semibold text-white',
        'shadow-[0_4px_24px_rgba(204,0,0,0.35)]',
        'transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(204,0,0,0.45)]',
        fullWidth && 'w-full py-3.5',
        className,
      )}
    >
      <span className="absolute inset-0 rounded-full bg-white/0 transition-colors duration-300 group-hover:bg-white/10" />
      <Sparkles className="relative h-3.5 w-3.5 text-crimson-light" />
      <span className="relative">{fullWidth ? site.assessmentCta : 'Assessment'}</span>
      <ArrowRight className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
    </button>
  )
}

function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn('items-center gap-0.5', className)}>
      {site.nav.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          className="relative rounded-full px-1 py-1"
        >
          {({ isActive }) => (
            <>
              {isActive ? (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-crimson to-[#e63946] shadow-md shadow-crimson/25"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              ) : null}
              <span
                className={cn(
                  'relative z-10 block rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-charcoal/65 hover:bg-crimson/[0.06] hover:text-crimson',
                )}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function AccountActions({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <NavDashboardButton compact={compact} />
      <AccountMenu />
    </div>
  )
}

export function Header() {
  const { openTrial } = useTrial()
  const { user, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const dashboardView = isDashboardRoute(location.pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {!dashboardView ? (
        <div className="hidden bg-charcoal text-white/70 sm:block">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs md:px-6">
            {site.showPhone && site.phoneDisplay ? (
              <a href={site.phoneHref} className="inline-flex items-center gap-2 transition hover:text-white">
                <Phone className="h-3.5 w-3.5 text-crimson-light" />
                {site.phoneDisplay}
              </a>
            ) : (
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                {site.email}
              </a>
            )}
            <p>{site.headerOfficeLine}</p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'border-b border-charcoal/10 bg-white/95 backdrop-blur-md transition-all duration-300',
          scrolled && 'bg-white/90 shadow-lg shadow-charcoal/[0.06]',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-3.5">
          <Link to="/" className="shrink-0 transition hover:opacity-90">
            <img
              src="/images/mg-tuition-logo.png"
              alt={site.name}
              className="h-12 w-auto md:h-14"
            />
          </Link>

          {dashboardView ? (
            loading ? (
              <div className="h-10 w-10" aria-hidden />
            ) : user ? (
              <AccountActions />
            ) : (
              <div className="h-10 w-10" aria-hidden />
            )
          ) : (
            <>
              <MainNav className="hidden lg:flex" />

              <div className="flex items-center gap-1.5 sm:gap-2">
                {loading ? (
                  <div className="h-9 w-16 animate-pulse rounded-full bg-charcoal/5 sm:w-24" aria-hidden />
                ) : user ? (
                  <>
                    <div className="lg:hidden">
                      <AccountActions compact />
                    </div>
                    <div className="hidden lg:flex">
                      <AccountActions />
                    </div>
                  </>
                ) : (
                  <>
                    <NavSecondaryButton compact className="lg:hidden" />
                    <NavSecondaryButton className="hidden lg:inline-flex" />
                  </>
                )}
                {!loading && !user ? (
                  <NavTrialButton className="hidden sm:inline-flex" onClick={() => openTrial()} />
                ) : null}
                <button
                  type="button"
                  className="rounded-full p-2 text-charcoal transition-colors hover:bg-crimson/5 hover:text-crimson lg:hidden"
                  aria-label="Toggle menu"
                  onClick={() => setMobileOpen((v) => !v)}
                >
                  {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </>
          )}
        </div>

        {!dashboardView && mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-charcoal/10 bg-white px-4 py-4 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {site.nav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-crimson to-[#e63946] text-white shadow-md shadow-crimson/20'
                        : 'text-charcoal hover:bg-crimson/[0.06] hover:text-crimson',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {!loading && !user ? (
                <NavTrialButton fullWidth className="mt-3" onClick={() => openTrial()} />
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </div>
    </header>
  )
}
