import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerBar } from '@/shared/ui/PlayerBar/PlayerBar';

const mockTrack = {
  id: '1',
  title: 'Test Track',
  artist: 'Test Artist',
  artworkUrl: '/test.jpg',
};

describe('PlayerBar', () => {
  it('renders track title and artist', () => {
    render(
      <PlayerBar
        track={mockTrack}
        onPlayPause={jest.fn()}
        onPrev={jest.fn()}
        onNext={jest.fn()}
      />
    );
    expect(screen.getAllByText('Test Track').length).toBeGreaterThan(0);
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('calls onPlayPause when play button is clicked (play state)', () => {
    const onPlayPause = jest.fn();
    render(<PlayerBar track={mockTrack} isPlaying={false} onPlayPause={onPlayPause} />);
    fireEvent.click(screen.getByLabelText('Play'));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('calls onPlayPause when pause button is clicked (pause state)', () => {
    const onPlayPause = jest.fn();
    render(<PlayerBar track={mockTrack} isPlaying={true} onPlayPause={onPlayPause} />);
    fireEvent.click(screen.getByLabelText('Pause'));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('calls onPrev when previous button is clicked', () => {
    const onPrev = jest.fn();
    render(<PlayerBar track={mockTrack} onPrev={onPrev} />);
    fireEvent.click(screen.getByLabelText('Previous track'));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when next button is clicked', () => {
    const onNext = jest.fn();
    render(<PlayerBar track={mockTrack} onNext={onNext} />);
    fireEvent.click(screen.getByLabelText('Next track'));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('renders sc-player-bar id', () => {
    render(<PlayerBar track={mockTrack} />);
    expect(document.getElementById('sc-player-bar')).toBeInTheDocument();
  });

  it('renders SeekBar (sc-seekbar) and VolumeControl (sc-volume-control)', () => {
    render(<PlayerBar track={mockTrack} />);
    expect(document.getElementById('sc-seekbar')).toBeInTheDocument();
    expect(document.getElementById('sc-volume-control')).toBeInTheDocument();
  });

  it('returns null when track is undefined', () => {
    const { container } = render(<PlayerBar />);
    expect(container.firstChild).toBeNull();
  });

  it('shows expand button', () => {
    render(<PlayerBar track={mockTrack} />);
    expect(screen.getByLabelText('Expand player')).toBeInTheDocument();
  });
});
