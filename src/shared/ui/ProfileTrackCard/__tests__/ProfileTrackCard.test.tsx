import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProfileTrackCard } from '../ProfileTrackCard'

vi.mock('@/features/tracks/ui/WaveformPlayer', () => ({
  default: () => <div data-testid="mock-waveform-player" />
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
  it('renders track card with full test IDs', () => {
    render(
      <ProfileTrackCard 
        track={mockTrack as any} 
        userFullName="Test User" 
        username="testuser" 
      />
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
})
