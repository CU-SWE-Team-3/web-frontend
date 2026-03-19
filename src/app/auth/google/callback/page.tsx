'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { ROUTES } from '@/shared/constants/routes'

// GET /auth/google/callback?code=...
// Returns { success, data: { user } } + sets HttpOnly cookies

function GoogleCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const code = searchParams.get('code')

  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) {
      setError('No authorization code received from Google.')
      return
    }

    const handleCallback = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        const { data } = await axios.get(`${apiUrl}/auth/google/callback`, {
          params: { code },
          withCredentials: true,
        })
        const user = data?.data?.user
        if (user) {
          login(user)
          router.push(ROUTES.FEED)
        } else {
          setError('Failed to complete Google sign in.')
        }
      } catch {
        setError('Google sign in failed. Please try again.')
      }
    }

    handleCallback()
  }, [code, login, router])

  if (error) {
    return (
      <div data-testid="google-callback-error" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#111', color: '#fff',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Sign In Failed</h2>
          <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>{error}</p>
          <a
            href={ROUTES.LOGIN}
            data-testid="google-callback-back-btn"
            style={{
              display: 'inline-block', background: '#ff5500', color: '#fff',
              padding: '10px 24px', borderRadius: 4, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}
          >
            Back to Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="google-callback-loading" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#111', color: '#fff',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Completing sign in...</h2>
        <p style={{ color: '#999', fontSize: 14 }}>Please wait while we sign you in with Google.</p>
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#111' }} />}>
      <GoogleCallbackContent />
    </Suspense>
  )
}
