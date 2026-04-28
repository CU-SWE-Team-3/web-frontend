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

// ─── Notifications ──────────────────────────────────────────────────────────
export type NotificationType =
  | 'LIKE'
  | 'REPOST'
  | 'COMMENT'
  | 'FOLLOW'
  | 'MESSAGE'
  | 'NEW_TRACK'
  | 'NEW_PLAYLIST'
  | 'MENTION'
  | 'SYSTEM'

export interface NotificationActor {
  _id: string
  displayName: string
  avatarUrl: string | null
  permalink?: string
  isPremium?: boolean
}

export interface NotificationTarget {
  _id: string
  title: string
  permalink: string
  artworkUrl?: string | null
}

export interface Notification {
  _id: string
  recipient: string
  actors: NotificationActor[]
  actorCount: number
  type: NotificationType
  target: NotificationTarget | null
  targetModel: 'Track' | 'Playlist' | 'User' | 'Comment' | 'Message'
  contentSnippet: string | null
  isRead: boolean
  actionLink: string | null
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferences {
  pushEnabled: boolean
  allowLikes: boolean
  allowReposts: boolean
  allowComments: boolean
  allowFollows: boolean
  allowMessages: boolean
  allowNewTracks: boolean
}

export interface NotificationFeedResponse {
  notifications: Notification[]
  pagination: {
    total: number
    page: number
    totalPages: number
  }
}
