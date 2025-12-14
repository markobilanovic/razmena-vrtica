'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      // Store the token
      localStorage.setItem('access_token', token)
      
      // Redirect to dashboard
      router.push('/dashboard')
    } else {
      // No token, redirect to login with error
      router.push('/login?error=oauth_failed')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  )
}