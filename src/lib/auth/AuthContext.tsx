import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi } from '@/lib/api/auth'
import { TOKEN_KEY, USER_KEY } from '@/lib/api/client'
import type { CurrentUser, PermissionCode } from '@/lib/api/types'

interface AuthContextValue {
  user: CurrentUser | null
  loading: boolean
  login: (email: string, motDePasse: string) => Promise<CurrentUser>
  logout: () => void
  hasPermission: (code: PermissionCode) => boolean
  /** Rôle "principal" pour orienter le routing : admin/contrôleur → portail admin, sinon espace membre. */
  role: 'admin' | 'controleur' | 'membre' | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CurrentUser
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(readStoredUser())
    setLoading(false)
  }, [])

  async function login(email: string, motDePasse: string) {
    const data = await authApi.login(email, motDePasse)
    localStorage.setItem(TOKEN_KEY, data.jeton)
    localStorage.setItem(USER_KEY, JSON.stringify(data))
    setUser(data)
    return data
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }

  function hasPermission(code: PermissionCode) {
    if (!user) return false
    if (user.est_super_admin) return true
    return user.permissions.includes(code)
  }

  const role: AuthContextValue['role'] = user
    ? user.est_admin
      ? 'admin'
      : user.est_controleur
        ? 'controleur'
        : 'membre'
    : null

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission, role }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}
