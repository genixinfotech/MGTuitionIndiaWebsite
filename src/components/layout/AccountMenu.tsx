import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth-paths'
import { cn } from '@/lib/utils'

export function UserAvatar({
  name,
  src,
  size = 'md',
}: {
  name: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const [failed, setFailed] = useState(false)
  const initial = (name.trim().charAt(0) || '?').toUpperCase()
  const dim =
    size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className={cn('shrink-0 rounded-full object-cover', dim)}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-crimson font-bold text-white',
        dim,
      )}
    >
      {initial}
    </span>
  )
}

export function AccountMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    function onPointer(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  async function onSignOut() {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex max-w-[16rem] items-center gap-2.5 rounded-full py-1 pl-1 pr-2 text-left transition-colors hover:bg-charcoal/[0.04] sm:max-w-xs sm:pr-3"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar name={user.name} src={user.avatarUrl} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-tight text-charcoal">
            {user.name}
          </span>
          <span className="block truncate text-xs font-medium capitalize text-charcoal/45">
            {roleLabel(user.role)}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'hidden h-4 w-4 shrink-0 text-charcoal/40 transition-transform sm:block',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-charcoal/[0.08] bg-white py-1.5 shadow-[0_20px_50px_-24px_rgba(45,45,45,0.45)]"
        >
          <Link
            role="menuitem"
            to="/profile"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-charcoal/75 transition-colors hover:bg-crimson/[0.06] hover:text-crimson"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void onSignOut()}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-charcoal/75 transition-colors hover:bg-crimson/[0.06] hover:text-crimson"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
