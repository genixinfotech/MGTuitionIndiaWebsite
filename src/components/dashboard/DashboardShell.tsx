import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, Users } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

export function DashboardShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { user } = useAuth()
  const consultant = user?.role === 'student_consultant'

  return (
    <div className="min-h-screen bg-[#f4f1f1] text-charcoal">
      <Header />

      <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 pt-28 md:grid-cols-[220px_1fr] md:px-6 md:pt-32">
        <aside className="h-fit rounded-2xl border border-charcoal/[0.06] bg-white p-3">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-charcoal/40">{title}</p>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-crimson/10 px-3 py-2.5 text-sm font-semibold text-crimson"
          >
            {consultant ? <ClipboardList className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
            {consultant ? 'Requests' : 'Overview'}
          </Link>
          {consultant ? null : (
            <Link
              to="/portal"
              className={cn(
                'mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-charcoal/60 hover:bg-charcoal/[0.04]',
              )}
            >
              <Users className="h-4 w-4" />
              Parent view
            </Link>
          )}
        </aside>
        <div>{children}</div>
      </div>
      <Footer />
    </div>
  )
}
