'use client';

import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  duration?: number;
  hlsUrl?: string;
  streamUrl?: string;
  restrictedRegions?: string[];
  tier?: 'free' | 'pro';
  genre?: string;
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
  shuffledQueueIds: string[];
  repeatMode: 'none' | 'all' | 'one';
  isQueueOpen: boolean;
  playbackSource: 'global' | 'inline';
  previousVolume: number;
  contextType: 'playlist' | 'album' | null;
  contextId: string | null;
  contextTitle: string | null;
}

interface PlayerActions {
  play: (track?: Track, source?: 'global' | 'inline') => void;
  playContext: (tracks: Track[], startIndex: number, context: { type: 'playlist' | 'album'; id: string; title: string }) => void;
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
  addToQueue: (track: Track) => void;
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
  previousVolume: 0.8,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  queue: [],
  isShuffle: false,
  shuffledQueueIds: [],
  repeatMode: 'none',
  isQueueOpen: false,
  playbackSource: 'global',
  contextType: null,
  contextId: null,
  contextTitle: null,

  play: (track?: Track, source: 'global' | 'inline' = 'global') => {
    if (track) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('playerbar-stop-all', { detail: { activeTrackId: track.id } }));
      }
      set({ currentTrack: track, isPlaying: true, currentTime: 0, duration: track.duration ?? 0, playbackSource: source, contextType: null, contextId: null, contextTitle: null });
    } else {
      set({ isPlaying: true });
    }
  },

  playContext: (tracks, startIndex, context) => {
    const track = tracks[startIndex];
    if (track && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('playerbar-stop-all', { detail: { activeTrackId: track.id } }));
    }
    set(s => {
      // Setup queue with optional shuffle
      let shuffledQueueIds = s.shuffledQueueIds;
      if (s.isShuffle) {
        const ids = tracks.map((t) => t.id).filter((id) => track && id !== track.id);
        ids.sort(() => Math.random() - 0.5);
        shuffledQueueIds = track ? [track.id, ...ids] : ids;
      }
      return {
        queue: tracks,
        shuffledQueueIds,
        currentTrack: track || null,
        isPlaying: !!track,
        currentTime: 0,
        duration: track?.duration ?? 0,
        contextType: context.type,
        contextId: context.id,
        contextTitle: context.title,
        playbackSource: 'global',
      };
    });
  },

  pause: () => set({ isPlaying: false }),

  seek: (time: number) =>
    set({ currentTime: Math.max(0, Math.min(time, get().duration)) }),

  setVolume: (level: number) => {
    const clamped = Math.max(0, Math.min(1, level));
    const current = get();
    if (clamped === current.volume && (clamped > 0 ? !current.isMuted : current.isMuted)) return;

    if (clamped > 0) {
      set({ volume: clamped, isMuted: false, previousVolume: clamped });
    } else {
      set({ volume: 0, isMuted: true });
    }
  },

  toggleMute: () => set((s) => {
    if (s.isMuted) {
      const newVol = s.previousVolume > 0 ? s.previousVolume : 0.8;
      return { isMuted: false, volume: newVol, previousVolume: newVol };
    } else {
      return { isMuted: true, volume: 0, previousVolume: s.volume };
    }
  }),

  nextTrack: () => {
    const { queue, currentTrack, isShuffle, shuffledQueueIds, repeatMode } = get();

    if (repeatMode === 'one' && currentTrack) {
      set({ currentTime: 0, isPlaying: true });
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('playerbar-restart'));
      return;
    }

    if (!queue.length) return;

    let next: Track | undefined;
    
    if (isShuffle) {
      const currentId = currentTrack?.id;
      const idx = shuffledQueueIds.indexOf(currentId ?? '');
      if (idx >= shuffledQueueIds.length - 1 || idx === -1) {
        next = queue.find(t => t.id === shuffledQueueIds[0]) || queue[0];
      } else {
        next = queue.find(t => t.id === shuffledQueueIds[idx + 1]) || queue[idx + 1];
      }
    } else {
      const idx = queue.findIndex((t) => t.id === currentTrack?.id);
      if (idx >= queue.length - 1 || idx === -1) {
        next = queue[0];
      } else {
        next = queue[idx + 1];
      }
    }

    if (next) {
      set({ currentTrack: next, isPlaying: true, currentTime: 0, duration: next.duration ?? 0 });
    }
  },

  prevTrack: () => {
    const { queue, currentTrack, currentTime, isShuffle, shuffledQueueIds } = get();
    
    if (currentTime > 3 && currentTrack) {
      set({ currentTime: 0 });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('playerbar-seek', { detail: { time: 0 } }));
      }
      return;
    }

    if (!queue.length) return;

    let prev: Track | undefined;

    if (isShuffle) {
       const currentId = currentTrack?.id;
       const idx = shuffledQueueIds.indexOf(currentId ?? '');
       if (idx <= 0) {
         prev = queue.find(t => t.id === shuffledQueueIds[shuffledQueueIds.length - 1]) || queue[queue.length - 1];
       } else {
         prev = queue.find(t => t.id === shuffledQueueIds[idx - 1]) || queue[idx - 1];
       }
    } else {
      const idx = queue.findIndex((t) => t.id === currentTrack?.id);
      prev = queue[idx <= 0 ? queue.length - 1 : idx - 1];
    }
    
    if (prev) {
      set({ currentTrack: prev, isPlaying: true, currentTime: 0, duration: prev.duration ?? 0 });
    }
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),
  setDuration: (duration: number) => set({ duration }),
  setBuffered: (buffered: number) =>
    set({ buffered: Math.max(0, Math.min(1, buffered)) }),
  
  setQueue: (tracks: Track[]) => set(s => {
    const ids = tracks.map(t => t.id);
    if (s.isShuffle) {
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      return { queue: tracks, shuffledQueueIds: shuffled };
    }
    return { queue: tracks };
  }),
  addToQueue: (track: Track) => set(s => {
    if (s.queue.some(t => t.id === track.id)) return s;
    const newQueue = [...s.queue, track];
    const newShuffled = [...s.shuffledQueueIds, track.id];
    return { queue: newQueue, shuffledQueueIds: newShuffled };
  }),
  clearQueue: () => set({ queue: [], shuffledQueueIds: [] }),
  removeFromQueue: (trackId: string) => set(s => ({
    queue: s.queue.filter(t => t.id !== trackId),
    shuffledQueueIds: s.shuffledQueueIds.filter(id => id !== trackId)
  })),
  
  toggleShuffle: () => set(s => {
    const nextShuffle = !s.isShuffle;
    if (nextShuffle) {
      const ids = s.queue.map(t => t.id).filter(id => id !== s.currentTrack?.id);
      ids.sort(() => Math.random() - 0.5);
      const newShuffled = s.currentTrack ? [s.currentTrack.id, ...ids] : ids;
      return { isShuffle: true, shuffledQueueIds: newShuffled };
    }
    return { isShuffle: false, shuffledQueueIds: [] };
  }),
  cycleRepeatMode: () => set(s => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const nextIdx = (modes.indexOf(s.repeatMode) + 1) % modes.length;
    return { repeatMode: modes[nextIdx] };
  }),
  toggleQueueSidebar: () => set(s => ({ isQueueOpen: !s.isQueueOpen })),
}));
