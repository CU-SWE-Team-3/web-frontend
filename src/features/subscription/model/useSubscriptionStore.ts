// component-id: UseSubscriptionStore_001

import { create } from 'zustand';
import type { SubscriptionPlan } from '../types';
import type { User } from '@/shared/types';
import { createCheckoutSession, cancelSubscription } from '../api/subscriptionApi';

interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  isPremium: boolean;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  error: string | null;

  // Sync plan info from authenticated user object (read from GET /auth/me)
  syncFromUser: (user: User | null) => void;
  // Calls POST /subscriptions/checkout — returns the checkoutUrl
  checkout: (planType: Exclude<SubscriptionPlan, 'Free'>) => Promise<string>;
  // Calls DELETE /subscriptions/cancel
  cancel: () => Promise<void>;
  clearError: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  currentPlan: 'Free',
  isPremium: false,
  expiresAt: null,
  cancelAtPeriodEnd: false,
  isLoading: false,
  error: null,

  syncFromUser: (user) => {
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
