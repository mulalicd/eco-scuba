import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          logger.error('Auth callback error', { error })
          toast.error('Authentication failed. Please try again.')
          navigate('/login?error=auth_callback_failed', { replace: true })
          return
        }

        if (data.session) {
          logger.info('Auth callback successful', { hasSession: true })
          toast.success('Welcome back!')

          const returnUrl = (location.state as { from?: string } | null)?.from || '/dashboard'
          const allowed = ['/dashboard', '/projects', '/settings', '/']
          const isValidRedirect = (url: string): boolean =>
            allowed.some(allowedPath => url.startsWith(allowedPath)) ||
            url.startsWith(window.location.origin)

          navigate(isValidRedirect(returnUrl) ? returnUrl : '/dashboard', { replace: true })
        } else {
          logger.warn('Auth callback completed but no session found')
          toast.error('Authentication link is invalid or expired.')
          navigate('/login?error=invalid_callback', { replace: true })
        }
      } catch (err) {
        logger.error('Unexpected error in auth callback', { error: err })
        toast.error('An unexpected error occurred. Please try again.')
        navigate('/login?error=system_error', { replace: true })
      } finally {
        setProcessing(false)
      }
    }

    handleAuthCallback()
  }, [navigate, location.state])

  if (processing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Processing authentication...</p>
        </div>
      </div>
    )
  }

  return null
}
