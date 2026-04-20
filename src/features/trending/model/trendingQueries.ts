import { useQuery } from '@tanstack/react-query'
import { trendingRepository } from '../api/trendingRepository'
import type { TrendingTrack } from './types'

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const TRENDING_QUERY_KEY = (genre?: string) =>
  ['trending', genre ?? 'all'] as const

// ─── useTrending ──────────────────────────────────────────────────────────────
/**
 * Fetches the trending chart — tracks ranked by recent play count acceleration.
 *
 * Behaviour:
 *  - PUBLIC endpoint — no auth gate, anyone can see trending charts.
 *  - Cached for 5 minutes (charts don't change second-by-second).
 *  - Always refetches on first mount so the chart is fresh on page load.
 *  - Pass a genre string to filter (e.g. 'Hip-Hop', 'Electronic').
 *    Omit or pass 'all' for the global chart.
 *
 * API: GET /tracks/trending?genre=<genre>&limit=50
 */
export function useTrending(genre?: string, limit = 50) {
  const normalizedGenre = genre === 'all' ? undefined : genre

  return useQuery<TrendingTrack[], Error>({
    queryKey: TRENDING_QUERY_KEY(normalizedGenre),
    queryFn: () => trendingRepository.getTrending(normalizedGenre, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })
}
