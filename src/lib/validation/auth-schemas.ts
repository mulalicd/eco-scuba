import { z } from 'zod'

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

// Register schema
export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  organization: z.string().max(100, 'Organization name is too long').optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain one uppercase letter')
    .regex(/[0-9]/, 'Must contain one number')
    .refine(val => /[!@#$%^&*()_+\-=[ \] {};"':\\|,.<>/?]/.test(val), {
      message: 'Must contain one special character (!@#$%^&*...)'
    }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' })
  }),
})

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
})

// Type exports
export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>