'use client'

import { useEffect } from 'react'
import { useAuthStore } from '../model/useAuthStore'

/**
 * AuthInitializer — runs once on app load to restore the user session
 * from localStorage token. Place this in the root layout.
 */
export const AuthInitializer = () => {
  const initAuth = useAuthStore((s) => s.initAuth)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return null
}
