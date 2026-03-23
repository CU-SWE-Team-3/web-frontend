import type { Metadata } from 'next'
import { RegisterForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Create Account — SoundCloud',
  description: 'Create your SoundCloud account',
}

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Create account</h1>
        <p className="text-[#999] text-sm mt-1">to continue to SoundCloud</p>
      </div>
      <RegisterForm />
    </div>
  )
}
