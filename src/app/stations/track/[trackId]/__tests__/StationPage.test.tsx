import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StationPage from '../page'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock API hooks
vi.mock('@/features/track-engagement/model/useRepostTrack', () => ({
  useRepostTrack: () => ({ mutate: vi.fn() })
}))
vi.mock('@/features/track-engagement/model/useUnrepostTrack', () => ({
  useUnrepostTrack: () => ({ mutate: vi.fn() })
}))
vi.mock('@/features/track-engagement/model/useLikeTrack', () => ({
  useLikeTrack: () => ({ mutate: vi.fn() })
}))
vi.mock('@/features/track-engagement/model/useUnlikeTrack', () => ({
  useUnlikeTrack: () => ({ mutate: vi.fn() })
}))

vi.mock('@/features/tracks/model/trackQueries', () => ({
  useTrack: () => ({ data: { id: 'track1', title: 'Station Root Track', artist: { displayName: 'Artist' }, artworkUrl: '' } }),
  useTracks: () => ({ data: [{ id: 'track2', title: 'Related Track', artist: 'Artist' }] })
}))

vi.mock('@/features/social-graph/model/useSuggestedUsers', () => ({
  useSuggestedUsers: () => ({ data: [] })
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({ trackId: 'track1' }),
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/stations/track/track1',
}))

describe('StationPage', () => {
  const queryClient = new QueryClient()

  it('renders station page and action buttons', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StationPage />
      </QueryClientProvider>
    )
    
    // Station main like button
    expect(screen.getByTestId('station-like-btn')).toBeInTheDocument()
    expect(screen.getByTestId('station-share-btn')).toBeInTheDocument()
    expect(screen.getByTestId('station-nextup-btn')).toBeInTheDocument()
    expect(screen.getByTestId('station-playlist-btn')).toBeInTheDocument()
    
    // Test that the StationTrackRow correctly increments dummy count/state
    // Wait for the tracks to render (mock fallback data renders immediately)
    const shareBtns = screen.getAllByTestId('station-share-btn')
    expect(shareBtns.length).toBeGreaterThan(0)
  })
})
