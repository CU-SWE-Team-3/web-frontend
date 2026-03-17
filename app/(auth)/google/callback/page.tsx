'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authRepository } from '@/features/auth/api/authRepository'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { ROUTES } from '@/shared/constants/routes'

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // If there are no search params, something went wrong
      if (!searchParams.toString()) return

      try {
        // Exchange the URL parameters (like ?code=...) for a real session token
        const response = await authRepository.handleGoogleCallback(searchParams)
        
        // Save the user and token to our Zustand store (just like a normal login)
        login(response.data.user, response.data.accessToken)
        
        // Redirect to the feed page
        router.push(ROUTES.FEED)
      } catch (err) {
        console.error('Google OAuth callback failed:', err)
        setError('Failed to log in with Google. Please try again.')
      }
    }

    handleCallback()
  }, [searchParams, login, router])

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      {error ? (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold">Login Failed</h2>
          <p className="text-[#999] text-sm">{error}</p>
          <button 
            onClick={() => router.push(ROUTES.LOGIN)}
            className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-sm hover:bg-gray-200"
          >
            Back to Sign In
          </button>
        </>
      ) : (
        <>
          <svg className="animate-spin h-8 w-8 text-[#ff5500]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-white font-medium">Completing secure sign-in...</p>
        </>
      )}
    </div>
  )
}
