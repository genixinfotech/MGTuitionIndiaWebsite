import { useRef } from 'react'
import {
  ParentStudentActionButtons,
  ParentStudentsPanel,
  type ParentStudentsPanelHandle,
} from '@/components/portal/ParentStudentsPanel'
import { TodayClassesSection } from '@/components/portal/TodayClassesSection'
import { useAuth } from '@/context/AuthContext'
import { roleLabel } from '@/lib/auth-paths'
import { normalizeRole } from '@/lib/roles'

export function PortalOverviewPage() {
  const { user } = useAuth()
  const role = normalizeRole(user?.role)
  const studentsPanelRef = useRef<ParentStudentsPanelHandle>(null)

  if (!user) return null

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5">
      <section className="overflow-hidden rounded-2xl border border-charcoal/[0.06] bg-gradient-to-br from-[#1a1214] via-[#241418] to-[#2d1a1c] p-6 text-white md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{roleLabel(role)}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
              Welcome back, {user.name.split(' ')[0]}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Signed in as {user.email}. Use the sidebar to manage your account
              {role === 'parent' ? ' and children' : role === 'tutor' ? ', classes, and teaching profile' : ' and classes'}.
            </p>
          </div>

          {role === 'parent' ? (
            <ParentStudentActionButtons
              onEnrol={() => studentsPanelRef.current?.openEnrolPanel()}
            />
          ) : null}
        </div>
      </section>

      {role === 'parent' ? <ParentStudentsPanel ref={studentsPanelRef} /> : null}

      {role === 'tutor' || role === 'student' ? (
        <TodayClassesSection
          userId={user.id}
          userName={user.name}
          userEmail={user.email}
          variant={role}
        />
      ) : null}
    </div>
  )
}
