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
      if (genre && genre !== 'all') params.genre = genre

      const { data } = await apiClient.get('/tracks/trending', {
        params,
        withCredentials: true,
      })

      const raw: any[] =
        data?.data ?? data?.tracks ?? (Array.isArray(data) ? data : [])

      if (!Array.isArray(raw)) return []

      return raw.map((item, i) => mapTrendingTrack(item, i))
    } catch (err) {
      console.warn('[trendingRepository] GET /tracks/trending failed:', err)
      return []
    }
  },
}
