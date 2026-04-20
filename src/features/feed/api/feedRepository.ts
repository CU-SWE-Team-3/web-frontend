import apiClient from '@/shared/api/client'
import type { FeedTrack, SuggestedArtist } from '../model/types'

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapFeedArtist(a: any) {
  return {
    _id: a?._id || a?.id || '',
    displayName: a?.displayName || a?.username || 'Unknown Artist',
    permalink: a?.permalink || a?.username || '',
    avatarUrl: a?.avatarUrl || undefined,
  }
}

function mapFeedTrack(raw: any): FeedTrack {
  // The API may return the track nested as raw.track or at the top level
  const t = raw.track ?? raw

  return {
    _id: t._id || t.id || '',
    title: t.title || 'Untitled',
    permalink: t.permalink || t._id || '',
    artworkUrl: t.artworkUrl || undefined,
    hlsUrl: t.hlsUrl || undefined,
    waveform: Array.isArray(t.waveform) ? t.waveform : undefined,
    duration: typeof t.duration === 'number' ? t.duration : undefined,
    genre: t.genre || '',
    playCount: t.playCount ?? 0,
    likeCount: t.likeCount ?? 0,
    repostCount: t.repostCount ?? 0,
    commentCount: t.commentCount ?? 0,
    createdAt: t.createdAt || raw.createdAt || '',
    artist: mapFeedArtist(t.artist),
  }
}

function mapSuggestedArtist(raw: any): SuggestedArtist {
  return {
    _id: raw._id || raw.id || '',
    displayName: raw.displayName || raw.username || 'Unknown',
    permalink: raw.permalink || raw.username || '',
    avatarUrl: raw.avatarUrl || undefined,
    followerCount: raw.followerCount ?? 0,
    followingCount: raw.followingCount ?? 0,
  }
}

// ─── Repository ───────────────────────────────────────────────────────────────
// UI components never call apiClient directly.
// They call these repository functions, which return typed domain objects.

export const feedRepository = {
  /**
   * GET /network/feed
   * Returns up to 20 public finished tracks from followed artists,
   * sorted newest-first.
   */
  async getFeed(): Promise<FeedTrack[]> {
    try {
      const { data } = await apiClient.get('/network/feed', {
        withCredentials: true,
      })

      const raw: any[] =
        data?.data ?? data?.tracks ?? (Array.isArray(data) ? data : [])

      if (!Array.isArray(raw)) return []

      return raw.map(mapFeedTrack)
    } catch (err) {
      console.warn('[feedRepository] GET /network/feed failed:', err)
      return []
    }
  },

  /**
   * GET /network/suggested
   * Returns mutual-follow suggestions first, then popular users.
   */
  async getSuggestedArtists(
    page = 1,
    limit = 10,
  ): Promise<SuggestedArtist[]> {
    try {
      const { data } = await apiClient.get('/network/suggested', {
        params: { page, limit },
        withCredentials: true,
      })

      const raw: any[] =
        data?.data ?? data?.users ?? (Array.isArray(data) ? data : [])

      if (!Array.isArray(raw)) return []

      return raw.map(mapSuggestedArtist)
    } catch (err) {
      console.warn('[feedRepository] GET /network/suggested failed:', err)
      return []
    }
  },
}
