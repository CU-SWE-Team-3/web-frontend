// ─── Search Feature — Public API ─────────────────────────────────────────────
export { useSearch, useSearchDebounced, SEARCH_QUERY_KEY } from './model/searchQueries'
export type { TrackResult, UserResult, PlaylistResult, SearchResults } from './model/types'
export { searchRepository } from './api/searchRepository'
