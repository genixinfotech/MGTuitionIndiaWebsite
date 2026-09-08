import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { OneViewShell } from '@/components/oneview/OneViewShell'
import { useAuth } from '@/context/AuthContext'
import { canAccessOneViewNav, oneViewNavItemForPath } from '@/lib/oneview-nav'
import { normalizeRole } from '@/lib/roles'

export function OneViewLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const role = normalizeRole(user?.role)
  const section = oneViewNavItemForPath(pathname)

  if (!canAccessOneViewNav(role, section)) {
    return <Navigate to="/oneview" replace />
  }

  return (
    <OneViewShell>
      <Outlet />
    </OneViewShell>
  )
}
