'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppInput from '@/shared/ui/AppInput'
import AppButton from '@/shared/ui/AppButton'
import { authRepository } from '../api/authRepository'
import { ROUTES } from '@/shared/constants/routes'

// ─── ResetPasswordForm ────────────────────────────────────────────────────────
// User lands here from the email link (e.g. /reset-password?token=abc123).
// They set a new password, and we call the API with the token + new password.

const ResetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Read ?token=... from the URL — the backend sent this in the reset email
  const token = searchParams.get('token') ?? ''

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
      await authRepository.resetPassword({ token, newPassword, confirmPassword })
      setSuccess(true)
    } catch {
      setErrors({ general: 'This link has expired or is invalid. Please request a new reset link.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#ff5500]/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-[#ff5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white text-xl font-bold">Password updated!</h2>
        <p className="text-[#999] text-sm">Your password has been changed successfully.</p>
        <AppButton onClick={() => router.push(ROUTES.LOGIN)} fullWidth>
          Sign In Now
        </AppButton>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
      {errors.general && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm px-4 py-2 rounded-sm">
          {errors.general}
        </div>
      )}

      <p className="text-[#999] text-sm">Choose a strong password of at least 8 characters.</p>

      <AppInput id="new-password" type="password" label="New password"
        placeholder="New password (min. 8 characters)"
        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
        error={errors.newPassword} required />

      <AppInput id="confirm-password" type="password" label="Confirm new password"
        placeholder="Repeat your new password"
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword} required />

      <AppButton type="submit" fullWidth isLoading={isLoading}>
        Reset Password
      </AppButton>
    </form>
  )
}

export default ResetPasswordForm
