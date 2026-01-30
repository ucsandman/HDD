'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isVerifying = searchParams.get('verify') === 'true'
  const callbackError = searchParams.get('error')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('resend', {
        email,
        redirect: false,
        callbackUrl: '/',
      })

      if (result?.error) {
        setError('Unable to send login link. Please verify your email is registered.')
      } else {
        // Redirect to verify page
        window.location.href = '/login?verify=true'
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent you a login link. Click the link in the email to sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Did not receive the email? Check your spam folder or try again.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/login'}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-gray-900 flex items-center justify-center">
          <span className="text-white font-bold text-lg">HD</span>
        </div>
        <CardTitle>Sign in to GBP Poster</CardTitle>
        <CardDescription>
          Enter your email to receive a magic link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {(error || callbackError) && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-700">
                {error || 'Your email is not registered. Contact an administrator.'}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send magic link
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function LoginLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<LoginLoading />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
