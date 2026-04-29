// component-id: UseSubscriptionStore_001

import { create } from 'zustand';
import type { SubscriptionPlan, BillingCycle } from '../types';
import type { User } from '@/shared/types';
import { createCheckoutSession, cancelSubscription } from '../api/subscriptionApi';

interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  isPremium: boolean;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  error: string | null;
  billingCycle: BillingCycle | null;
  isMockActive: boolean;

  // Sync plan info from authenticated user object (read from GET /auth/me)
  syncFromUser: (user: User | null) => void;
  // Calls POST /subscriptions/checkout — returns the checkoutUrl
  checkout: (planType: Exclude<SubscriptionPlan, 'Free'>) => Promise<string>;
  // Mock Stripe checkout — fully local, no API calls
  mockCheckout: (planType: Exclude<SubscriptionPlan, 'Free'>, cycle: BillingCycle) => void;
  // Mock cancel — resets to Free plan locally, no API calls
  mockCancel: () => void;
  // Calls DELETE /subscriptions/cancel
  cancel: () => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentPlan: 'Free',
  isPremium: false,
  expiresAt: null,
  cancelAtPeriodEnd: false,
  isLoading: false,
  error: null,
  billingCycle: null,
  isMockActive: false,

  syncFromUser: (user) => {
    // Skip sync if a mock checkout is active (preserves local subscription state)
    if (get().isMockActive) return;
    if (!user) {
      set({ currentPlan: 'Free', isPremium: false, expiresAt: null, cancelAtPeriodEnd: false });
      return;
    }
    set({
      currentPlan: (user.subscriptionPlan as SubscriptionPlan) ?? 'Free',
      isPremium: user.isPremium ?? false,
      expiresAt: user.subscriptionExpiresAt ?? null,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd ?? false,
    });
  },

  checkout: async (planType) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createCheckoutSession(planType);
      set({ isLoading: false });
      return response.checkoutUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Checkout failed.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  mockCheckout: (planType, cycle) => {
    const now = new Date();
    const expires = new Date(now);
    if (cycle === 'yearly') {
      expires.setFullYear(expires.getFullYear() + 1);
    } else {
      expires.setMonth(expires.getMonth() + 1);
    }
    set({
      currentPlan: planType,
      isPremium: true,
      expiresAt: expires.toISOString(),
      cancelAtPeriodEnd: false,
      billingCycle: cycle,
      isMockActive: true,
      isLoading: false,
      error: null,
    });
  },

  mockCancel: () => {
    set({
      currentPlan: 'Free',
      isPremium: false,
      expiresAt: null,
      cancelAtPeriodEnd: false,
      billingCycle: null,
      isMockActive: false,
      isLoading: false,
      error: null,
    });
  },

  cancel: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cancelSubscription();
      set({
        isLoading: false,
        cancelAtPeriodEnd: true,
        expiresAt: response.data?.expiresAt ?? null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cancellation failed.';
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
