'use client'

import { create } from 'zustand'
import type { NotificationPreferences } from '@/shared/types'
import { updateNotificationPreferences as apiUpdatePreferences } from '../api/notificationApi'

// ─── Notification Preferences Store ─────────────────────────────────────────────
// Maps to the SoundCloud Settings > Notifications tab (Activities + Updates)

export interface NotificationSettingsState {
  // Activities — per-type email + devices toggles
  activities: {
    newFollower: { email: boolean; devices: boolean }
    repostOfYourPost: { email: boolean; devices: boolean }
    newPostByFollowedUser: { email: boolean; devices: boolean }
    likesAndPlaysOnYourPost: { email: boolean; devices: boolean }
    commentOnYourPost: { email: boolean; devices: boolean }
    recommendedContent: { email: boolean; devices: boolean }
    newMessage: { email: boolean; devices: string } // "Everyone" dropdown
  }
  // Updates from SoundCloud
  updates: {
    featureUpdatesAndEducation: { email: boolean; devices: boolean }
    surveysAndFeedback: { email: boolean; devices: boolean }
    promotionalAndPartnershipContent: { email: boolean; devices: boolean }
    soundCloudNewsletter: { email: boolean }
  }
  // State
  isLoading: boolean
  isDirty: boolean

  // Actions
  toggleActivity: (key: string, channel: 'email' | 'devices', value: boolean | string) => void
  toggleUpdate: (key: string, channel: 'email' | 'devices', value: boolean) => void
  savePreferences: () => Promise<void>
  resetChanges: () => void
}

const DEFAULT_ACTIVITIES = {
  newFollower: { email: true, devices: true },
  repostOfYourPost: { email: true, devices: true },
  newPostByFollowedUser: { email: true, devices: true },
  likesAndPlaysOnYourPost: { email: true, devices: true },
  commentOnYourPost: { email: false, devices: true },
  recommendedContent: { email: true, devices: true },
  newMessage: { email: true, devices: 'Everyone' as string },
}

const DEFAULT_UPDATES = {
  featureUpdatesAndEducation: { email: true, devices: true },
  surveysAndFeedback: { email: true, devices: true },
  promotionalAndPartnershipContent: { email: true, devices: true },
  soundCloudNewsletter: { email: true },
}

export const useNotificationPreferencesStore = create<NotificationSettingsState>((set, get) => ({
  activities: { ...DEFAULT_ACTIVITIES },
  updates: { ...DEFAULT_UPDATES },
  isLoading: false,
  isDirty: false,

  toggleActivity: (key, channel, value) => {
    set((state) => ({
      activities: {
        ...state.activities,
        [key]: {
          ...(state.activities as any)[key],
          [channel]: value,
        },
      },
      isDirty: true,
    }))
  },

  toggleUpdate: (key, channel, value) => {
    set((state) => ({
      updates: {
        ...state.updates,
        [key]: {
          ...(state.updates as any)[key],
          [channel]: value,
        },
      },
      isDirty: true,
    }))
  },

  savePreferences: async () => {
    set({ isLoading: true })
    try {
      const { activities } = get()
      // Map UI state to API NotificationPreferences
      const prefs: Partial<NotificationPreferences> = {
        pushEnabled: true,
        allowLikes: activities.likesAndPlaysOnYourPost.devices,
        allowReposts: activities.repostOfYourPost.devices,
        allowComments: activities.commentOnYourPost.devices,
        allowFollows: activities.newFollower.devices,
        allowMessages: activities.newMessage.devices !== 'Nobody',
        allowNewTracks: activities.newPostByFollowedUser.devices,
      }
      await apiUpdatePreferences(prefs)
      set({ isDirty: false })
    } catch (err) {
      console.error('[Notification Preferences] Save failed:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  resetChanges: () => {
    set({
      activities: { ...DEFAULT_ACTIVITIES },
      updates: { ...DEFAULT_UPDATES },
      isDirty: false,
    })
  },
}))
