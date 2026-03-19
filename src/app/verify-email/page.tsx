'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { ROUTES } from '@/shared/constants/routes'

// POST /auth/verify-email  body: { token }
// Returns { success, message, data: { user } }

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found. Please check your email link.')
      return
    }

    const verify = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        await axios.post(`${apiUrl}/auth/verify-email`, { token }, { withCredentials: true })
        setStatus('success')
        setMessage('Your email has been verified successfully!')
      } catch {
        setStatus('error')
        setMessage('This verification link is invalid or has expired. Please request a new one.')
      }
    }

    verify()
  }, [token])

  return (
    <div data-testid="verify-email-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111',
      color: '#fff',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 24 }}>
        {status === 'loading' && (
          <div data-testid="verify-email-loading">
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Verifying your email...</h2>
            <p style={{ color: '#999', fontSize: 14 }}>Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div data-testid="verify-email-success">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Email Verified!</h2>
            <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link
              href={ROUTES.LOGIN}
              data-testid="verify-email-signin-btn"
              style={{
                display: 'inline-block',
                background: '#ff5500',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div data-testid="verify-email-error">
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Verification Failed</h2>
            <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link
              href={ROUTES.LOGIN}
              data-testid="verify-email-back-btn"
              style={{
                display: 'inline-block',
                background: '#333',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 4,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#111' }} />}>
      <VerifyEmailContent />
    </Suspense>
  )
}
