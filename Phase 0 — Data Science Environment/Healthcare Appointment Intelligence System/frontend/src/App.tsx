import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/auth/AuthContext'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { router } from '@/router'

function AppContent() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Show loading screen for at least 800ms for better UX
    const timer = setTimeout(() => setIsReady(true), 800)
    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  )
}