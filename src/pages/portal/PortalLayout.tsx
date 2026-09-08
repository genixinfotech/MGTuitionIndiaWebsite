import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useAuth } from '@/context/AuthContext'
import { canAccessDashboardNavPath } from '@/lib/dashboard-nav'
import { portalAccessRoles, portalDashboardConfig } from '@/lib/portal-nav'
import { normalizeRole } from '@/lib/roles'

export function PortalLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const role = normalizeRole(user?.role)

  if (!portalAccessRoles.includes(role)) {
    return <Navigate to="/login" replace />
  }

  if (
    !canAccessDashboardNavPath(role, pathname, portalDashboardConfig.navItemForPath)
  ) {
    return <Navigate to="/portal" replace />
  }

  return (
    <DashboardShell config={portalDashboardConfig}>
      <Outlet />
    </DashboardShell>
  )
}
