'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import ReCAPTCHA from 'react-google-recaptcha'
import { AppInput, AppButton } from '@/shared/ui'
import { ROUTES } from '@/shared/constants/routes'
import { useAuthStore } from '../model/useAuthStore'

// ─── RegisterForm ─────────────────────────────────────────────────────────────
// POST /auth/register
// Body: { email, password, displayName, captchaToken, age?, gender? }
// Required: email, password, displayName, captchaToken
// confirmPassword is frontend-only validation — NOT sent to the backend.

const RegisterForm = () => {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    displayName?: string; email?: string; password?: string; confirmPassword?: string; captcha?: string; general?: string
  }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!displayName.trim()) newErrors.displayName = 'Display name is required'
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!captchaToken) newErrors.captcha = 'Please complete the CAPTCHA'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // GET /auth/google → { data: { url } }
  const handleGoogleLogin = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await axios.get(`${apiUrl}/auth/google`, { withCredentials: true })
      const authUrl = response.data?.data?.url || response.data?.url
      if (!authUrl) throw new Error('No URL returned from backend')
      window.location.href = authUrl
    } catch {
      setErrors({ general: 'Google signup is currently unavailable.' })
    }
  }

  const handleFacebookLogin = () => {
    setErrors({ general: 'Facebook registration is coming soon! Please use Email or Google.' })
  }

  // POST /auth/register
  // Body: { email, password, displayName, captchaToken }
  // confirmPassword is frontend only — not sent to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      await axios.post(
        `${apiUrl}/auth/register`,
        {
          email,
          password,
          displayName: displayName.trim(),
          captchaToken,
        },
        { withCredentials: true }
      )
      setSuccess(true)
    } catch {
      setErrors({ general: 'Registration failed. This email may already be in use.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div data-testid="register-success" className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ff5500]/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#ff5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold">Check your inbox!</h2>
        <p className="text-[#999] text-sm">
          We sent a verification link to <span className="text-white">{email}</span>.
          Click the link in the email to activate your account.
        </p>
        <AppButton onClick={() => router.push(ROUTES.LOGIN)} variant="secondary" data-testid="register-back-to-signin-btn">
          Back to Sign In
        </AppButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} data-testid="register-form" className="flex flex-col gap-4 w-full">

      {errors.general && (
        <div data-testid="register-error" className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-4 py-2 rounded-sm">
          {errors.general}
        </div>
      )}

      {/* Social signup */}
      <button type="button" onClick={handleGoogleLogin} data-testid="register-google-btn" className="w-full h-10 flex items-center justify-center gap-3 bg-white text-black text-sm font-medium rounded-sm hover:bg-gray-100 transition-colors">
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <button type="button" onClick={handleFacebookLogin} data-testid="register-facebook-btn" className="w-full h-10 flex items-center justify-center gap-3 bg-[#1877f2] text-white text-sm font-medium rounded-sm hover:bg-[#166fe5] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Continue with Facebook
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#444]" />
        <span className="text-xs text-[#999]">or with email</span>
        <div className="flex-1 h-px bg-[#444]" />
      </div>

      <AppInput id="reg-displayname" data-testid="register-displayname-input" type="text" label="Display name" placeholder="Your name or artist name"
        value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={errors.displayName} required />

      <AppInput id="reg-email" data-testid="register-email-input" type="email" label="Email address" placeholder="your@email.com"
        value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />

      <AppInput id="reg-password" data-testid="register-password-input" type="password" label="Password" placeholder="At least 8 characters"
        value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />

      <AppInput id="reg-confirm" data-testid="register-confirm-input" type="password" label="Confirm password" placeholder="Repeat your password"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} required />

      {/* CAPTCHA */}
      <div data-testid="register-captcha" className="flex flex-col gap-1">
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
          onChange={(token) => setCaptchaToken(token)}
          theme="dark"
        />
        {errors.captcha && <p className="text-red-500 text-xs">{errors.captcha}</p>}
      </div>

      <p className="text-[11px] text-[#777] leading-tight">
        By creating an account, you agree to SoundCloud&apos;s{' '}
        <span className="text-[#ff5500] cursor-pointer hover:underline">Terms of Use</span> and acknowledge our{' '}
        <span className="text-[#ff5500] cursor-pointer hover:underline">Privacy Policy</span>.
      </p>

      <AppButton type="submit" fullWidth isLoading={isLoading} data-testid="register-submit-btn">
        Create Account
      </AppButton>

      <p className="text-center text-xs text-[#999]">
        Already have an account?{' '}
        <Link href={ROUTES.LOGIN} data-testid="register-login-link" className="text-[#ff5500] hover:underline font-medium">Sign in</Link>
      </p>

    </form>
  )
}

export default RegisterForm
