import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Must import after mocks
import UploadSuccessModal from '../UploadSuccessModal'

describe('UploadSuccessModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when open is false', () => {
    render(
      <UploadSuccessModal
        open={false}
        onClose={vi.fn()}
        trackTitle="My Track"
        username="testuser"
        trackId="track-123"
      />
    )
    expect(screen.queryByTestId('upload-success-modal')).not.toBeInTheDocument()
  })

  it('renders when open is true', () => {
    render(
      <UploadSuccessModal
        open={true}
        onClose={vi.fn()}
        trackTitle="My Track"
        username="testuser"
        trackId="track-123"
      />
    )
    expect(screen.getByTestId('upload-success-modal')).toBeInTheDocument()
    expect(screen.getByText('Saved to BioBeats.')).toBeInTheDocument()
  })

  it('shows the track title', () => {
    render(
      <UploadSuccessModal
        open={true}
        onClose={vi.fn()}
        trackTitle="City Lights"
        username="testuser"
        trackId="track-456"
      />
    )
    expect(screen.getByText(/City Lights/)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(
      <UploadSuccessModal
        open={true}
        onClose={onClose}
        trackTitle="My Track"
        username="testuser"
        trackId="track-123"
      />
    )
    fireEvent.click(screen.getByTestId('upload-success-close-button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('navigates to track page when View track is clicked', () => {
    const onClose = vi.fn()
    render(
      <UploadSuccessModal
        open={true}
        onClose={onClose}
        trackTitle="My Track"
        username="testuser"
        trackId="track-789"
      />
    )
    fireEvent.click(screen.getByTestId('upload-success-view-track-button'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(mockPush).toHaveBeenCalledWith('/tracks/track-789')
  })

  it('shows the distribute section', () => {
    render(
      <UploadSuccessModal
        open={true}
        onClose={vi.fn()}
        trackTitle="My Track"
        username="testuser"
        trackId="track-123"
      />
    )
    expect(
      screen.getByText('Distribute to more streaming services?')
    ).toBeInTheDocument()
    expect(screen.getByText('Unlock with Artist Pro')).toBeInTheDocument()
  })

  it('falls back to profile when no trackId is provided', () => {
    const onClose = vi.fn()
    render(
      <UploadSuccessModal
        open={true}
        onClose={onClose}
        trackTitle="My Track"
        username="testuser"
      />
    )
    fireEvent.click(screen.getByTestId('upload-success-view-track-button'))
    expect(mockPush).toHaveBeenCalledWith('/profile/testuser')
  })
})
