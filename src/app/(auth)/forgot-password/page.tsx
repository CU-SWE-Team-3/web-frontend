import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Reset Password — SoundCloud',
  description: 'Reset your SoundCloud password',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Reset password</h1>
        <p className="text-[#999] text-sm mt-1">to continue to SoundCloud</p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
