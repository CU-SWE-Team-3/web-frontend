'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { ROUTES } from '@/shared/constants/routes'

function AdminLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#111',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: '3px solid #222',
        borderTopColor: '#ff5500',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAdmin = user?.role?.toLowerCase?.() === 'admin'

  useEffect(() => {
    if (!isInitialized) return

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN)
      return
    }

    if (!isAdmin) {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [isInitialized, isAuthenticated, isAdmin, router])

  if (!isInitialized) return <AdminLoading />
  if (!isAuthenticated || !isAdmin) return null

  return <>{children}</>
}
