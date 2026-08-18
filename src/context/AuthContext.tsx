import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { AppRole, Profile } from '@/lib/database.types'
import { homePathForRole } from '@/lib/auth-paths'
import { authRedirectTo, getSupabase, isSupabaseConfigured } from '@/lib/supabase'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: AppRole
  avatarUrl: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  configured: boolean
  login: (email: string, password: string) => Promise<{ ok: true; path: string }>
  signup: (name: string, email: string, password: string) => Promise<{ ok: true; needsConfirmation: boolean }>
  logout: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (fields: { full_name: string; phone: string }) => Promise<void>
  homePath: string
}

const AuthContext = createContext<AuthContextValue | null>(null)

function avatarUrlFrom(sessionUser: User) {
  const meta = sessionUser.user_metadata ?? {}
  for (const key of ['avatar_url', 'picture', 'avatar'] as const) {
    const value = meta[key]
    if (typeof value === 'string' && /^https?:\/\//.test(value)) return value
  }
  return null
}

function toAuthUser(sessionUser: User, profile: Profile | null): AuthUser {
  const email = sessionUser.email ?? profile?.email ?? ''
  const name =
    profile?.full_name?.trim() ||
    (typeof sessionUser.user_metadata?.full_name === 'string' ? sessionUser.user_metadata.full_name : '') ||
    email.split('@')[0] ||
    'Parent'
  return {
    id: sessionUser.id,
    email,
    name,
    role: profile?.role ?? 'parent',
    avatarUrl: avatarUrlFrom(sessionUser),
  }
}

function mapAuthError(message: string) {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login')) return 'Email or password is incorrect.'
  if (lower.includes('email not confirmed')) return 'Please confirm your email, then sign in.'
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Sign in instead.'
  }
  if (lower.includes('password')) return message
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await getSupabase().from('profiles').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const supabase = getSupabase()

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session)
      if (data.session?.user) {
        try {
          await loadProfile(data.session.user.id)
        } catch {
          setProfile(null)
        }
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        const userId = nextSession.user.id
        setTimeout(() => {
          void loadProfile(userId).catch(() => setProfile(null))
        }, 0)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const user = useMemo(
    () => (session?.user ? toAuthUser(session.user, profile) : null),
    [session, profile],
  )

  const homePath = homePathForRole(user?.role)

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw new Error(mapAuthError(error.message))
    if (data.user) {
      const nextProfile = await loadProfile(data.user.id).catch(() => null)
      return { ok: true as const, path: homePathForRole(nextProfile?.role) }
    }
    return { ok: true as const, path: '/portal' }
  }, [loadProfile])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: authRedirectTo('/auth/callback'),
      },
    })
    if (error) throw new Error(mapAuthError(error.message))
    return { ok: true as const, needsConfirmation: !data.session }
  }, [])

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setSession(null)
      setProfile(null)
      return
    }
    await getSupabase().auth.signOut()
    setSession(null)
    setProfile(null)
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: authRedirectTo('/update-password'),
    })
    if (error) throw new Error(mapAuthError(error.message))
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) throw new Error(mapAuthError(error.message))
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    await loadProfile(session.user.id)
  }, [loadProfile, session])

  const updateProfile = useCallback(
    async (fields: { full_name: string; phone: string }) => {
      if (!session?.user) throw new Error('Please sign in again.')
      const full_name = fields.full_name.trim()
      const phone = fields.phone.trim() || null
      const { error } = await getSupabase()
        .from('profiles')
        .update({ full_name, phone })
        .eq('id', session.user.id)
      if (error) throw new Error(error.message)
      await getSupabase().auth.updateUser({ data: { full_name } })
      await loadProfile(session.user.id)
    },
    [loadProfile, session],
  )

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      configured: isSupabaseConfigured,
      login,
      signup,
      logout,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
      updateProfile,
      homePath,
    }),
    [
      user,
      profile,
      loading,
      login,
      signup,
      logout,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
      updateProfile,
      homePath,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
