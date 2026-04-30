import { create } from 'zustand'

export interface BlockState {
  blockedMap: Record<string, boolean>
  setBlocked: (userId: string, isBlocked: boolean) => void
}

export const useBlockStore = create<BlockState>((set) => ({
  blockedMap: {},
  setBlocked: (userId, isBlocked) => set((state) => ({
    blockedMap: { ...state.blockedMap, [userId]: isBlocked }
  })),
}))
