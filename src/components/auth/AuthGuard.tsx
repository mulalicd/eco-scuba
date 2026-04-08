// src/components/auth/AuthGuard.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type AuthGuardProps = {
  children: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground ml-2">Loading...</p>
    </div>
  )

  if (!user) {
    // Preserve intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}
AuthGuard.displayName = 'AuthGuard'
