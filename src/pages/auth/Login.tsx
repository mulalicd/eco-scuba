import { lazy, Suspense, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

const LoginForm = lazy(() => import('@/components/auth/LoginForm').then(module => ({ default: module.LoginForm })))

const FormSkeleton = () => (
  <div className="w-full max-w-md mx-auto animate-pulse">
    <div className="bg-card rounded-lg p-6 space-y-4">
      <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
      <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
      <div className="space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded w-1/2" />
      </div>
    </div>
  </div>
)

export const Login: React.FC = () => {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      const returnUrl = (location.state as { from?: string } | null)?.from || '/dashboard'
      navigate(returnUrl, { replace: true })
    }
  }, [isAuthenticated, loading, navigate, location.state])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <FormSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={<FormSkeleton />}>
        <LoginForm onSuccess={() => toast.success('Welcome back!')} />
      </Suspense>
    </div>
  )
}
