import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentlyPlayed } from '../ui/history/RecentlyPlayed';
import type { Track } from '../model/playerStore';

const makeTracks = (n: number): Track[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `t${i}`,
    title: `Track ${i}`,
    artist: `Artist ${i}`,
    artworkUrl: `/art${i}.jpg`,
  }));

describe('RecentlyPlayed', () => {
  it('renders sc-recently-played id', () => {
    render(<RecentlyPlayed tracks={[]} onPlay={jest.fn()} onClear={jest.fn()} />);
    expect(document.getElementById('sc-recently-played')).toBeInTheDocument();
  });

  it('renders empty state when no tracks', () => {
    render(<RecentlyPlayed tracks={[]} onPlay={jest.fn()} onClear={jest.fn()} />);
    expect(screen.getByText('No recently played tracks')).toBeInTheDocument();
  });

  it('renders up to 10 items with correct IDs', () => {
    const tracks = makeTracks(10);
    render(<RecentlyPlayed tracks={tracks} onPlay={jest.fn()} onClear={jest.fn()} />);
    for (let i = 0; i < 10; i++) {
      expect(document.getElementById(`sc-recent-item-${i}`)).toBeInTheDocument();
    }
  });

  it('does not render more than the provided tracks (max 10 enforced by store)', () => {
    const tracks = makeTracks(10);
    render(<RecentlyPlayed tracks={tracks} onPlay={jest.fn()} onClear={jest.fn()} />);
    expect(document.getElementById('sc-recent-item-10')).not.toBeInTheDocument();
  });

  it('calls onPlay with correct track when item clicked', () => {
    const onPlay = jest.fn();
    const tracks = makeTracks(3);
    render(<RecentlyPlayed tracks={tracks} onPlay={onPlay} onClear={jest.fn()} />);
    fireEvent.click(document.getElementById('sc-recent-item-1')!);
    expect(onPlay).toHaveBeenCalledWith(tracks[1]);
  });

  it('renders clear button when tracks exist', () => {
    render(<RecentlyPlayed tracks={makeTracks(1)} onPlay={jest.fn()} onClear={jest.fn()} />);
    expect(document.getElementById('sc-btn-clear-recent')).toBeInTheDocument();
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = jest.fn();
    render(<RecentlyPlayed tracks={makeTracks(1)} onPlay={jest.fn()} onClear={onClear} />);
    fireEvent.click(document.getElementById('sc-btn-clear-recent')!);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('does not render clear button when no tracks', () => {
    render(<RecentlyPlayed tracks={[]} onPlay={jest.fn()} onClear={jest.fn()} />);
    expect(document.getElementById('sc-btn-clear-recent')).not.toBeInTheDocument();
  });
});
