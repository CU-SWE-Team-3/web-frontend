import React from 'react'
import Link from 'next/link'
import { ROUTES } from '@/shared/constants/routes'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      <header className="border-b border-[#222] px-6 py-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 w-fit">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z"/>
          </svg>
          <span className="text-white font-bold text-lg tracking-tight">SoundCloud</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>
      <footer className="border-t border-[#222] px-6 py-4 text-center">
        <p className="text-[#555] text-xs">
          © {new Date().getFullYear()} SoundCloud Limited
        </p>
      </footer>
    </div>
  )
}
