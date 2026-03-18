'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { ROUTES } from '@/shared/constants/routes'

// ─── GoogleCallbackPage ───────────────────────────────────────────────────────
// This page is where the browser lands AFTER the backend processes the Google OAuth.
//
// Flow:
//   1. User clicked "Continue with Google" on the login/register page
//   2. We called GET /auth/google → got back a Google OAuth URL
//   3. Browser redirected to Google → user picked account
//   4. Google redirected to the BACKEND's /auth/google/callback?code=...
//   5. Backend set HttpOnly accessToken + refreshToken cookies
//   6. Backend then redirected the browser HERE (/google/callback)
//
// Since the cookies are already set by the backend, we call POST /auth/refresh
// to get the current user object and save it to the Zustand store.

export default function GoogleCallbackPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const finishGoogleLogin = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const permalink = urlParams.get('permalink')
        const code = urlParams.get('code')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL

        // The new flow: Backend redirects with ?permalink=their_username
        if (permalink) {
          // Explicitly hit the profile endpoint using the permalink provided by backend
          const userResp = await axios.get(`${apiUrl}/profile/${permalink}`, { withCredentials: true })
          
          if (userResp.data?.data?.user || userResp.data?.user || userResp.data?.data) {
             const user = userResp.data?.data?.user || userResp.data?.user || userResp.data?.data
             login(user)
             router.push(ROUTES.FEED)
             return
          }
          throw new Error('Failed to fetch user profile with permalink.')
        }

        // Fallback: If no permalink, maybe they just hit /auth/me or old /refresh flow
        if (!code) {
          const userResp = await axios.get(`${apiUrl}/auth/me`, { withCredentials: true })
          if (userResp.data?.data?.user || userResp.data?.user) {
            const user = userResp.data?.data?.user || userResp.data?.user
            login(user)
            router.push(ROUTES.FEED)
            return
          }
          throw new Error('No authorization code or permalink found in URL.')
        }

        // The user manually hit the backend URL and got JSON, or backend passed the code.
        const response = await axios.get(`${apiUrl}/auth/google/callback`, {
          params: { code, ...Object.fromEntries(urlParams.entries()) },
          withCredentials: true
        })

        // If the backend returns the JSON shown in the screenshot directly:
        const userData = response.data?.data?.user || response.data?.user
        if (userData) {
          login(userData)
          router.push(ROUTES.FEED)
        } else {
          // Fallback if it only sets cookies
          const userResp = await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true })
          login(userResp.data.data.user)
          router.push(ROUTES.FEED)
        }
      } catch (err: any) {
        console.error('Google Callback Error:', err)
        setError(err.response?.data?.message || err.message || 'Google sign-in failed.')
      }
    }

    if (typeof window !== 'undefined') {
      finishGoogleLogin()
    }
  }, [login, router])

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
          <p className="text-white font-medium">Completing Google sign-in...</p>
          <p className="text-[#999] text-xs">Please wait...</p>
        </>
      )}
    </div>
  )
}
