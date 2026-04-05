import { renderHook, act } from '@testing-library/react';
import { usePlaybackState } from '../model/usePlaybackState';
import type { Track } from '../model/playerStore';

const freeTrack: Track = {
  id: 't1',
  title: 'Free Track',
  artist: 'Artist',
  artworkUrl: '/a.jpg',
  tier: 'free',
};

const proTrack: Track = {
  id: 't2',
  title: 'Pro Track',
  artist: 'Artist',
  artworkUrl: '/a.jpg',
  tier: 'pro',
};

const restrictedTrack: Track = {
  id: 't3',
  title: 'Restricted',
  artist: 'Artist',
  artworkUrl: '/a.jpg',
  restrictedRegions: ['DE', 'FR'],
};

describe('usePlaybackState', () => {
  it('returns "playable" for null track', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.getPlaybackState(null, 'US', 'pro')).toBe('playable');
  });

  it('returns "playable" for pro user on any track', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.getPlaybackState(proTrack, 'US', 'pro')).toBe('playable');
    expect(result.current.getPlaybackState(freeTrack, 'US', 'pro')).toBe('playable');
  });

  it('returns "playable" for free user on free track', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.getPlaybackState(freeTrack, 'US', 'free')).toBe('playable');
  });

  it('returns "preview" for free user on pro track', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.getPlaybackState(proTrack, 'US', 'free')).toBe('preview');
  });

  it('returns "preview" for guest user', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.getPlaybackState(freeTrack, 'US', 'guest')).toBe('preview');
    expect(result.current.getPlaybackState(proTrack, 'US', 'guest')).toBe('preview');
  });

  it('returns "blocked" for restricted region', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.getPlaybackState(restrictedTrack, 'DE', 'pro')).toBe('blocked');
    expect(result.current.getPlaybackState(restrictedTrack, 'FR', 'free')).toBe('blocked');
  });

  it('returns "playable" for non-restricted region', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.getPlaybackState(restrictedTrack, 'US', 'pro')).toBe('playable');
  });

  it('initialises previewTimeRemaining at 30', () => {
    const { result } = renderHook(() => usePlaybackState());
    expect(result.current.previewTimeRemaining).toBe(30);
  });

  it('startPreviewCountdown resets timer to 30', () => {
    const { result } = renderHook(() => usePlaybackState());
    act(() => { result.current.startPreviewCountdown(); });
    expect(result.current.previewTimeRemaining).toBe(30);
    act(() => { result.current.stopPreviewCountdown(); });
  });
});
