import { lazy, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'

const ForgotPasswordForm = lazy(() => import('@/components/auth/ForgotPasswordForm').then(module => ({ default: module.ForgotPasswordForm })))

const FormSkeleton = () => (
  <div className="w-full max-w-md mx-auto animate-pulse">
    <div className="bg-card rounded-lg p-6 space-y-4">
      <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
      <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
      <div className="space-y-3">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded w-1/2" />
      </div>
    </div>
  </div>
)

export const ForgotPassword: React.FC = () => {
  const { loading } = useAuth()

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
        <ForgotPasswordForm />
      </Suspense>
    </div>
  )
}