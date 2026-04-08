import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginData } from '@/lib/validation/auth-schemas'
import { toast } from 'sonner'

interface LoginFormProps {
  onSuccess?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LoginData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')

  // Clear submit error when form changes
  useEffect(() => {
    if (submitError) setSubmitError('')
  }, [formData, submitError])

  const validateField = (field: keyof LoginData, value: unknown) => {
    try {
      const result = loginSchema.pick({ [field]: true }).parse({ [field]: value })
      setErrors(prev => ({ ...prev, [field]: undefined }))
      return true
    } catch (error: unknown) {
      const zodError = error as { errors?: { message: string }[] }
      const message = zodError.errors?.[0]?.message || 'Invalid value'
      setErrors(prev => ({ ...prev, [field]: message }))
      return false
    }
  }

  const handleInputChange = (field: keyof LoginData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: keyof LoginData) => {
    validateField(field, formData[field])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    // Validate all fields
    const validation = loginSchema.safeParse(formData)
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof LoginData, string>> = {}
      validation.error.errors.forEach(err => {
        const field = err.path[0] as keyof LoginData
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await signIn(formData.email, formData.password, formData.rememberMe)
      if (result.success) {
        toast.success('Welcome back!')
        onSuccess?.()
        const returnUrl = (location.state as { from?: string })?.from || '/dashboard'
        navigate(returnUrl, { replace: true })
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to your eco-scuba account
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

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                data-testid="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                disabled={loading}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
                disabled={loading}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me
              </Label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline focus:underline"
            >
              Forgot password?
            </Link>
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary hover:underline focus:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}