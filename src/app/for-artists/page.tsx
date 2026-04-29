'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ROUTES } from '@/shared/constants/routes'

export default function ForArtistsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.get(`${apiUrl}/auth/google`, { withCredentials: true })
      const authUrl = response.data?.data?.url || response.data?.url
      if (authUrl) window.location.href = authUrl
    } catch {
      setError('Google login is currently unavailable.')
    }
  }

  const handleFacebookLogin = () => {
    setError('Facebook login is coming soon!')
  }

  const handleAppleLogin = () => {
    setError('Apple login is coming soon!')
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // Redirect to login page with email pre-filled
    router.push(`${ROUTES.LOGIN}?email=${encodeURIComponent(email)}&redirect=${ROUTES.ARTIST_STUDIO}`)
  }

  return (
    <div
      data-testid="for-artists-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Sign-in Box */}
      <div
        data-testid="for-artists-signin-box"
        style={{
          width: '100%',
          maxWidth: 450,
          background: '#222',
          borderRadius: 8,
          padding: '40px 36px',
          margin: '24px',
        }}
      >
        {/* Heading */}
        <h1
          data-testid="for-artists-title"
          style={{
            color: '#fff',
            fontSize: 22,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 16,
            lineHeight: 1.3,
          }}
        >
          Sign in or create an account
        </h1>

        {/* Legal text */}
        <p
          style={{
            color: '#999',
            fontSize: 11,
            textAlign: 'center',
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          By clicking on any of the &apos;Continue&apos; buttons below, you agree to
          BioBeats&apos;{' '}
          <span style={{ color: '#ff5500', cursor: 'pointer' }}>Terms of Use</span> and
          acknowledge our{' '}
          <span style={{ color: '#ff5500', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>

        {/* Error message */}
        {error && (
          <div
            data-testid="for-artists-error"
            style={{
              background: 'rgba(255,85,0,0.1)',
              border: '1px solid #ff5500',
              color: '#ff5500',
              fontSize: 12,
              padding: '8px 12px',
              borderRadius: 4,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Social Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {/* Facebook */}
          <button
            data-testid="for-artists-facebook-btn"
            onClick={handleFacebookLogin}
            style={{
              width: '100%',
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: '#3578e5',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>

          {/* Google */}
          <button
            data-testid="for-artists-google-btn"
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: '#fff',
              color: '#333',
              border: 'none',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          {/* Apple */}
          <button
            data-testid="for-artists-apple-btn"
            onClick={handleAppleLogin}
            style={{
              width: '100%',
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: '#000',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="16" height="18" viewBox="0 0 384 512" fill="white">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, height: 1, background: '#444' }} />
          <span style={{ color: '#999', fontSize: 12 }}>Or with email</span>
          <div style={{ flex: 1, height: 1, background: '#444' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleContinue}>
          <input
            data-testid="for-artists-email-input"
            type="text"
            placeholder="Your email address or profile URL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              height: 44,
              background: '#333',
              border: 'none',
              borderRadius: 4,
              padding: '0 14px',
              color: '#fff',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
              marginBottom: 12,
            }}
          />
          <button
            data-testid="for-artists-continue-btn"
            type="submit"
            style={{
              width: '100%',
              height: 44,
              background: email ? '#ff5500' : '#555',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 14,
              fontWeight: 700,
              cursor: email ? 'pointer' : 'default',
              fontFamily: 'inherit',
              transition: 'background 200ms',
            }}
          >
            Continue
          </button>
        </form>

        {/* Need help */}
        <div style={{ marginTop: 20, textAlign: 'left' }}>
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            data-testid="for-artists-need-help-link"
            style={{
              color: '#4a90d9',
              fontSize: 12,
              textDecoration: 'none',
            }}
          >
            Need help?
          </Link>
        </div>
      </div>
    </div>
  )
}
