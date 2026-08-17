import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/auth/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700" aria-label="Loading" role="status" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}