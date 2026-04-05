'use client';

import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  duration?: number;
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

  play: (track?: Track) => {
    if (track) {
      set({ currentTrack: track, isPlaying: true, currentTime: 0, duration: track.duration ?? 0 });
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
    const { queue, currentTrack } = get();
    if (!queue.length) return;
    const idx = queue.findIndex((t) => t.id === currentTrack?.id);
    const next = queue[(idx + 1) % queue.length];
    set({ currentTrack: next, isPlaying: true, currentTime: 0, duration: next.duration ?? 0 });
  },

  prevTrack: () => {
    const { queue, currentTrack } = get();
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
}));
