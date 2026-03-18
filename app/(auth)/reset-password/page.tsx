// app/(auth)/reset-password/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// "Reset Password" page — user arrives here from the link in their email.
// The URL contains a ?token=... that we read inside ResetPasswordForm.

import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResetPasswordForm from '@/features/auth/ui/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set New Password — SoundCloud',
  description: 'Set a new password for your SoundCloud account',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Set a new password</h1>
        <p className="text-[#999] text-sm mt-1">Make it a strong one!</p>
      </div>
      {/* Suspense is required because ResetPasswordForm uses useSearchParams() */}
      <Suspense fallback={<div className="text-[#999] text-sm">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
