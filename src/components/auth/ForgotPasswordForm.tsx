import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { forgotPasswordSchema, type ForgotPasswordData } from '@/lib/validation/auth-schemas'
import { toast } from 'sonner'

interface ForgotPasswordFormProps {
  onSuccess?: () => void
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess }) => {
  const { resetPassword, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ForgotPasswordData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  // Clear submit error when form changes
  useEffect(() => {
    if (submitError) setSubmitError('')
  }, [formData, submitError])

  const validateField = (field: keyof ForgotPasswordData, value: unknown) => {
    try {
      const result = forgotPasswordSchema.pick({ [field]: true }).parse({ [field]: value })
      setErrors(prev => ({ ...prev, [field]: undefined }))
      return true
    } catch (error: unknown) {
      const zodError = error as { errors?: { message: string }[] }
      const message = zodError.errors?.[0]?.message || 'Invalid value'
      setErrors(prev => ({ ...prev, [field]: message }))
      return false
    }
  }

  const handleInputChange = (field: keyof ForgotPasswordData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: keyof ForgotPasswordData) => {
    validateField(field, formData[field])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSuccess(false)

    // Validate all fields
    const validation = forgotPasswordSchema.safeParse(formData)
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordData, string>> = {}
      validation.error.errors.forEach(err => {
        const field = err.path[0] as keyof ForgotPasswordData
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await resetPassword(formData.email)
      if (result.success) {
        setSuccess(true)
        toast.success('Password reset email sent!')
        onSuccess?.()
      } else {
        setSubmitError(result.error.message)
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loading = authLoading || isSubmitting

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Check your email</CardTitle>
          <CardDescription className="text-center">
            We've sent password reset instructions to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              If an account exists with the email address you provided, you'll receive
              a password reset link shortly. Please check your inbox and spam folder.
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Reset password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {submitError && (
            <Alert variant="destructive" aria-live="polite">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                data-testid="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                disabled={loading}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="submit"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Sending reset link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}