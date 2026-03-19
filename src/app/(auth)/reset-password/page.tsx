import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'New Password — SoundCloud',
  description: 'Set your new SoundCloud password',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white text-2xl font-bold">New password</h1>
        <p className="text-[#999] text-sm mt-1">Choose a strong password</p>
      </div>
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
