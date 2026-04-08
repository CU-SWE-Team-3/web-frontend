'use client'

import { create } from 'zustand'
import type { Track } from './track'

interface PendingTracksState {
  pendingTracks: Track[]
  upsertPendingTrack: (track: Track) => void
  removePendingTrack: (trackId: string) => void
  removeResolvedPendingTracks: (trackIds: string[]) => void
}

export const usePendingTracksStore = create<PendingTracksState>((set) => ({
  pendingTracks: [],

  upsertPendingTrack: (track) =>
    set((state) => ({
      pendingTracks: [
        track,
        ...state.pendingTracks.filter((existing) => existing.id !== track.id),
      ],
    })),

  removePendingTrack: (trackId) =>
    set((state) => ({
      pendingTracks: state.pendingTracks.filter((track) => track.id !== trackId),
    })),

  removeResolvedPendingTracks: (trackIds) =>
    set((state) => ({
      pendingTracks: state.pendingTracks.filter((track) => !trackIds.includes(track.id)),
    })),
}))
