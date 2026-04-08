import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Building, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterData } from '@/lib/validation/auth-schemas'
import { toast } from 'sonner'

interface RegisterFormProps {
  onSuccess?: () => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate()
  const { signUp, loading: authLoading } = useAuth()

  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    fullName: '',
    organization: '',
    rememberMe: false,
    acceptTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')

  // Clear submit error when form changes
  useEffect(() => {
    if (submitError) setSubmitError('')
  }, [formData, submitError])

  const validateField = (field: keyof RegisterData, value: unknown) => {
    try {
      const result = registerSchema.pick({ [field]: true }).parse({ [field]: value })
      setErrors(prev => ({ ...prev, [field]: undefined }))
      return true
    } catch (error: unknown) {
      const zodError = error as { errors?: { message: string }[] }
      const message = zodError.errors?.[0]?.message || 'Invalid value'
      setErrors(prev => ({ ...prev, [field]: message }))
      return false
    }
  }

  const handleInputChange = (field: keyof RegisterData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: keyof RegisterData) => {
    validateField(field, formData[field])
  }

  const getPasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[!@#$%^&*()_+\-=[ \] {};"':\\|,.<>/?]/.test(password)) score++
    return score
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    // Validate all fields
    const validation = registerSchema.safeParse(formData)
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof RegisterData, string>> = {}
      validation.error.errors.forEach(err => {
        const field = err.path[0] as keyof RegisterData
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await signUp(formData)
      if (result.success) {
        toast.success('Account created successfully!')
        onSuccess?.()
        navigate('/dashboard', { replace: true })
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
        <CardTitle className="text-2xl font-bold text-center">Create account</CardTitle>
        <CardDescription className="text-center">
          Join eco-scuba to start your environmental projects
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
            <Label htmlFor="fullName">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                data-testid="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                disabled={loading}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                autoComplete="name"
              />
            </div>
            {errors.fullName && (
              <p id="fullName-error" className="text-sm text-destructive" role="alert">
                {errors.fullName}
              </p>
            )}
          </div>

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
            <Label htmlFor="organization">Organization (optional)</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="organization"
                type="text"
                placeholder="Your organization or company"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                onBlur={() => handleBlur('organization')}
                className={`pl-10 ${errors.organization ? 'border-destructive' : ''}`}
                disabled={loading}
                aria-describedby={errors.organization ? 'organization-error' : undefined}
                autoComplete="organization"
              />
            </div>
            {errors.organization && (
              <p id="organization-error" className="text-sm text-destructive" role="alert">
                {errors.organization}
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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                disabled={loading}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="new-password"
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

            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Password strength:</span>
                  <span className={passwordStrength >= 3 ? 'text-green-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${strengthColors[passwordStrength]}`}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <Collapsible open={showRequirements} onOpenChange={setShowRequirements}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between p-0 h-auto font-normal text-xs text-muted-foreground hover:text-foreground"
                >
                  Password requirements
                  {showRequirements ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 text-xs text-muted-foreground mt-2">
                <p>• At least 8 characters</p>
                <p>• One uppercase letter (A-Z)</p>
                <p>• One number (0-9)</p>
                <p>• One special character (!@#$%^&*...)</p>
              </CollapsibleContent>
            </Collapsible>

            {errors.password && (
              <p id="password-error" className="text-sm text-destructive" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="acceptTerms"
              data-testid="acceptTerms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => handleInputChange('acceptTerms', !!checked)}
              disabled={loading}
              aria-describedby={errors.acceptTerms ? 'terms-error' : undefined}
            />
            <Label
              htmlFor="acceptTerms"
              className="text-sm font-normal cursor-pointer"
            >
              I accept the{' '}
              <Link
                to="/terms"
                className="text-primary hover:underline focus:underline"
                target="_blank"
              >
                terms and conditions
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p id="terms-error" className="text-sm text-destructive" role="alert">
              {errors.acceptTerms}
            </p>
          )}
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
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:underline focus:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}