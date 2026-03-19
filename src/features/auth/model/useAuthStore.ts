'use client'

import { create } from 'zustand'
import type { User } from '@/shared/types'

// ─── Auth Store ──────────────────────────────────────────────────────────────
// Auth is cookie-based (HttpOnly). The backend sets accessToken and refreshToken
// cookies automatically on login/refresh. We only store the User object here.

interface AuthState {
  user: User | null
  isAuthenticated: boolean

  login: (user: User) => void
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  // Called after login/register/google-callback — just save the user object.
  // No token in localStorage because auth is handled by HttpOnly cookies.
  login: (user) => {
    set({ user, isAuthenticated: true })
  },

  // Called on logout — call API to clear cookies, then clear local state
  logout: async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const axios = (await import('axios')).default
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true })
    } catch {
      // Even if API call fails, still clear local state
    }
    set({ user: null, isAuthenticated: false })
  },

  // Update profile data without re-logging in
  setUser: (user) => set({ user }),
}))
