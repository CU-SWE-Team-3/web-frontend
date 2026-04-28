// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  _id?: string // Alias for API consistency
  email: string
  username: string
  displayName: string
  permalink?: string
  bio?: string
  country?: string
  city?: string
  genres?: string[]
  avatarUrl?: string
  coverUrl?: string
  role: 'Artist' | 'Listener' | 'Admin'
  isPremium?: boolean
  subscriptionPlan?: 'Free' | 'Pro' | 'Go+'
  subscriptionExpiresAt?: string | null
  cancelAtPeriodEnd?: boolean
  isEmailVerified?: boolean
  accountStatus?: 'Active' | 'Suspended' | 'Deleted'
  followerCount?: number
  followingCount?: number
  socialLinks?: Array<{ _id: string; platform: string; url: string }>
  notificationPreferences?: Record<string, boolean>
  createdAt: string
  updatedAt?: string
}

// ─── API Wrapper ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// ─── Auth Payloads ───────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  confirmPassword: string
  captchaToken: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmPassword: string
}

// ─── Auth Response ───────────────────────────────────────────────────────────
export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}
