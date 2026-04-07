import { renderHook, act } from '@testing-library/react';
import { usePlayerStore } from '../model/playerStore';
import { usePlayer } from '../model/usePlayer';
import type { Track } from '../model/playerStore';

const mockTrack: Track = {
  id: 'track-1',
  title: 'Test Song',
  artist: 'Test Artist',
  artworkUrl: '/art.jpg',
  duration: 200,
};

beforeEach(() => {
  usePlayerStore.setState({
    currentTrack: null,
    isPlaying: false,
    volume: 0.8,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    queue: [],
  });
});

describe('usePlayer', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => usePlayer());
    expect(result.current.currentTrack).toBeNull();
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.volume).toBe(0.8);
    expect(result.current.isMuted).toBe(false);
  });

  it('play(track) sets currentTrack and isPlaying', () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.play(mockTrack); });
    expect(result.current.currentTrack).toEqual(mockTrack);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.duration).toBe(200);
  });

  it('pause() sets isPlaying to false', () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.play(mockTrack); });
    act(() => { result.current.pause(); });
    expect(result.current.isPlaying).toBe(false);
  });

  it('play() without track resumes playback', () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.play(mockTrack); });
    act(() => { result.current.pause(); });
    act(() => { result.current.play(); });
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTrack).toEqual(mockTrack);
  });

  it('seek() clamps currentTime between 0 and duration', () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.play(mockTrack); });
    act(() => { result.current.seek(100); });
    expect(result.current.currentTime).toBe(100);
    act(() => { result.current.seek(-10); });
    expect(result.current.currentTime).toBe(0);
    act(() => { result.current.seek(9999); });
    expect(result.current.currentTime).toBe(200);
  });

  it('setVolume() clamps between 0 and 1 and clears mute', () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.toggleMute(); });
    act(() => { result.current.setVolume(0.5); });
    expect(result.current.volume).toBe(0.5);
    expect(result.current.isMuted).toBe(false);
    act(() => { result.current.setVolume(-1); });
    expect(result.current.volume).toBe(0);
    act(() => { result.current.setVolume(99); });
    expect(result.current.volume).toBe(1);
  });

  it('toggleMute() flips isMuted', () => {
    const { result } = renderHook(() => usePlayer());
    expect(result.current.isMuted).toBe(false);
    act(() => { result.current.toggleMute(); });
    expect(result.current.isMuted).toBe(true);
    act(() => { result.current.toggleMute(); });
    expect(result.current.isMuted).toBe(false);
  });

  it('nextTrack() advances queue cyclically', () => {
    const track2: Track = { id: 'track-2', title: 'Song 2', artist: 'Artist 2', artworkUrl: '/a.jpg', duration: 150 };
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.setQueue([mockTrack, track2]); });
    act(() => { result.current.play(mockTrack); });
    act(() => { result.current.nextTrack(); });
    expect(result.current.currentTrack?.id).toBe('track-2');
  });

  it('prevTrack() goes back in queue', () => {
    const track2: Track = { id: 'track-2', title: 'Song 2', artist: 'Artist 2', artworkUrl: '/a.jpg', duration: 150 };
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.setQueue([mockTrack, track2]); });
    act(() => { result.current.play(track2); });
    act(() => { result.current.prevTrack(); });
    expect(result.current.currentTrack?.id).toBe('track-1');
  });
});
