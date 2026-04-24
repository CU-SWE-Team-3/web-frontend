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
    set({ user, isAuthenticated: true })
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
    set({ user: null, isAuthenticated: false })
  },

  // Update profile data without re-logging in
  setUser: (user) => set({ user }),

  // Called on app load — check localStorage for token and validate with backend
  initAuth: async () => {
    if (get().isInitialized) return
    if (typeof window === 'undefined') {
      set({ isInitialized: true })
      return
    }

    const token = localStorage.getItem('accessToken');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'
      const axios = (await import('axios')).default
      const response = await axios.get(`${apiUrl}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        withCredentials: true,
      })
      const user = response.data?.data?.user || response.data?.data || response.data?.user
      if (user) {
        set({ user, isAuthenticated: true, isInitialized: true })
      } else {
        localStorage.removeItem('accessToken')
        set({ isInitialized: true })
      }
    } catch {
      // DEV BYPASS: Allow frontend development without a real backend
      console.warn('Backend unavailable: Using local Dev Mock User')
      set({ 
        user: { 
          id: "dev-mock-user", 
          _id: "dev-mock-user",
          username: "Local Dev", 
          email: "dev@biobeats.local", 
          avatarUrl: null,
          role: "Admin"
        } as any, 
        isAuthenticated: true, 
        isInitialized: true 
      })
    }
  },
}))
