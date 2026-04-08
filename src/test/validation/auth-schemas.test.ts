import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, forgotPasswordSchema, type LoginData, type RegisterData, type ForgotPasswordData } from '@/lib/validation/auth-schemas'

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const validData: LoginData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    }
    expect(() => loginSchema.parse(validData)).not.toThrow()
  })

  it('lowercases email', () => {
    const data = loginSchema.parse({
      email: 'Test@Example.COM',
      password: 'password123',
    })
    expect(data.email).toBe('test@example.com')
  })

  it('requires valid email', () => {
    expect(() => loginSchema.parse({
      email: 'invalid-email',
      password: 'password123',
    })).toThrow('Invalid email address')
  })

  it('requires password of at least 8 characters', () => {
    expect(() => loginSchema.parse({
      email: 'test@example.com',
      password: 'short',
    })).toThrow('Password must be at least 8 characters')
  })

  it('allows rememberMe to be optional', () => {
    const data = loginSchema.parse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(data.rememberMe).toBeUndefined()
  })
})

describe('registerSchema', () => {
  it('validates correct register data', () => {
    const validData: RegisterData = {
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'John Doe',
      organization: 'Eco Org',
      rememberMe: false,
      acceptTerms: true,
    }
    expect(() => registerSchema.parse(validData)).not.toThrow()
  })

  it('requires fullName between 2 and 50 characters', () => {
    expect(() => registerSchema.parse({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'A',
      acceptTerms: true,
    })).toThrow('Name must be at least 2 characters')

    expect(() => registerSchema.parse({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'A'.repeat(51),
      acceptTerms: true,
    })).toThrow('Name must be less than 50 characters')
  })

  it('allows organization to be optional and max 100 chars', () => {
    const data = registerSchema.parse({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'John Doe',
      acceptTerms: true,
    })
    expect(data.organization).toBeUndefined()

    expect(() => registerSchema.parse({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'John Doe',
      organization: 'A'.repeat(101),
      acceptTerms: true,
    })).toThrow('Organization name is too long')
  })

  it('requires password with uppercase, number, and special char', () => {
    expect(() => registerSchema.parse({
      email: 'test@example.com',
      password: 'password123', // no uppercase, no special
      fullName: 'John Doe',
      acceptTerms: true,
    })).toThrow('Must contain one uppercase letter')

    expect(() => registerSchema.parse({
      email: 'test@example.com',
      password: 'Password', // no number, no special
      fullName: 'John Doe',
      acceptTerms: true,
    })).toThrow('Must contain one number')

    expect(() => registerSchema.parse({
      email: 'test@example.com',
      password: 'Password123', // no special
      fullName: 'John Doe',
      acceptTerms: true,
    })).toThrow('Must contain one special character')
  })

  it('requires acceptTerms to be true', () => {
    expect(() => registerSchema.parse({
      email: 'test@example.com',
      password: 'Password123!',
      fullName: 'John Doe',
      acceptTerms: false,
    })).toThrow('You must accept the terms and conditions')
  })
})

describe('forgotPasswordSchema', () => {
  it('validates correct email', () => {
    const validData: ForgotPasswordData = {
      email: 'test@example.com',
    }
    expect(() => forgotPasswordSchema.parse(validData)).not.toThrow()
  })

  it('lowercases email', () => {
    const data = forgotPasswordSchema.parse({
      email: 'Test@Example.COM',
    })
    expect(data.email).toBe('test@example.com')
  })

  it('requires valid email', () => {
    expect(() => forgotPasswordSchema.parse({
      email: 'invalid-email',
    })).toThrow('Invalid email address')
  })
})