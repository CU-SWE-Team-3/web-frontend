// ─── Search Feature Types ─────────────────────────────────────────────────────
// Mirrors the shapes returned by GET /search?q=&type=all
// Keep in sync with the backend SearchResponse schema.

export interface TrackResult {
  _id: string
  title: string
  permalink: string
  artworkUrl?: string
  hlsUrl?: string
  duration?: number
  genre?: string
  playCount: number
  likeCount: number
  repostCount?: number
  commentCount?: number
  waveform?: number[]
  durationSeconds?: number
  artist: {
    _id: string
    displayName: string
    permalink: string
    avatarUrl?: string
  }
}

export interface UserResult {
  _id: string
  displayName: string
  permalink: string
  avatarUrl?: string
  followerCount?: number
  followingCount?: number
}

export interface PlaylistResult {
  _id: string
  title: string
  permalink?: string
  artworkUrl?: string
  trackCount?: number
  owner: {
    _id: string
    displayName: string
    permalink: string
  }
}

// Container returned by the repository after mapping
export interface SearchResults {
  tracks: TrackResult[]
  users: UserResult[]
  playlists: PlaylistResult[]
}
