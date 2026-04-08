import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProfileTrackCard } from '../ProfileTrackCard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

vi.mock('@/features/tracks/ui/WaveformPlayer', () => ({
  default: () => <div data-testid="mock-waveform-player" />
}))

// Mock API hooks so the test doesn't try to call real backend
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
vi.mock('@/features/comments/api/useTrackComments', () => ({
  useTrackComments: () => ({ data: [] })
}))

const mockTrack = {
  id: 'track1',
  title: 'My Cool Track',
  userId: 'user1',
  audioUrl: 'http://example.com/audio.mp3',
  duration: 180,
  visibility: 'Public',
  plays: 1500,
  likes: 300,
  reposts: 50,
  comments: 10,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  waveform: []
}

describe('ProfileTrackCard', () => {
  const queryClient = new QueryClient()

  it('renders track card with full test IDs', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileTrackCard 
          track={mockTrack as any} 
          userFullName="Test User" 
          username="testuser" 
        />
      </QueryClientProvider>
    )
    
    expect(screen.getByTestId('track-card')).toBeInTheDocument()
    expect(screen.getByTestId('track-card-title')).toHaveTextContent('My Cool Track')
    expect(screen.getByTestId('track-card-waveform')).toBeInTheDocument()
    expect(screen.getByTestId('track-card-like-button')).toBeInTheDocument()
    expect(screen.getByTestId('track-card-repost-button')).toBeInTheDocument()
    expect(screen.getByTestId('track-card-share-button')).toBeInTheDocument()
    // It is not the owner, so "More" button should appear instead of "Edit"
    expect(screen.getByTestId('track-card-more-button')).toBeInTheDocument()
  })

  it('toggles repost count immediately on user click', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileTrackCard 
          track={mockTrack as any} 
          userFullName="Test User" 
          username="testuser" 
          repostCount={50}
        />
      </QueryClientProvider>
    )

    const repostBtn = screen.getByTestId('track-card-repost-button')
    expect(repostBtn).toHaveTextContent('50')
    
    fireEvent.click(repostBtn)
    // Should immediately increment due to optimistic local useState
    expect(repostBtn).toHaveTextContent('51')
  })
})
