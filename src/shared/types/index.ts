// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  email: string;
  displayName: string;
  permalink: string;
  avatarUrl?: string;
  coverUrl?: string;
  role: 'Artist' | 'Listener' | 'Admin';
  isEmailVerified: boolean;
  isPremium: boolean;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

// ─── API Wrapper ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  status: 'success' | 'fail' | 'error';
  message?: string;
  results?: number;
  data: T;
}

// ─── Auth Payloads ───────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  captchaToken: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

// ─── Auth Response ───────────────────────────────────────────────────────────
export interface AuthResponse {
  user: User;
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
