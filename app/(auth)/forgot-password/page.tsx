// app/(auth)/forgot-password/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "Forgot Password" page — user enters their email to get a reset link

import type { Metadata } from 'next'
import ForgotPasswordForm from '@/features/auth/ui/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password — SoundCloud',
  description: 'Reset your SoundCloud account password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Forgot your password?</h1>
        <p className="text-[#999] text-sm mt-1">No worries, we&apos;ll sort it out</p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
