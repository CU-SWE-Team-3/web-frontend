import apiClient from '@/shared/api/client'
import type { SearchResults, TrackResult, UserResult, PlaylistResult } from '../model/types'

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapTrackResult(raw: any): TrackResult {
  return {
    _id: raw._id || raw.id || '',
    title: raw.title || 'Untitled',
    permalink: raw.permalink || raw._id || '',
    artworkUrl: raw.artworkUrl || undefined,
    hlsUrl: raw.hlsUrl || raw.streamUrl || undefined,
    duration: typeof raw.duration === 'number' ? raw.duration : undefined,
    genre: raw.genre || '',
    playCount: raw.playCount ?? 0,
    likeCount: raw.likeCount ?? 0,
    repostCount: raw.repostCount ?? undefined,
    commentCount: raw.commentCount ?? undefined,
    waveform: Array.isArray(raw.waveform) ? raw.waveform : undefined,
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
      // BioBeats v1.10 uses /tracks/search for global full-text search
      const { data } = await apiClient.get('/tracks/search', {
        params: { q: query.trim(), limit },
      })

      // The BioBeats API returns { success: true, results: N, data: { tracks, users, playlists } }
      const payload = data?.data;

      if (payload && typeof payload === 'object') {
        return {
          tracks: Array.isArray(payload.tracks) ? payload.tracks.map(mapTrackResult) : [],
          users: Array.isArray(payload.users) ? payload.users.map(mapUserResult) : [],
          playlists: Array.isArray(payload.playlists) ? payload.playlists.map(mapPlaylistResult) : [],
        }
      }

      return empty
    } catch (err) {
      console.warn('[searchRepository] GET /tracks/search failed:', err)
      return empty
    }
  },
}
