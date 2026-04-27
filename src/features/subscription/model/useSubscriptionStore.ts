'use client'

import { create } from 'zustand'
import type { SubscriptionPlan, CheckoutState } from './subscriptionTypes'
import { UPLOAD_LIMITS } from './subscriptionTypes'
import { subscriptionRepository } from '../api/subscriptionRepository'

// ─── Subscription Store ──────────────────────────────────────────────────────

interface SubscriptionState {
  // Plan state
  currentPlan: SubscriptionPlan
  isPremium: boolean
  expiresAt: string | null
  cancelAtPeriodEnd: boolean

  // Upload limits
  trackCount: number
  uploadLimit: number
  canUploadMore: boolean
  isCheckingUpload: boolean

  // Checkout state
  checkout: CheckoutState

  // Download state
  downloadingTrackId: string | null

  // Actions
  syncFromUser: (user: any) => void
  checkUploadEligibility: () => Promise<void>
  openCheckout: () => void
  closeCheckout: () => void
  processCheckout: () => Promise<boolean>
  cancelSubscription: () => Promise<boolean>
  reactivateSubscription: () => Promise<boolean>
  downloadTrack: (trackId: string, title: string) => Promise<void>
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  // Initial state
  currentPlan: 'Free',
  isPremium: false,
  expiresAt: null,
  cancelAtPeriodEnd: false,

  trackCount: 0,
  uploadLimit: UPLOAD_LIMITS.Free,
  canUploadMore: true,
  isCheckingUpload: false,

  checkout: {
    isOpen: false,
    step: 'form',
    selectedPlan: 'Pro',
    error: null,
  },

  downloadingTrackId: null,

  // Sync store from user object (called when auth state changes)
  syncFromUser: (user: any) => {
    if (!user) return
    const plan: SubscriptionPlan = user.subscriptionPlan === 'Pro' ? 'Pro' : 'Free'
    set({
      currentPlan: plan,
      isPremium: plan === 'Pro' || !!user.isPremium,
      expiresAt: user.subscriptionExpiresAt || null,
      cancelAtPeriodEnd: !!user.cancelAtPeriodEnd,
      uploadLimit: UPLOAD_LIMITS[plan],
    })
  },

  // Check if the user can upload more tracks
  checkUploadEligibility: async () => {
    set({ isCheckingUpload: true })
    try {
      const result = await subscriptionRepository.canUpload()
      set({
        canUploadMore: result.allowed,
        trackCount: result.current,
        uploadLimit: result.limit,
        isCheckingUpload: false,
      })
    } catch {
      set({ isCheckingUpload: false })
    }
  },

  // Checkout actions
  openCheckout: () => {
    set({
      checkout: {
        isOpen: true,
        step: 'form',
        selectedPlan: 'Pro',
        error: null,
      },
    })
  },

  closeCheckout: () => {
    set({
      checkout: {
        ...get().checkout,
        isOpen: false,
        step: 'form',
        error: null,
      },
    })
  },

  processCheckout: async () => {
    set({ checkout: { ...get().checkout, step: 'processing', error: null } })
    try {
      await subscriptionRepository.createCheckoutSession()
      set({
        checkout: { ...get().checkout, step: 'success' },
        currentPlan: 'Pro',
        isPremium: true,
        uploadLimit: UPLOAD_LIMITS.Pro,
        canUploadMore: true,
        cancelAtPeriodEnd: false,
      })
      return true
    } catch (err: any) {
      set({
        checkout: {
          ...get().checkout,
          step: 'error',
          error: err?.message || 'Payment processing failed',
        },
      })
      return false
    }
  },

  cancelSubscription: async () => {
    try {
      await subscriptionRepository.cancelSubscription()
      set({ cancelAtPeriodEnd: true })
      return true
    } catch {
      return false
    }
  },

  reactivateSubscription: async () => {
    try {
      await subscriptionRepository.reactivateSubscription()
      set({ cancelAtPeriodEnd: false })
      return true
    } catch {
      return false
    }
  },

  downloadTrack: async (trackId: string, title: string) => {
    const { currentPlan } = get()
    if (currentPlan !== 'Pro') {
      throw new Error('Pro subscription required for downloads')
    }
    set({ downloadingTrackId: trackId })
    try {
      await subscriptionRepository.downloadTrack(trackId, title)
    } finally {
      set({ downloadingTrackId: null })
    }
  },
}))
