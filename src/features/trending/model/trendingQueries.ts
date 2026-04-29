import { useQuery } from '@tanstack/react-query'
import { trendingRepository } from '../api/trendingRepository'
import type { TrendingTrack } from './types'

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const TRENDING_QUERY_KEY = (genre?: string) =>
  ['trending', genre ?? 'all'] as const

// ─── useTrending ──────────────────────────────────────────────────────────────
/**
 * Fetches the trending chart from GET /discovery/trending
 * Optionally pass a genre to filter. Results cached 5 minutes.
 */
export function useTrending(genre?: string, limit = 20) {
  const normalizedGenre = genre === 'all' ? undefined : genre

  return useQuery<TrendingTrack[], Error>({
    queryKey: TRENDING_QUERY_KEY(normalizedGenre),
    queryFn: () => trendingRepository.getTrending(normalizedGenre, limit),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  })
}

// ─── useGenreStation ─────────────────────────────────────────────────────────
/**
 * Fetches a genre-based station from GET /discovery/genre/{genre}
 * Returns tracks sorted by viralScore for the given genre.
 */
export function useGenreStation(genre: string) {
  return useQuery<TrendingTrack[], Error>({
    queryKey: ['genre-station', genre] as const,
    queryFn: () => trendingRepository.getGenreStation(genre),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    enabled: !!genre,
  })
}

// ─── useEditorial ─────────────────────────────────────────────────────────────
/**
 * Fetches editorially curated buckets from GET /discovery/curated
 * Returns an array of stations each containing a list of tracks.
 */
export function useEditorial() {
  return useQuery<any[], Error>({
    queryKey: ['editorial'] as const,
    queryFn: () => trendingRepository.getEditorialBuckets(),
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// ─── useMixedForYou ───────────────────────────────────────────────────────────
/**
 * Fetches personalized stations from GET /discovery/mixed-for-you
 * Returns array of stations (data.stations[])
 */
export function useMixedForYou() {
  return useQuery<any[], Error>({
    queryKey: ['mixed-for-you'] as const,
    queryFn: () => trendingRepository.getMixedForYou(),
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// ─── useMoreOfWhatYouLike ─────────────────────────────────────────────────────
/**
 * Fetches personalized recommendations from GET /discovery/more-like-liked
 * Returns tracks (data.tracks[])
 */
export function useMoreOfWhatYouLike() {
  return useQuery<TrendingTrack[], Error>({
    queryKey: ['more-of-what-you-like'] as const,
    queryFn: () => trendingRepository.getMoreOfWhatYouLike(),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

// ─── useSuggestedArtists ──────────────────────────────────────────────────────
/**
 * Fetches suggested users/artists from GET /network/suggested
 */
export function useSuggestedArtists() {
  return useQuery<any[], Error>({
    queryKey: ['suggested-artists'] as const,
    queryFn: () => trendingRepository.getSuggestedArtists(),
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
