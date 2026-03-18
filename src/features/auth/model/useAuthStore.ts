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
  logout: () => void
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

  // Called on logout — clear local state (backend clears the cookie)
  logout: () => {
    set({ user: null, isAuthenticated: false })
  },

  // Update profile data without re-logging in
  setUser: (user) => set({ user }),
}))
