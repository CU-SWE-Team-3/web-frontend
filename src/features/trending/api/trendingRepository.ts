import apiClient from '@/shared/api/client'
import type { TrendingTrack, RankDirection } from '../model/types'

// ─── Mapper ───────────────────────────────────────────────────────────────────

function getRankDirection(rankChange?: number, isNew?: boolean): RankDirection {
  if (isNew) return 'new'
  if (!rankChange || rankChange === 0) return 'same'
  return rankChange > 0 ? 'up' : 'down'
}

function mapTrendingTrack(raw: any, index: number): TrendingTrack {
  const rank = typeof raw.rank === 'number' ? raw.rank : index + 1
  const rankChange = typeof raw.rankChange === 'number' ? raw.rankChange : undefined
  const isNew = raw.isNew === true

  return {
    _id: raw._id || raw.id || '',
    title: raw.title || 'Untitled',
    permalink: raw.permalink || raw._id || '',
    artworkUrl: raw.artworkUrl || undefined,
    // TrendingTrack from API does NOT include hlsUrl — it must be fetched via /player/{id}/stream
    hlsUrl: raw.hlsUrl || raw.streamUrl || undefined,
    waveform: Array.isArray(raw.waveform) ? raw.waveform : undefined,
    duration: typeof raw.duration === 'number' ? raw.duration : undefined,
    genre: raw.genre || '',
    playCount: raw.playCount ?? 0,
    likeCount: raw.likeCount ?? 0,
    repostCount: raw.repostCount ?? 0,
    commentCount: raw.commentCount ?? 0,
    createdAt: raw.createdAt || '',
    artist: {
      _id: raw.artist?._id || raw.artist?.id || '',
      displayName: raw.artist?.displayName || raw.artist?.username || 'Unknown Artist',
      permalink: raw.artist?.permalink || raw.artist?.username || '',
      avatarUrl: raw.artist?.avatarUrl || undefined,
    },
    rank,
    rankChange,
    rankDirection: getRankDirection(rankChange, isNew),
    isNew,
  }
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const trendingRepository = {
  /**
   * GET /discovery/trending?genre=<genre>&limit=<limit>
   * Returns tracks sorted by viralScore descending.
   * YAML response shape: { success, results, data: { trending: TrendingTrack[] } }
   */
  async getTrending(genre?: string, limit = 20): Promise<TrendingTrack[]> {
    try {
      const params: Record<string, string | number> = { limit }
      if (genre && genre !== 'all') params.genre = genre

      const { data } = await apiClient.get('/discovery/trending', { params })

      // YAML: data.data.trending
      const raw: any[] = data?.data?.trending ?? []
      if (!Array.isArray(raw)) return []
      return raw.map((item, i) => mapTrendingTrack(item, i))
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/trending failed:', err)
      return []
    }
  },

  /**
   * GET /discovery/genre/{genre}
   * Genre-based station: tracks matching a specific genre sorted by viralScore.
   * YAML response shape: { status, results, data: { tracks: TrendingTrack[] } }
   */
  async getGenreStation(genre: string): Promise<TrendingTrack[]> {
    try {
      const encodedGenre = encodeURIComponent(genre)
      const { data } = await apiClient.get(`/discovery/genre/${encodedGenre}`)

      // YAML: data.data.tracks
      const raw: any[] = data?.data?.tracks ?? []
      if (!Array.isArray(raw)) return []
      return raw.map((item, i) => mapTrendingTrack(item, i))
    } catch (err) {
      console.warn(`[trendingRepository] GET /discovery/genre/${genre} failed:`, err)
      return []
    }
  },

  /**
   * GET /discovery/curated
   * Returns themed editorial track collections.
   * YAML response shape: { status, results, data: { curated: DiscoveryStation[] } }
   */
  async getEditorialBuckets(): Promise<any[]> {
    try {
      const { data } = await apiClient.get('/discovery/curated')

      // YAML: data.data.curated
      const curated = data?.data?.curated
      if (Array.isArray(curated)) return curated

      // Fallbacks
      const rawData = data?.data
      if (Array.isArray(rawData)) return rawData
      if (Array.isArray(rawData?.editorial)) return rawData.editorial
      if (Array.isArray(rawData?.buckets)) return rawData.buckets

      return []
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/curated failed:', err)
      return []
    }
  },

  /**
   * GET /discovery/mixed-for-you
   * Returns personalized stations built from user's taste.
   * YAML response shape: { status, results, data: { stations: DiscoveryStation[] } }
   */
  async getMixedForYou(): Promise<any[]> {
    try {
      const { data } = await apiClient.get('/discovery/mixed-for-you')

      // YAML: data.data.stations
      const stations = data?.data?.stations
      if (Array.isArray(stations)) return stations

      // Fallbacks
      if (Array.isArray(data?.data)) return data.data
      return []
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/mixed-for-you failed:', err)
      return []
    }
  },

  /**
   * GET /discovery/more-like-liked
   * Returns track recommendations based on user's recent likes.
   * YAML response shape: { status, results, data: { tracks: TrendingTrack[], basedOn, genres } }
   */
  async getMoreOfWhatYouLike(): Promise<TrendingTrack[]> {
    try {
      const { data } = await apiClient.get('/discovery/more-like-liked')

      // YAML: data.data.tracks
      const raw = data?.data?.tracks
      if (Array.isArray(raw)) return raw.map((item: any, i: number) => mapTrendingTrack(item, i))

      // Fallback: maybe data.data is the array directly
      if (Array.isArray(data?.data)) return (data.data as any[]).map((item, i) => mapTrendingTrack(item, i))
      return []
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/more-like-liked failed:', err)
      return []
    }
  },

  /**
   * GET /network/suggested
   * Returns personalized user/artist suggestions.
   * YAML response shape: { status, results, data: { users: User[] } } or { data: User[] }
   */
  async getSuggestedArtists(): Promise<any[]> {
    try {
      const { data } = await apiClient.get('/network/suggested')

      // Try data.data.users first, then data.data, then data
      const users = data?.data?.users ?? data?.data ?? data
      if (Array.isArray(users)) return users
      return []
    } catch (err) {
      console.warn('[trendingRepository] GET /network/suggested failed:', err)
      return []
    }
  },

  /**
   * GET /player/{id}/stream
   * Returns the HLS streaming URL for a track.
   * YAML response shape: { status, data: { streamUrl, duration, format, ... } }
   * This is the ONLY way to get a playable stream URL for feed/search tracks.
   */
  async getStreamUrl(trackId: string): Promise<string | null> {
    try {
      const { data } = await apiClient.get(`/player/${trackId}/stream`)
      return data?.data?.streamUrl ?? data?.data?.hlsUrl ?? null
    } catch (err) {
      console.warn(`[trendingRepository] GET /player/${trackId}/stream failed:`, err)
      return null
    }
  },
}
