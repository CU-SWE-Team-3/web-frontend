import apiClient from '@/shared/api/client'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import type { SubscriptionPlan } from '../model/subscriptionTypes'
import { UPLOAD_LIMITS } from '../model/subscriptionTypes'

// ─── Subscription Repository ─────────────────────────────────────────────────
// API layer for all subscription-related operations.
// Uses existing API endpoints — no new APIs created.

export const subscriptionRepository = {
  /**
   * Read the current user's subscription plan from the auth store.
   */
  getCurrentPlan(): SubscriptionPlan {
    const { user } = useAuthStore.getState()
    const plan = (user as any)?.subscriptionPlan
    if (plan === 'Pro') return 'Pro'
    return 'Free'
  },

  /**
   * Fetch the user's track count from the API.
   */
  async getTrackCount(): Promise<number> {
    try {
      const response = await apiClient.get('/tracks/my-tracks')
      const tracks = response.data?.data || response.data?.tracks || response.data || []
      return Array.isArray(tracks) ? tracks.length : 0
    } catch {
      console.warn('[subscriptionRepository] Failed to fetch track count')
      return 0
    }
  },

  /**
   * Check if the user can upload another track.
   * Pro = unlimited, Free = max 3.
   */
  async canUpload(): Promise<{ allowed: boolean; current: number; limit: number }> {
    const plan = this.getCurrentPlan()
    const limit = UPLOAD_LIMITS[plan]
    if (limit === Infinity) {
      return { allowed: true, current: 0, limit: Infinity }
    }
    const current = await this.getTrackCount()
    return { allowed: current < limit, current, limit }
  },

  /**
   * Mocked Stripe checkout session.
   * Simulates a 2-second processing delay, then updates user state.
   */
  async createCheckoutSession(): Promise<{ success: boolean }> {
    // Simulate Stripe processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Update the user's subscription in the auth store
    const { user, setUser } = useAuthStore.getState()
    if (user) {
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)

      setUser({
        ...user,
        isPremium: true,
        subscriptionPlan: 'Pro',
        subscriptionExpiresAt: expiresAt.toISOString(),
        cancelAtPeriodEnd: false,
      } as any)
    }

    // Attempt to update profile on the backend (best effort)
    try {
      await apiClient.patch('/profile/update', {
        subscriptionPlan: 'Pro',
      })
    } catch {
      console.warn('[subscriptionRepository] Backend profile update failed (mocked checkout)')
    }

    return { success: true }
  },

  /**
   * Mocked subscription cancellation.
   * Sets cancelAtPeriodEnd: true — subscription stays active until expiry.
   */
  async cancelSubscription(): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const { user, setUser } = useAuthStore.getState()
    if (user) {
      setUser({
        ...user,
        cancelAtPeriodEnd: true,
      } as any)
    }

    return { success: true }
  },

  /**
   * Mocked subscription reactivation.
   */
  async reactivateSubscription(): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const { user, setUser } = useAuthStore.getState()
    if (user) {
      setUser({
        ...user,
        cancelAtPeriodEnd: false,
      } as any)
    }

    return { success: true }
  },

  /**
   * Download a track's raw audio (Pro only).
   * Calls GET /tracks/{id}/download which returns a binary stream.
   */
  async downloadTrack(trackId: string, trackTitle: string): Promise<void> {
    try {
      const response = await apiClient.get(`/tracks/${trackId}/download`, {
        responseType: 'blob',
      })

      // Create a download link from the blob
      const blob = new Blob([response.data], { type: 'application/octet-stream' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${trackTitle || 'track'}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Download failed'
      throw new Error(message)
    }
  },
}
