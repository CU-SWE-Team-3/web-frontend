import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { feedRepository } from '../api/feedRepository'
import type { FeedTrack, SuggestedArtist } from './types'

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const FEED_QUERY_KEY = ['feed'] as const
export const SUGGESTED_ARTISTS_QUERY_KEY = ['network', 'suggested'] as const

// ─── useFeed ──────────────────────────────────────────────────────────────────
/**
 * Fetches the activity feed (tracks from followed artists).
 * Auth-gated: waits for useAuthStore.isInitialized before firing.
 * Always refetches fresh data on mount — feed is real-time.
 *
 * API: GET /network/feed
 */
export function useFeed() {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery<FeedTrack[], Error>({
    queryKey: FEED_QUERY_KEY,
    queryFn: () => feedRepository.getFeed(),
    enabled: isInitialized,
    staleTime: 0,
    refetchOnMount: 'always' as const,
  })
}

// ─── useSuggestedArtists ──────────────────────────────────────────────────────
/**
 * Fetches suggested artists to follow.
 * Auth-gated, cached for 2 minutes (suggestions change slowly).
 *
 * API: GET /network/suggested
 */
export function useSuggestedArtists(limit = 5) {
  const isInitialized = useAuthStore((s) => s.isInitialized)

  return useQuery<SuggestedArtist[], Error>({
    queryKey: [...SUGGESTED_ARTISTS_QUERY_KEY, { limit }],
    queryFn: () => feedRepository.getSuggestedArtists(1, limit),
    enabled: isInitialized,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: 'always' as const,
  })
}
