import { useState, useEffect, useCallback } from 'react'
import { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/lib/logger'
import { RegisterData } from '@/lib/validation/auth-schemas'

// Error types
export interface AuthError {
  code: string
  message: string
  statusCode?: number
}

export type AuthResult =
  | { success: true; user: User }
  | { success: false; error: AuthError }

// Map Supabase errors to user-friendly messages
const mapAuthError = (error: SupabaseAuthError | unknown): AuthError => {
  if (!(error instanceof Error)) {
    return { code: 'unknown', message: 'An unexpected error occurred' }
  }

  const supabaseError = error as { status?: number; message?: string }

  switch (supabaseError.message) {
    case 'Invalid login credentials':
      return { code: 'invalid_credentials', message: 'Invalid email or password' }
    case 'User already registered':
      return { code: 'user_exists', message: 'An account with this email already exists' }
    case 'Email not confirmed':
      return { code: 'email_not_confirmed', message: 'Please confirm your email address' }
    case 'Password recovery email sent':
      return { code: 'recovery_sent', message: 'Check your inbox for reset instructions' }
    case 'New password should be different from the old password':
      return { code: 'same_password', message: 'New password must be different' }
    default:
      logger.error('Auth error', { original: supabaseError })
      return {
        code: 'system_error',
        message: 'Authentication failed. Please try again.'
      }
  }
}

// Hook return interface
export interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  error: AuthError | null
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>
  signUp: (data: RegisterData) => Promise<AuthResult>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  // Clear error on new action
  const clearError = useCallback(() => setError(null), [])

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          logger.error('Failed to get initial session', { error })
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        logger.error('Unexpected error during auth initialization', { error: err })
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info('Auth state changed', { event, hasSession: !!session })
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign in
  const signIn = useCallback(async (
    email: string,
    password: string,
    rememberMe?: boolean
  ): Promise<AuthResult> => {
    clearError()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        const mappedError = mapAuthError(error)
        setError(mappedError)
        return { success: false, error: mappedError }
      }

      // Note: rememberMe is handled by Supabase's persistSession setting
      return { success: true, user: data.user! }
    } catch (err) {
      const mappedError = mapAuthError(err)
      setError(mappedError)
      return { success: false, error: mappedError }
    }
  }, [clearError])

  // Sign up
  const signUp = useCallback(async (data: RegisterData): Promise<AuthResult> => {
    clearError()
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            organization: data.organization,
          },
        },
      })

      if (error) {
        const mappedError = mapAuthError(error)
        setError(mappedError)
        return { success: false, error: mappedError }
      }

      return { success: true, user: authData.user! }
    } catch (err) {
      const mappedError = mapAuthError(err)
      setError(mappedError)
      return { success: false, error: mappedError }
    }
  }, [clearError])

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    clearError()
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        logger.error('Sign out error', { error })
        throw error
      }
    } catch (err) {
      logger.error('Unexpected sign out error', { error: err })
      // Don't set error for sign out failures, just log
    }
  }, [clearError])

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    clearError()
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })

      if (error) {
        const mappedError = mapAuthError(error)
        setError(mappedError)
        return { success: false, error: mappedError }
      }

      return { success: true, user: {} as User } // Dummy user for success
    } catch (err) {
      const mappedError = mapAuthError(err)
      setError(mappedError)
      return { success: false, error: mappedError }
    }
  }, [clearError])

  // Update password
  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    clearError()
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        const mappedError = mapAuthError(error)
        setError(mappedError)
        return { success: false, error: mappedError }
      }

      return { success: true, user: data.user! }
    } catch (err) {
      const mappedError = mapAuthError(err)
      setError(mappedError)
      return { success: false, error: mappedError }
    }
  }, [clearError])

  const isAuthenticated = !!user && !!session

  return {
    user,
    session,
    loading,
    isAuthenticated,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}