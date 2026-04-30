// ─── Feed Types ───────────────────────────────────────────────────────────────
// These types mirror the OpenAPI schema `FeedTrack` defined in the BioBeats spec.
// Keep in sync with: GET /network/feed

export interface FeedArtist {
  _id: string
  displayName: string
  permalink: string
  avatarUrl?: string
}

export interface FeedTrack {
  _id: string
  title: string
  permalink: string
  artworkUrl?: string
  hlsUrl?: string
  streamUrl?: string
  waveform?: number[]
  duration?: number
  genre?: string
  playCount: number
  likeCount: number
  repostCount: number
  commentCount: number
  createdAt: string
  artist: FeedArtist
}

export interface FeedActivity {
  activityType: 'TRACK_UPLOAD' | 'LIKE' | 'REPOST' | 'PROMOTED'
  activityDate: string
  actors: FeedArtist[]
  target: FeedTrack
  targetModel: 'Track' | 'Playlist'
}

// ─── Suggested Artist ─────────────────────────────────────────────────────────
// Shape returned by GET /network/suggested
export interface SuggestedArtist {
  _id: string
  displayName: string
  permalink: string
  avatarUrl?: string
  followerCount?: number
  followingCount?: number
  trackCount?: number
}
