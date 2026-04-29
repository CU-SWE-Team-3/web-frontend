import { create } from 'zustand'

export interface FollowState {
  followingMap: Record<string, boolean>
  setFollowing: (userId: string, isFollowing: boolean) => void
}

export const useFollowStore = create<FollowState>((set) => ({
  followingMap: {},
  setFollowing: (userId, isFollowing) => set((state) => ({
    followingMap: { ...state.followingMap, [userId]: isFollowing }
  })),
}))
