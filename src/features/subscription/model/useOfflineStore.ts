// component-id: UseOfflineStore_001

import { create } from 'zustand';

export interface OfflineTrack {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  duration?: number;
  downloadedAt: string;
}

interface OfflineState {
  downloadedTracks: OfflineTrack[];
  // Download a track for offline listening (mock — persists in localStorage)
  downloadTrack: (track: Omit<OfflineTrack, 'downloadedAt'>) => void;
  // Remove a track from offline library
  removeTrack: (id: string) => void;
  // Check if a track is already downloaded
  isDownloaded: (id: string) => boolean;
  // Clear all downloaded tracks
  clearAll: () => void;
  // Hydrate from localStorage on app load
  hydrate: () => void;
}

const STORAGE_KEY = 'biobeats_offline_tracks';

const loadFromStorage = (): OfflineTrack[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OfflineTrack[]) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (tracks: OfflineTrack[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch {
    /* ignore quota errors */
  }
};

export const useOfflineStore = create<OfflineState>((set, get) => ({
  downloadedTracks: [],

  hydrate: () => {
    const tracks = loadFromStorage();
    set({ downloadedTracks: tracks });
  },

  downloadTrack: (track) => {
    const existing = get().downloadedTracks;
    if (existing.some((t) => t.id === track.id)) return; // already downloaded
    const newTrack: OfflineTrack = {
      ...track,
      downloadedAt: new Date().toISOString(),
    };
    const updated = [newTrack, ...existing];
    set({ downloadedTracks: updated });
    saveToStorage(updated);
  },

  removeTrack: (id) => {
    const updated = get().downloadedTracks.filter((t) => t.id !== id);
    set({ downloadedTracks: updated });
    saveToStorage(updated);
  },

  isDownloaded: (id) => {
    return get().downloadedTracks.some((t) => t.id === id);
  },

  clearAll: () => {
    set({ downloadedTracks: [] });
    saveToStorage([]);
  },
}));
