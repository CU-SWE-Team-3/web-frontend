'use client'

import { create } from 'zustand'
import type { User } from '@/shared/types'

// ─── Auth Store Shape ─────────────────────────────────────────────────────────
// This is the "memory" of whether the user is logged in.
// Any component in the app can read or change this.

interface AuthState {
  user: User | null          // The logged-in user's data (or null if not logged in)
  accessToken: string | null // The JWT token used to authenticate API calls
  isAuthenticated: boolean   // Simple boolean: true = logged in, false = not

  // Actions — functions that change the state
  login: (user: User, accessToken: string) => void
  logout: () => void
  setUser: (user: User) => void
}

// ─── Zustand Store ────────────────────────────────────────────────────────────
// create() from Zustand creates a global store.
// Think of it like a global variable that React components can "watch".

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state — user starts as not logged in
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Called after a successful login
  login: (user, accessToken) => {
    // Save token to localStorage so it persists across page refreshes
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken)
    }
    set({ user, accessToken, isAuthenticated: true })
  },

  // Called when user clicks "Log out"
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
    }
    set({ user: null, accessToken: null, isAuthenticated: false })
  },

  // Called to update user profile data without re-logging in
  setUser: (user) => set({ user }),
}))
