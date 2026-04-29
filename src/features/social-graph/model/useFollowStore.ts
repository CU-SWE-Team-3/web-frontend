import { create } from 'zustand'

export interface FollowState {
  followingMap: Record<string, boolean>
  setFollowing: (userId: string, isFollowing: boolean) => void
  initFollowing: (userId: string, isFollowing: boolean) => void
}

export const useFollowStore = create<FollowState>((set) => ({
  followingMap: {},
  setFollowing: (userId, isFollowing) => set((state) => ({
    followingMap: { ...state.followingMap, [userId]: isFollowing }
  })),
  initFollowing: (userId, isFollowing) => set((state) => {
    // Only initialize if not already set, to prevent overwriting local toggles
    if (userId in state.followingMap) return state
    return {
      followingMap: { ...state.followingMap, [userId]: isFollowing }
    }
  })
}))
