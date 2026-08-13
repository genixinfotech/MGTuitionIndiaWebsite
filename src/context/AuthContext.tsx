import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AuthUser = {
  email: string
  name: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ ok: true }>
  logout: () => void
}

const STORAGE_KEY = 'mgtuition.auth'

const AuthContext = createContext<AuthContextValue | null>(null)

function nameFromEmail(email: string) {
  const local = email.split('@')[0] ?? 'Parent'
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed?.email) return null
    return { email: parsed.email, name: parsed.name || nameFromEmail(parsed.email) }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const login = useCallback(async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 700))
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.')
    }
    const next: AuthUser = {
      email: email.trim().toLowerCase(),
      name: nameFromEmail(email),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
