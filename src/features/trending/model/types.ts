// ─── Trending Feature Types ───────────────────────────────────────────────────
// Mirror the shape returned by GET /tracks/trending
// Keep in sync with the backend TrendingTrack schema.

export type RankDirection = 'up' | 'down' | 'same' | 'new'

export interface TrendingTrack {
  _id: string
  title: string
  permalink: string
  artworkUrl?: string
  hlsUrl?: string
  waveform?: number[]
  duration?: number
  genre?: string
  playCount: number
  likeCount: number
  repostCount: number
  commentCount: number
  createdAt: string
  artist: {
    _id: string
    displayName: string
    permalink: string
    avatarUrl?: string
  }
  // Chart-specific fields
  rank: number            // Current chart position (1 = #1)
  rankChange?: number     // Positive = moved up, negative = moved down, 0 = same
  rankDirection: RankDirection
  isNew?: boolean         // True if first appearance in chart
}
