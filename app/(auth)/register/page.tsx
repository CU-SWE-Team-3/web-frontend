// app/(auth)/register/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Registration page — shows the sign-up form with CAPTCHA

import type { Metadata } from 'next'
import RegisterForm from '@/features/auth/ui/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account — SoundCloud',
  description: 'Create a free SoundCloud account to discover and share music',
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Create your account</h1>
        <p className="text-[#999] text-sm mt-1">It&apos;s free and only takes a minute</p>
      </div>
      <RegisterForm />
    </div>
  )
}
