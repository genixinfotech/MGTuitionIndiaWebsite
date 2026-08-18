import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLoading } from '@/components/auth/RequireAuth'
import { useAuth } from '@/context/AuthContext'

export function AuthCallbackPage() {
  const { user, loading, homePath } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    navigate(user ? homePath : '/login', { replace: true })
  }, [homePath, loading, navigate, user])

  return <AuthLoading />
}
