// app/(auth)/login/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// This file is just a "thin shell" — it imports the LoginForm and places it
// inside the auth layout. All the real logic lives in LoginForm.tsx

import type { Metadata } from 'next'
import LoginForm from '@/features/auth/ui/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — SoundCloud',
  description: 'Sign in to your SoundCloud account',
}

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h1 className="text-white text-2xl font-bold">Sign in</h1>
        <p className="text-[#999] text-sm mt-1">to continue to SoundCloud</p>
      </div>

      {/* The login form component does all the work */}
      <LoginForm />
    </div>
  )
}
