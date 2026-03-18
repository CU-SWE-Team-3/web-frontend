// This layout wraps all auth pages: login, register, forgot-password, reset-password.
// It gives them a consistent dark background with the SoundCloud logo on top.

import React from 'react'
import Link from 'next/link'
import { ROUTES } from '@/shared/constants/routes'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">

      {/* Top bar with logo */}
      <header className="border-b border-[#222] px-6 py-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 w-fit">
          {/* SoundCloud logo mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
            <path d="M0 22.4c0 2.56 1.92 4.8 4.48 4.8s4.48-2.24 4.48-4.8v-4.8C8.96 20.16 7.04 22.4 4.48 22.4S0 24.96 0 22.4zM1.28 17.6c0-1.76 1.44-3.2 3.2-3.2s3.2 1.44 3.2 3.2-1.44 3.2-3.2 3.2-3.2-1.44-3.2-3.2z"/>
            <path d="M9.6 22.4V12.8c0-1.76 1.44-3.2 3.2-3.2s3.2 1.44 3.2 3.2v9.6c0 1.76-1.44 3.2-3.2 3.2s-3.2-1.44-3.2-3.2z"/>
            <path d="M17.6 22.4V9.6c0-1.76 1.44-3.2 3.2-3.2s3.2 1.44 3.2 3.2v12.8c0 1.76-1.44 3.2-3.2 3.2s-3.2-1.44-3.2-3.2z"/>
            <path d="M25.6 22.4V6.4c0-1.76 1.44-3.2 3.2-3.2S32 4.64 32 6.4v16c0 1.76-1.44 3.2-3.2 3.2s-3.2-1.44-3.2-3.2z"/>
          </svg>
          <span className="text-white font-bold text-lg tracking-tight">SoundCloud</span>
        </Link>
      </header>

      {/* Main content area — centered card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          {/* The auth form goes here (injected by each page) */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] px-6 py-4 text-center">
        <p className="text-[#555] text-xs">
          © {new Date().getFullYear()} SoundCloud Limited
        </p>
      </footer>

    </div>
  )
}
