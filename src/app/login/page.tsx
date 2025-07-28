'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        router.push('/admin')
      }
    })
  }, [router])

  const handleAzureSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn('azure-ad', { 
        callbackUrl: '/admin',
        redirect: false 
      })
      
      if (result?.ok) {
        router.push('/admin')
      } else if (result?.error) {
        console.error('Sign in error:', result.error)
        alert('Sign in failed. Please try again.')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Hermione</CardTitle>
          <CardDescription>
            Sign in with your Microsoft account to access the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleAzureSignIn}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in with Microsoft'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>Access is restricted to authorized staff members only.</p>
            <p className="mt-2">If you don't have access, please contact your administrator.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}