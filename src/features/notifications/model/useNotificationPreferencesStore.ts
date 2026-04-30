'use client'

import { create } from 'zustand'
import type { NotificationPreferences } from '@/shared/types'
import { 
  updateNotificationPreferences as apiUpdatePreferences,
  fetchNotificationPreferences as apiFetchPreferences 
} from '../api/notificationApi'

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
  fetchPreferences: () => Promise<void>
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

  fetchPreferences: async () => {
    set({ isLoading: true })
    try {
      const prefs = await apiFetchPreferences()
      set((state) => ({
        activities: {
          ...state.activities,
          newFollower: { email: prefs.emailFollows ?? true, devices: prefs.allowFollows ?? true },
          repostOfYourPost: { email: prefs.emailReposts ?? true, devices: prefs.allowReposts ?? true },
          newPostByFollowedUser: { email: prefs.emailNewTracks ?? true, devices: prefs.allowNewTracks ?? true },
          likesAndPlaysOnYourPost: { email: prefs.emailLikes ?? true, devices: prefs.allowLikes ?? true },
          commentOnYourPost: { email: prefs.emailComments ?? false, devices: prefs.allowComments ?? true },
          recommendedContent: { email: prefs.emailRecommended ?? true, devices: prefs.allowRecommended ?? true },
          newMessage: { 
            email: prefs.emailMessages ?? true, 
            devices: !prefs.allowMessages ? 'Nobody' : (prefs.messagePermission ?? 'Everyone')
          },
        },
        updates: {
          ...state.updates,
          featureUpdatesAndEducation: { 
            email: prefs.emailRecommended ?? true, 
            devices: prefs.allowRecommended ?? true 
          },
          surveysAndFeedback: { 
            email: prefs.emailRecommended ?? true, 
            devices: prefs.allowRecommended ?? true 
          },
          promotionalAndPartnershipContent: { 
            email: prefs.emailRecommended ?? true, 
            devices: prefs.allowRecommended ?? true 
          },
        },
        isDirty: false,
      }))
    } catch (err) {
      console.error('[Notification Preferences] Fetch failed:', err)
    } finally {
      set({ isLoading: false })
    }
  },

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
      const { activities, updates } = get()
      // Map UI state to API NotificationPreferences
      const prefs: Partial<NotificationPreferences> = {
        pushEnabled: true,
        emailEnabled: true,
        allowLikes: activities.likesAndPlaysOnYourPost.devices,
        emailLikes: activities.likesAndPlaysOnYourPost.email,
        allowReposts: activities.repostOfYourPost.devices,
        emailReposts: activities.repostOfYourPost.email,
        allowComments: activities.commentOnYourPost.devices,
        emailComments: activities.commentOnYourPost.email,
        allowFollows: activities.newFollower.devices,
        emailFollows: activities.newFollower.email,
        allowMessages: activities.newMessage.devices !== 'Nobody',
        messagePermission: activities.newMessage.devices === 'Nobody' ? 'Everyone' : (activities.newMessage.devices as any),
        emailMessages: activities.newMessage.email,
        allowNewTracks: activities.newPostByFollowedUser.devices,
        emailNewTracks: activities.newPostByFollowedUser.email,
        allowRecommended: activities.recommendedContent.devices || updates.featureUpdatesAndEducation.devices,
        emailRecommended: activities.recommendedContent.email || updates.featureUpdatesAndEducation.email,
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
