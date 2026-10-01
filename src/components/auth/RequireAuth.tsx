import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { homePathForRole } from '@/lib/auth-paths'
import { normalizeRole, isInternalRole, type AppRole } from '@/lib/roles'

export function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-6 w-6 animate-spin text-crimson" />
    </div>
  )
}

export function RequireAuth({
  children,
  roles,
  internal,
}: {
  children: ReactNode
  roles?: AppRole[]
  internal?: boolean
}) {
  const { user, loading } = useAuth()

  if (loading) return <AuthLoading />
  if (!user) return <Navigate to="/login" replace />
  if (internal && !isInternalRole(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }
  if (roles && !internal && !roles.includes(normalizeRole(user.role))) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }
  return children
}
