'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { AppInput, AppButton } from '@/shared/ui'
import { ROUTES } from '@/shared/constants/routes'

// ─── ResetPasswordForm ────────────────────────────────────────────────────────
// PATCH /auth/reset-password
// Body: { token, newPassword }
// NOTE: confirmPassword is frontend-only validation — NOT sent to the API.
// The spec requires only { token, newPassword }.

const ResetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  // URLSearchParams automatically converts '+' to space (' '). 
  // Base64 tokens from the backend often contain '+' which get mangled. 
  // We restore the '+' by replacing spaces.
  const token = searchParams.get('token')?.replace(/ /g, '+') ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!newPassword) newErrors.newPassword = 'Password is required'
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters'
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // POST /auth/reset-password  body: { token, newPassword }
  // confirmPassword is frontend validation only — not included in the request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (!token) {
      setErrors({ general: 'Invalid or expired reset link. Please request a new one.' })
      return
    }
    setIsLoading(true)
    setErrors({})
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      await axios.patch(
        `${apiUrl}/auth/reset-password`,
        { token, newPassword },   // <-- no confirmPassword in body per the spec
        { withCredentials: true }
      )
      setSuccess(true)
    } catch {
      setErrors({ general: 'This link has expired or is invalid. Please request a new reset link.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div data-testid="reset-password-success" className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ff5500]/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#ff5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold">Password updated!</h2>
        <p className="text-[#999] text-sm">Your password has been changed successfully.</p>
        <AppButton onClick={() => router.push(ROUTES.LOGIN)} fullWidth data-testid="reset-password-signin-btn">
          Sign In Now
        </AppButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} data-testid="reset-password-form" className="flex flex-col gap-5 w-full">
      {errors.general && (
        <div data-testid="reset-password-error" className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-4 py-2 rounded-sm">
          {errors.general}
        </div>
      )}

      <p className="text-[#999] text-sm">Choose a strong password of at least 8 characters.</p>

      <AppInput id="new-password" data-testid="reset-password-new-input" type="password" label="New password"
        placeholder="New password (min. 8 characters)"
        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
        error={errors.newPassword} required />

      <AppInput id="confirm-password" data-testid="reset-password-confirm-input" type="password" label="Confirm new password"
        placeholder="Repeat your new password"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword} required />

      <AppButton type="submit" fullWidth isLoading={isLoading} data-testid="reset-password-submit-btn">
        Reset Password
      </AppButton>
    </form>
  )
}

export default ResetPasswordForm
