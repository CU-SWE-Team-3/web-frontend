import { renderHook, act } from '@testing-library/react';
import { useHistoryStore } from '../model/historyStore';
import { useHistory } from '../model/useHistory';
import type { Track } from '../model/playerStore';

const makeTrack = (i: number): Track => ({
  id: `t${i}`,
  title: `Track ${i}`,
  artist: `Artist ${i}`,
  artworkUrl: `/art${i}.jpg`,
});

beforeEach(() => {
  useHistoryStore.setState({ recentlyPlayed: [], listeningHistory: [] });
});

describe('useHistory', () => {
  it('starts with empty history', () => {
    const { result } = renderHook(() => useHistory());
    expect(result.current.recentlyPlayed).toHaveLength(0);
    expect(result.current.listeningHistory).toHaveLength(0);
  });

  it('addToHistory adds to both recentlyPlayed and listeningHistory', () => {
    const { result } = renderHook(() => useHistory());
    act(() => { result.current.addToHistory(makeTrack(1)); });
    expect(result.current.recentlyPlayed).toHaveLength(1);
    expect(result.current.listeningHistory).toHaveLength(1);
  });

  it('addToHistory deduplicates in recentlyPlayed (moves to front)', () => {
    const { result } = renderHook(() => useHistory());
    act(() => { result.current.addToHistory(makeTrack(1)); });
    act(() => { result.current.addToHistory(makeTrack(2)); });
    act(() => { result.current.addToHistory(makeTrack(1)); }); // re-add track 1
    expect(result.current.recentlyPlayed).toHaveLength(2);
    expect(result.current.recentlyPlayed[0].id).toBe('t1');
  });

  it('addToHistory caps recentlyPlayed at 10 items', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addToHistory(makeTrack(i));
      }
    });
    expect(result.current.recentlyPlayed).toHaveLength(10);
  });

  it('addToHistory does NOT cap listeningHistory', () => {
    const { result } = renderHook(() => useHistory());
    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addToHistory(makeTrack(i));
      }
    });
    expect(result.current.listeningHistory).toHaveLength(12);
  });

  it('clearRecent empties recentlyPlayed but not listeningHistory', () => {
    const { result } = renderHook(() => useHistory());
    act(() => { result.current.addToHistory(makeTrack(1)); });
    act(() => { result.current.addToHistory(makeTrack(2)); });
    act(() => { result.current.clearRecent(); });
    expect(result.current.recentlyPlayed).toHaveLength(0);
    expect(result.current.listeningHistory).toHaveLength(2);
  });

  it('deleteHistoryItem removes entry by id from listeningHistory', () => {
    const { result } = renderHook(() => useHistory());
    act(() => { result.current.addToHistory(makeTrack(1)); });
    const entryId = result.current.listeningHistory[0].id;
    act(() => { result.current.deleteHistoryItem(entryId); });
    expect(result.current.listeningHistory).toHaveLength(0);
  });

  it('deleteHistoryItem does not affect recentlyPlayed', () => {
    const { result } = renderHook(() => useHistory());
    act(() => { result.current.addToHistory(makeTrack(1)); });
    const entryId = result.current.listeningHistory[0].id;
    act(() => { result.current.deleteHistoryItem(entryId); });
    expect(result.current.recentlyPlayed).toHaveLength(1);
  });

  it('deleteHistoryItem removes only the correct entry', () => {
    const { result } = renderHook(() => useHistory());
    act(() => { result.current.addToHistory(makeTrack(1)); });
    act(() => { result.current.addToHistory(makeTrack(2)); });
    const firstEntryId = result.current.listeningHistory[0].id;
    act(() => { result.current.deleteHistoryItem(firstEntryId); });
    expect(result.current.listeningHistory).toHaveLength(1);
    expect(result.current.listeningHistory[0].track.id).toBe('t1');
  });
});
