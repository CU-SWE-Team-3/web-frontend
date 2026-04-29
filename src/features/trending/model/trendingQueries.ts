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

// ─── useEditorial ─────────────────────────────────────────────────────────────
/**
 * Fetches editorially curated buckets for the home page.
 * Returns an array of buckets, each containing a list of tracks.
 */
export function useEditorial() {
  return useQuery<any[], Error>({
    queryKey: ['editorial'] as const,
    queryFn: () => trendingRepository.getEditorialBuckets(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  })
}

// ─── useMixedForYou ───────────────────────────────────────────────────────────
export function useMixedForYou() {
  return useQuery<any[], Error>({
    queryKey: ['mixed-for-you'] as const,
    queryFn: () => trendingRepository.getMixedForYou(),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// ─── useMoreOfWhatYouLike ─────────────────────────────────────────────────────
export function useMoreOfWhatYouLike() {
  return useQuery<TrendingTrack[], Error>({
    queryKey: ['more-of-what-you-like'] as const,
    queryFn: () => trendingRepository.getMoreOfWhatYouLike(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// ─── useSuggestedArtists ──────────────────────────────────────────────────────
export function useSuggestedArtists() {
  return useQuery<any[], Error>({
    queryKey: ['suggested-artists'] as const,
    queryFn: () => trendingRepository.getSuggestedArtists(),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
