// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  username: string
  displayName: string
  permalink?: string
  avatarUrl?: string
  coverUrl?: string
  role: 'artist' | 'listener'
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
  isFollowing?: boolean
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
  emailEnabled?: boolean
  allowLikes: boolean
  allowLikesEmail?: boolean
  allowReposts: boolean
  allowRepostsEmail?: boolean
  allowComments: boolean
  allowCommentsEmail?: boolean
  allowFollows: boolean
  allowFollowsEmail?: boolean
  allowMessages: boolean
  allowMessagesEmail?: boolean
  allowNewTracks: boolean
  allowNewTracksEmail?: boolean
}

export interface NotificationFeedResponse {
  notifications: Notification[]
  pagination: {
    total: number
    page: number
    totalPages: number
  }
}
