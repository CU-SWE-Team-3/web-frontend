import apiClient from '@/shared/api/client'
import type { SearchResults, TrackResult, UserResult, PlaylistResult } from '../model/types'

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapTrackResult(raw: any): TrackResult {
  return {
    _id: raw._id || raw.id || '',
    title: raw.title || 'Untitled',
    permalink: raw.permalink || raw._id || '',
    artworkUrl: raw.artworkUrl || undefined,
    hlsUrl: raw.hlsUrl || undefined,
    duration: typeof raw.duration === 'number' ? raw.duration : undefined,
    genre: raw.genre || '',
    playCount: raw.playCount ?? 0,
    likeCount: raw.likeCount ?? 0,
    artist: {
      _id: raw.artist?._id || raw.artist?.id || '',
      displayName: raw.artist?.displayName || raw.artist?.username || 'Unknown Artist',
      permalink: raw.artist?.permalink || raw.artist?.username || '',
      avatarUrl: raw.artist?.avatarUrl || undefined,
    },
  }
}

function mapUserResult(raw: any): UserResult {
  return {
    _id: raw._id || raw.id || '',
    displayName: raw.displayName || raw.username || 'Unknown',
    permalink: raw.permalink || raw.username || '',
    avatarUrl: raw.avatarUrl || undefined,
    followerCount: raw.followerCount ?? 0,
    followingCount: raw.followingCount ?? 0,
  }
}

function mapPlaylistResult(raw: any): PlaylistResult {
  return {
    _id: raw._id || raw.id || '',
    title: raw.title || 'Untitled Playlist',
    permalink: raw.permalink || undefined,
    artworkUrl: raw.artworkUrl || undefined,
    trackCount: raw.trackCount ?? raw.tracks?.length ?? 0,
    owner: {
      _id: raw.owner?._id || raw.user?._id || '',
      displayName: raw.owner?.displayName || raw.user?.displayName || 'Unknown',
      permalink: raw.owner?.permalink || raw.user?.permalink || '',
    },
  }
}

// ─── Repository ───────────────────────────────────────────────────────────────
// UI components never call apiClient directly.
// They call these repository functions, which return typed domain objects.

export const searchRepository = {
  /**
   * GET /search?q=<query>&type=all&limit=20
   *
   * Searches across Tracks, Users, and Playlists simultaneously.
   * Returns a combined SearchResults object with three typed arrays.
   *
   * The API may return:
   *   - A combined object: { tracks: [...], users: [...], playlists: [...] }
   *   - Or a flat array of mixed items with a `type` discriminator field
   *
   * Both shapes are handled defensively below.
   */
  async search(query: string, limit = 20): Promise<SearchResults> {
    const empty: SearchResults = { tracks: [], users: [], playlists: [] }

    if (!query || query.trim().length < 2) return empty

    try {
      const { data } = await apiClient.get('/search', {
        params: { q: query.trim(), type: 'all', limit },
        withCredentials: true,
      })

      const payload = data?.data ?? data

      // Shape A: combined object with separate arrays per type
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        return {
          tracks: Array.isArray(payload.tracks) ? payload.tracks.map(mapTrackResult) : [],
          users: Array.isArray(payload.users) ? payload.users.map(mapUserResult) : [],
          playlists: Array.isArray(payload.playlists) ? payload.playlists.map(mapPlaylistResult) : [],
        }
      }

      // Shape B: flat array with discriminator field `type`
      if (Array.isArray(payload)) {
        const tracks: TrackResult[] = []
        const users: UserResult[] = []
        const playlists: PlaylistResult[] = []

        for (const item of payload) {
          if (item.type === 'track' || item.hlsUrl || item.duration !== undefined) {
            tracks.push(mapTrackResult(item))
          } else if (item.type === 'user' || item.followerCount !== undefined) {
            users.push(mapUserResult(item))
          } else if (item.type === 'playlist' || item.trackCount !== undefined) {
            playlists.push(mapPlaylistResult(item))
          }
        }
        return { tracks, users, playlists }
      }

      return empty
    } catch (err) {
      console.warn('[searchRepository] GET /search failed:', err)
      return empty
    }
  },
}
