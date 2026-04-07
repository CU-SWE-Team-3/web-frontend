/** Shape returned by the backend for GET /tracks/{trackId}/comments */
export interface BackendCommentUser {
  _id: string;
  displayName: string;
  permalink: string;
  avatarUrl: string;
  role?: string;
  isEmailVerified?: boolean;
  isPremium?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export interface TrackComment {
  _id: string;
  content: string;
  timestamp: number; // seconds in the audio
  user: BackendCommentUser;
  parentComment?: string;
  replies?: TrackComment[];
  createdAt: string;

  // --- Convenience aliases used by UI components ---
  // These are computed at the mapping layer so the UI doesn't need to dig into `user.*`
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  text: string;
  timestampSeconds: number;
}

/**
 * Normalise a raw backend comment object into the shape our UI components expect.
 * Call this once when the data arrives from the API.
 */
export function normaliseComment(raw: any): TrackComment {
  return {
    _id: raw._id,
    content: raw.content,
    timestamp: raw.timestamp,
    user: raw.user,
    parentComment: raw.parentComment,
    replies: raw.replies?.map(normaliseComment),
    createdAt: raw.createdAt,

    // Convenience aliases
    id: raw._id,
    userId: raw.user?._id ?? '',
    username: raw.user?.permalink ?? '',
    displayName: raw.user?.displayName ?? '',
    avatarUrl: raw.user?.avatarUrl ?? null,
    text: raw.content,
    timestampSeconds: raw.timestamp,
  };
}
