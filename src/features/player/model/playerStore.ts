'use client';

import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  duration?: number;
  hlsUrl?: string;
  restrictedRegions?: string[];
  tier?: 'free' | 'pro';
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  queue: Track[];
  isShuffle: boolean;
  repeatMode: 'none' | 'all' | 'one';
  isQueueOpen: boolean;
  playbackSource: 'global' | 'inline';
}

interface PlayerActions {
  play: (track?: Track) => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (level: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setBuffered: (buffered: number) => void;
  setQueue: (tracks: Track[]) => void;
  clearQueue: () => void;
  removeFromQueue: (trackId: string) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  toggleQueueSidebar: () => void;
}

export type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  queue: [],
  isShuffle: false,
  repeatMode: 'none',
  isQueueOpen: false,
  playbackSource: 'global',

  play: (track?: Track) => {
    if (track) {
      set({ currentTrack: track, isPlaying: true, currentTime: 0, duration: track.duration ?? 0, playbackSource: 'global' });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => set({ isPlaying: false }),

  seek: (time: number) =>
    set({ currentTime: Math.max(0, Math.min(time, get().duration)) }),

  setVolume: (level: number) =>
    set({ volume: Math.max(0, Math.min(1, level)), isMuted: false }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

  nextTrack: () => {
    const { queue, currentTrack, isShuffle, repeatMode } = get();
    
    if (repeatMode === 'one' && currentTrack) {
      // Replay the same track
      set({ currentTime: 0, isPlaying: true });
      // Tell inline WaveformPlayer to restart
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('playerbar-seek', { detail: { time: 0 } }));
        window.dispatchEvent(new CustomEvent('playerbar-playpause'));
      }
      return;
    }

    if (!queue.length) {
      if (repeatMode === 'all' && currentTrack) {
         set({ currentTime: 0 });
      }
      return;
    }

    let next: Track;
    if (isShuffle) {
       const unplayed = queue.filter(t => t.id !== currentTrack?.id);
       next = unplayed.length > 0 ? unplayed[Math.floor(Math.random() * unplayed.length)] : queue[0];
    } else {
       const idx = queue.findIndex((t) => t.id === currentTrack?.id);
       if (idx >= queue.length - 1) {
         if (repeatMode === 'all') next = queue[0];
         else { set({ isPlaying: false, currentTime: 0 }); return; }
       } else {
         next = queue[idx + 1];
       }
    }
    set({ currentTrack: next, isPlaying: true, currentTime: 0, duration: next.duration ?? 0 });
  },

  prevTrack: () => {
    const { queue, currentTrack, currentTime } = get();
    
    // If we've played for more than 3 seconds, just restart the current track like typical players
    if (currentTime > 3 && currentTrack) {
      set({ currentTime: 0 });
      return;
    }

    if (!queue.length) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const prev = queue[idx <= 0 ? queue.length - 1 : idx - 1];
    set({ currentTrack: prev, isPlaying: true, currentTime: 0, duration: prev.duration ?? 0 });
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setBuffered: (buffered: number) =>
    set({ buffered: Math.max(0, Math.min(1, buffered)) }),
  
  setQueue: (tracks: Track[]) => set({ queue: tracks }),
  clearQueue: () => set({ queue: [] }),
  removeFromQueue: (trackId: string) => set(s => ({ queue: s.queue.filter(t => t.id !== trackId) })),
  
  toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),
  cycleRepeatMode: () => set(s => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const nextIdx = (modes.indexOf(s.repeatMode) + 1) % modes.length;
    return { repeatMode: modes[nextIdx] };
  }),
  toggleQueueSidebar: () => set(s => ({ isQueueOpen: !s.isQueueOpen })),
}));
