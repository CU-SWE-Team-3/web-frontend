'use client'

import { create } from 'zustand'
import type { User } from '@/shared/types'

// ─── Auth Store ──────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean

  login: (user: User, token?: string) => void
  logout: () => Promise<void>
  setUser: (user: User) => void
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  // Called after login/register — save user + persist token to localStorage
  login: (user, token?) => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token)
    }
    set({ user, isAuthenticated: true, isInitialized: true })
  },

  // Called on logout — call API to clear cookies, then clear local state + token
  logout: async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const axios = (await import('axios')).default
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true })
    } catch {
      // Even if API call fails, still clear local state
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
    }
    set({ user: null, isAuthenticated: false, isInitialized: true })
  },

  // Update profile data without re-logging in
  setUser: (user) => set({ user }),

  // Called on app load — try to restore session via cookie-based refresh
  initAuth: async () => {
    if (get().isInitialized) return
    if (typeof window === 'undefined') {
      set({ isInitialized: true })
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api'
      const axios = (await import('axios')).default
      const response = await axios.post(`${apiUrl}/auth/refresh`, {}, {
        withCredentials: true,
        timeout: 5000,
      })
      const user = response.data?.data?.user
      const token = response.data?.data?.accessToken || response.data?.accessToken
      if (user) {
        if (token) localStorage.setItem('accessToken', token)
        set({ user, isAuthenticated: true, isInitialized: true })
      } else {
        set({ isInitialized: true })
      }
    } catch {
      set({ user: null, isAuthenticated: false, isInitialized: true })
    }
  },
}))
