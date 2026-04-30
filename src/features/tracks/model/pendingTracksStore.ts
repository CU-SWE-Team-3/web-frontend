'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Track } from './track'

interface PendingTracksState {
  pendingTracks: Track[]
  upsertPendingTrack: (track: Track) => void
  removePendingTrack: (trackId: string) => void
  removeResolvedPendingTracks: (trackIds: string[]) => void
}

function persistableTrack(track: Track): Track {
  return {
    ...track,
    streamUrl: track.streamUrl?.startsWith('blob:') ? undefined : track.streamUrl,
    artworkUrl: track.artworkUrl?.startsWith('blob:') ? '' : track.artworkUrl,
  }
}

export const usePendingTracksStore = create<PendingTracksState>()(
  persist(
    (set) => ({
      pendingTracks: [],

      upsertPendingTrack: (track) =>
        set((state) => ({
          pendingTracks: [
            persistableTrack(track),
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
    }),
    {
      name: 'biobeats-pending-tracks',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pendingTracks: state.pendingTracks.map(persistableTrack),
      }),
    },
  ),
)
