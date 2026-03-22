import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { TrackCard } from '../TrackCard'

describe('TrackCard', () => {
  it('renders correctly with given props', () => {
    render(
      <TrackCard 
        title="Test Track" 
        artist="Test Artist" 
        duration="3:45"
        plays={100}
        likes={50}
      />
    )
    
    expect(screen.getByTestId('track-card')).toBeInTheDocument()
    expect(screen.getByTestId('track-card-title')).toHaveTextContent('Test Track')
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
    expect(screen.getByText('3:45')).toBeInTheDocument()
    expect(screen.getByTestId('track-card-waveform')).toBeInTheDocument()
  })

  it('handles play and like clicks', async () => {
    const user = userEvent.setup()
    const onPlay = vi.fn()
    const onLike = vi.fn()
    
    render(
      <TrackCard 
        title="Test Track" 
        artist="Test Artist" 
        duration="3:45"
        onPlay={onPlay}
        onLike={onLike}
      />
    )
    
    const playBtn = screen.getByLabelText('Play')
    await user.click(playBtn)
    expect(onPlay).toHaveBeenCalledOnce()
    
    const likeBtn = screen.getByTestId('track-card-like-button')
    await user.click(likeBtn)
    expect(onLike).toHaveBeenCalledOnce()
  })
})
