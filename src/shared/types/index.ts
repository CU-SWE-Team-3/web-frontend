// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  username: string
  displayName: string
  permalink?: string
  avatarUrl?: string
  coverUrl?: string
  role: 'artist' | 'listener' | 'admin' | 'Artist' | 'Listener' | 'Admin'
  isVerified: boolean
  createdAt: string
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

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface ReportData {
  _id: string
  reporter: string | { _id: string; displayName: string; permalink: string; avatarUrl?: string }
  targetType: 'Track' | 'Comment' | 'User'
  targetId: string
  reason: 'Copyright' | 'Inappropriate Content' | 'Spam' | 'Other'
  status: 'Pending' | 'Reviewed' | 'Resolved'
  createdAt: string
}

export interface DashboardStats {
  totalUsers: number
  roleBreakdown: { artists: number; listeners: number }
  artistToListenerRatio: string
  totalTracks: number
  totalPlays: number
  completedPlays: number
  playThroughRate: string
  totalStorageUsed: string
}

export interface UserModerationResponse {
  success: boolean
  message: string
  data: { userId: string; status: string }
}

export interface TrackModerationResponse {
  success: boolean
  message: string
  data: { trackId: string; isPublic: boolean; moderationStatus: string }
}
