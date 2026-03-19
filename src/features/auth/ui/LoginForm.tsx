'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { AppInput, AppButton } from '@/shared/ui'
import { useAuthStore } from '../model/useAuthStore'
import { ROUTES } from '@/shared/constants/routes'

// ─── LoginForm ─────────────────────────────────────────────────────────────
// POST /auth/login  → sets HttpOnly cookies, returns { data: { user } }
// No accessToken in body — the backend sets it as an HttpOnly cookie.
// GET  /auth/google → returns { data: { url } } → redirect browser there.

const LoginForm = () => {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // GET /auth/google → { success, data: { url } }
  const handleGoogleLogin = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.get(`${apiUrl}/auth/google`, { withCredentials: true })
      // The YAML spec says response.data.data.url, but let's handle both just in case
      const authUrl = response.data?.data?.url || response.data?.url
      if (!authUrl) throw new Error('No URL returned from backend')
      window.location.href = authUrl
    } catch {
      setErrors({ general: 'Google login is currently unavailable.' })
    }
  }

  const handleFacebookLogin = () => {
    setErrors({ general: 'Facebook login is coming soon! Please use Email or Google.' })
  }

  // POST /auth/login { email, password }
  // Response: { data: { user } }  — token is set as HttpOnly cookie automatically
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.post(
        `${apiUrl}/auth/login`,
        { email, password },
        { withCredentials: true }
      )
      const user = response.data?.data?.user
      if (user) {
        login(user)
        router.push(ROUTES.FEED)
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Invalid email or password.'
      setErrors({ general: message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form" className="flex flex-col gap-4 w-full">

      {errors.general && (
        <div data-testid="login-error" className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-4 py-2 rounded-sm">
          {errors.general}
        </div>
      )}

      <AppInput
        id="login-email"
        data-testid="login-email-input"
        type="email"
        label="Email address"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />

      <AppInput
        id="login-password"
        data-testid="login-password-input"
        type="password"
        label="Password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        required
      />

      <div className="text-right">
        <Link href={ROUTES.FORGOT_PASSWORD} data-testid="login-forgot-password-link" className="text-xs text-[#ff5500] hover:underline">
          Forgot your password?
        </Link>
      </div>

      <AppButton type="submit" fullWidth isLoading={isLoading} data-testid="login-submit-btn">
        Sign In
      </AppButton>

      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-[#444]" />
        <span className="text-xs text-[#999]">or continue with</span>
        <div className="flex-1 h-px bg-[#444]" />
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        data-testid="login-google-btn"
        className="w-full h-10 flex items-center justify-center gap-3 bg-white text-black text-sm font-medium rounded-sm hover:bg-gray-100 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      {/* Facebook */}
      <button
        type="button"
        onClick={handleFacebookLogin}
        data-testid="login-facebook-btn"
        className="w-full h-10 flex items-center justify-center gap-3 bg-[#1877f2] text-white text-sm font-medium rounded-sm hover:bg-[#166fe5] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continue with Facebook
      </button>

      <p className="text-center text-xs text-[#999] mt-2">
        Don&apos;t have an account?{' '}
        <Link href={ROUTES.REGISTER} data-testid="login-register-link" className="text-[#ff5500] hover:underline font-medium">
          Create one for free
        </Link>
      </p>

    </form>
  )
}

export default LoginForm
