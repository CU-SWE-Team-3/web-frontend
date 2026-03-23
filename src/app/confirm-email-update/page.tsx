'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import { ROUTES } from '@/shared/constants/routes'

function ConfirmEmailUpdateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No confirmation token found. Please check your email link.')
      return
    }

    const confirmEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        await axios.post(`${apiUrl}/auth/confirm-email-update`, { token }, { withCredentials: true })
        setStatus('success')
        setMessage('Your email has been successfully updated!')
      } catch (err: any) {
        setStatus('error')
        setMessage(err.response?.data?.message || 'This confirmation link is invalid or has expired.')
      }
    }

    confirmEmail()
  }, [token])

  return (
    <div data-testid="confirm-email-page" className="min-h-screen bg-[#111111] flex items-center justify-center text-white font-sans p-4">
      <div className="w-full max-w-[400px] text-center p-6 bg-[#1a1a1a] rounded-md border border-[#333]">
        {status === 'loading' && (
          <div data-testid="confirm-email-loading" className="flex flex-col items-center">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-bold mb-2">Updating your email...</h2>
            <p className="text-[#999] text-sm">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div data-testid="confirm-email-success" className="flex flex-col items-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-bold mb-2">Email Updated!</h2>
            <p className="text-[#999] text-sm mb-6">{message}</p>
            <Link href={ROUTES.LOGIN} passHref legacyBehavior>
              <a
                data-testid="confirm-email-signin-btn"
                className="inline-block bg-[#ff5500] hover:bg-[#ff7700] text-white px-6 py-2.5 rounded text-sm font-bold transition-colors"
                onClick={(e) => { e.preventDefault(); router.push(ROUTES.LOGIN); }}
              >
                Sign In Now
              </a>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div data-testid="confirm-email-error" className="flex flex-col items-center">
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold mb-2">Update Failed</h2>
            <p className="text-[#999] text-sm mb-6">{message}</p>
            <Link href={ROUTES.LOGIN} passHref legacyBehavior>
              <a
                data-testid="confirm-email-back-btn"
                className="inline-block bg-[#333] hover:bg-[#444] text-white px-6 py-2.5 rounded text-sm font-bold transition-colors"
                onClick={(e) => { e.preventDefault(); router.push(ROUTES.LOGIN); }}
              >
                Back to Sign In
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ConfirmEmailUpdatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111111]" />}>
      <ConfirmEmailUpdateContent />
    </Suspense>
  )
}
