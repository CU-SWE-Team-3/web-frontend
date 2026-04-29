import apiClient from '@/shared/api/client'
import type { TrendingTrack, RankDirection } from '../model/types'

// ─── Mapper ───────────────────────────────────────────────────────────────────

function getRankDirection(rankChange?: number, isNew?: boolean): RankDirection {
  if (isNew) return 'new'
  if (!rankChange || rankChange === 0) return 'same'
  return rankChange > 0 ? 'up' : 'down'
}

function mapTrendingTrack(raw: any, index: number): TrendingTrack {
  // The API may return an explicit rank, or we derive it from array position
  const rank = typeof raw.rank === 'number' ? raw.rank : index + 1
  const rankChange = typeof raw.rankChange === 'number' ? raw.rankChange : undefined
  const isNew = raw.isNew === true

  return {
    _id: raw._id || raw.id || '',
    title: raw.title || 'Untitled',
    permalink: raw.permalink || raw._id || '',
    artworkUrl: raw.artworkUrl || undefined,
    hlsUrl: raw.hlsUrl || undefined,
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
   * GET /tracks/trending
   * Returns up to 50 tracks ranked by recent play count acceleration.
   * Optionally filtered by genre via ?genre=<genre>.
   *
   * Response shape: { data: TrendingTrack[] } or TrendingTrack[]
   */
  async getTrending(genre?: string, limit = 50): Promise<TrendingTrack[]> {
    try {
      const params: Record<string, string | number> = { limit }
      // The v1.10 API expects genre in the query for filtering
      if (genre && genre !== 'all') params.genre = genre

      const { data } = await apiClient.get('/discovery/trending', {
        params,
      })

      // Shape: { status: "success", data: { trending: [...] } }
      const raw: any[] = data?.data?.trending ?? (Array.isArray(data?.data) ? data.data : []);

      if (!Array.isArray(raw)) return []

      return raw.map((item, i) => mapTrendingTrack(item, i))
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/trending failed:', err)
      return []
    }
  },

  /**
   * GET /discovery/curated
   * Returns curated "buckets" for the home page (e.g. "Trending Folk", "Fresh Finds").
   */
  async getEditorialBuckets(): Promise<any[]> {
    try {
      const { data } = await apiClient.get('/discovery/curated')
      // Try to find the array of buckets in various possible locations in the response
      const rawData = data?.data;
      if (Array.isArray(rawData)) return rawData;
      if (Array.isArray(rawData?.curated)) return rawData.curated;
      if (Array.isArray(rawData?.editorial)) return rawData.editorial;
      if (Array.isArray(rawData?.buckets)) return rawData.buckets;
      
      console.warn('[trendingRepository] Could not parse curated buckets array from response:', data);
      return [];
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/curated failed:', err)
      return []
    }
  },
  
  /**
   * GET /discovery/mixed-for-you
   * Returns personalized "Mix" stations for the authenticated user.
   */
  async getMixedForYou(): Promise<any[]> {
    try {
      const { data } = await apiClient.get('/discovery/mixed-for-you')
      return data?.data?.stations ?? data?.data ?? []
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/mixed-for-you failed:', err)
      return []
    }
  },

  /**
   * GET /discovery/more-of-what-you-like
   * Returns track recommendations based on user's recent likes.
   */
  async getMoreOfWhatYouLike(): Promise<TrendingTrack[]> {
    try {
      const { data } = await apiClient.get('/discovery/more-of-what-you-like')
      const raw = data?.data?.tracks ?? []
      return raw.map((item: any, i: number) => mapTrendingTrack(item, i))
    } catch (err) {
      console.warn('[trendingRepository] GET /discovery/more-of-what-you-like failed:', err)
      return []
    }
  },

  /**
   * GET /discovery/suggested-artists
   * Returns personalized user/artist suggestions.
   */
  async getSuggestedArtists(): Promise<any[]> {
    try {
      const { data } = await apiClient.get('/network/suggested')
      return data?.data ?? []
    } catch (err) {
      console.warn('[trendingRepository] GET /network/suggested failed:', err)
      return []
    }
  },
}
