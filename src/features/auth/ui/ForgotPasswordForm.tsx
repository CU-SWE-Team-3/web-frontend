'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import apiClient from '@/shared/api/client'
import { AppInput, AppButton } from '@/shared/ui'
import { ROUTES } from '@/shared/constants/routes'

// ─── ForgotPasswordForm ───────────────────────────────────────────────────────
// POST /auth/forgot-password  body: { email }
// Always returns 200 (to prevent email enumeration) — no change needed here.

const DEV_MOCK_MODE = false // TODO: Set to false when testing with real backend

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    if (!email) { setError('Email is required'); return false }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setError('')
    try {
      if (DEV_MOCK_MODE) {
        // Simulate a 1-second network delay then succeed
        await new Promise((res) => setTimeout(res, 1000))
        setSuccess(true)
        return
      }

      await apiClient.post('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div data-testid="forgot-password-success" className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ff5500]/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#ff5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold">Email sent!</h2>
        <p className="text-[#999] text-sm max-w-xs">
          If <span className="text-white">{email}</span> is registered, you&apos;ll receive a
          password reset link shortly. Check your spam folder too.
        </p>
        <Link href={ROUTES.LOGIN} data-testid="forgot-password-back-link" className="text-[#ff5500] text-sm hover:underline">
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} data-testid="forgot-password-form" className="flex flex-col gap-5 w-full">
      <p className="text-[#999] text-sm leading-relaxed">
        Enter the email address linked to your account.
        We&apos;ll send you a link to reset your password.
      </p>

      <AppInput
        id="forgot-email"
        data-testid="forgot-password-email-input"
        type="email"
        label="Email address"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError('') }}
        error={error}
        required
      />

      <AppButton type="submit" fullWidth isLoading={isLoading} data-testid="forgot-password-submit-btn">
        Send Reset Link
      </AppButton>

      <p className="text-center text-xs text-[#999]">
        Remembered it?{' '}
        <Link href={ROUTES.LOGIN} data-testid="forgot-password-signin-link" className="text-[#ff5500] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  )
}

export default ForgotPasswordForm
