'use client';

import { create } from 'zustand';
import type { Track } from './playerStore';

export interface HistoryEntry {
  id: string;
  track: Track;
  playedAt: string;
  durationPlayed: number;
}

interface HistoryState {
  recentlyPlayed: Track[];
  listeningHistory: HistoryEntry[];
}

interface HistoryActions {
  addToHistory: (track: Track, durationPlayed?: number) => void;
  clearRecent: () => void;
  deleteHistoryItem: (id: string) => void;
}

export type HistoryStore = HistoryState & HistoryActions;

export const useHistoryStore = create<HistoryStore>((set) => ({
  recentlyPlayed: [],
  listeningHistory: [],

  addToHistory: (track: Track, durationPlayed = 0) =>
    set((state) => {
      const filtered = state.recentlyPlayed.filter((t) => t.id !== track.id);
      const newRecent = [track, ...filtered].slice(0, 10);
      
      const filteredListening = state.listeningHistory.filter((e) => e.track.id !== track.id);
      const entry: HistoryEntry = {
        id: `${track.id}-${Date.now()}`,
        track,
        playedAt: new Date().toISOString(),
        durationPlayed,
      };
      
      return {
        recentlyPlayed: newRecent,
        listeningHistory: [entry, ...filteredListening],
      };
    }),

  clearRecent: () => set({ recentlyPlayed: [] }),

  deleteHistoryItem: (id: string) =>
    set((state) => ({
      listeningHistory: state.listeningHistory.filter((e) => e.id !== id),
    })),
}));
