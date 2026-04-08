import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
  },
}))

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useAuth', () => {
  const mockUser = { id: '123', email: 'test@example.com' }
  const mockSession = { user: mockUser, access_token: 'token' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('initializes with loading true and no user', () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('sets user and session after successful session fetch', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('handles sign in success', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const signInResult = await result.current.signIn('test@example.com', 'password')

    expect(signInResult.success).toBe(true)
    expect((signInResult as any).user).toEqual(mockUser)
  })

  it('handles sign in error', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    const mockError = new Error('Invalid login credentials')
    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: null,
      error: mockError
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const signInResult = await result.current.signIn('test@example.com', 'wrongpassword')

    expect(signInResult.success).toBe(false)
    expect((signInResult as any).error.message).toBe('Invalid email or password')
  })

  it('handles sign up success', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    ;(supabase.auth.signUp as any).mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const signUpData = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'John Doe',
      organization: 'Eco Org',
      rememberMe: false,
      acceptTerms: true,
    }

    const signUpResult = await result.current.signUp(signUpData)

    expect(signUpResult.success).toBe(true)
    expect((signUpResult as any).user).toEqual(mockUser)
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
      options: {
        data: {
          full_name: 'John Doe',
          organization: 'Eco Org',
        },
      },
    })
  })

  it('handles sign out', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: mockSession }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    ;(supabase.auth.signOut as any).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.signOut()

    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('handles reset password', async () => {
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    ;(supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ error: null })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const resetResult = await result.current.resetPassword('test@example.com')

    expect(resetResult.success).toBe(true)
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      { redirectTo: expect.stringContaining('/auth/callback?type=recovery') }
    )
  })

  it('cleans up subscription on unmount', () => {
    const unsubscribeMock = vi.fn()
    ;(supabase.auth.getSession as any).mockResolvedValue({ data: { session: null }, error: null })
    ;(supabase.auth.onAuthStateChange as any).mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } }
    })

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(unsubscribeMock).toHaveBeenCalled()
  })
})