import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef } from 'react'
import { searchRepository } from '../api/searchRepository'
import type { SearchResults } from './types'

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const SEARCH_QUERY_KEY = (query: string) => ['search', query] as const

// ─── useSearch ────────────────────────────────────────────────────────────────
/**
 * Fetches search results for a given query string.
 *
 * Behaviour:
 *  - Does NOT fire until query is at least 2 characters (avoids useless requests).
 *  - Results are cached for 2 minutes per unique query string.
 *  - Debounce is handled at the call site (SearchPage reads from URL ?q= param,
 *    which is only updated after the user submits via Enter/click in the NavBar).
 *
 * API: GET /search?q=<query>&type=all&limit=20
 */
export function useSearch(query: string, limit = 20) {
  const trimmed = query.trim()
  const enabled = trimmed.length >= 2

  return useQuery<SearchResults, Error>({
    queryKey: SEARCH_QUERY_KEY(trimmed),
    queryFn: () => searchRepository.search(trimmed, limit),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes — search results are fairly stable
    refetchOnWindowFocus: false,
  })
}

// ─── useSearchDebounced ───────────────────────────────────────────────────────
/**
 * Debounced variant for live-as-you-type search (e.g. autocomplete dropdown).
 * Fires 300ms after the user stops typing. Only use for real-time UI;
 * the Search results page uses useSearch() directly since it reads from the URL.
 */
export function useSearchDebounced(query: string, delayMs = 300) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stableQuery = useMemo(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    return query
  }, [query])

  return useSearch(stableQuery)
}
