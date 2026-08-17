import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/services/authApi'
import { clearStoredToken, getStoredToken, storeToken } from '@/services/api'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearStoredToken())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password })
    storeToken(result.access_token)
    setUser(result.user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, role = 'staff') => {
    const result = await authApi.register({ name, email, password, role })
    storeToken(result.access_token)
    setUser(result.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore network errors during logout
    }
    clearStoredToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}