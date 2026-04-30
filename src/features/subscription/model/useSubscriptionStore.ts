// component-id: UseSubscriptionStore_001

import { create } from 'zustand';
import type { SubscriptionPlan, BillingCycle } from '../types';
import type { User } from '@/shared/types';
import { createCheckoutSession, cancelSubscription } from '../api/subscriptionApi';

const MOCK_STORAGE_KEY = 'biobeats_mock_subscription';

/** Persist mock subscription state to localStorage */
function saveMockState(state: {
  currentPlan: SubscriptionPlan;
  expiresAt: string | null;
  billingCycle: BillingCycle | null;
}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore quota errors */ }
}

/** Load mock subscription state from localStorage */
function loadMockState(): {
  currentPlan: SubscriptionPlan;
  expiresAt: string | null;
  billingCycle: BillingCycle | null;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Validate the expiry — if it's in the past, the mock subscription has expired
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(MOCK_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Clear mock subscription state from localStorage */
function clearMockState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MOCK_STORAGE_KEY);
}

interface SubscriptionState {
  currentPlan: SubscriptionPlan;
  isPremium: boolean;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  error: string | null;
  billingCycle: BillingCycle | null;
  isMockActive: boolean;

  // Sync plan info from authenticated user object (read from POST /auth/refresh)
  syncFromUser: (user: User | null) => void;
  // Calls POST /subscriptions/checkout — returns the checkoutUrl
  checkout: (planType: Exclude<SubscriptionPlan, 'Free'>) => Promise<string>;
  // Mock Stripe checkout — fully local, persisted to localStorage
  mockCheckout: (planType: Exclude<SubscriptionPlan, 'Free'>, cycle: BillingCycle) => void;
  // Mock cancel — resets to Free plan locally, clears localStorage
  mockCancel: () => void;
  // Calls DELETE /subscriptions/cancel
  cancel: () => Promise<void>;
  clearError: () => void;
}

// Read initial state from localStorage (if a mock subscription exists)
const initialMock = loadMockState();

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  currentPlan: initialMock?.currentPlan ?? 'Free',
  isPremium: initialMock ? initialMock.currentPlan !== 'Free' : false,
  expiresAt: initialMock?.expiresAt ?? null,
  cancelAtPeriodEnd: false,
  isLoading: false,
  error: null,
  billingCycle: initialMock?.billingCycle ?? null,
  isMockActive: !!initialMock,

  syncFromUser: (user) => {
    // Skip sync if a mock checkout is active (preserves local subscription state)
    if (get().isMockActive) return;
    // Also check localStorage for persisted mock state (handles page refresh)
    const persisted = loadMockState();
    if (persisted) {
      set({
        currentPlan: persisted.currentPlan,
        isPremium: persisted.currentPlan !== 'Free',
        expiresAt: persisted.expiresAt,
        billingCycle: persisted.billingCycle,
        isMockActive: true,
      });
      return;
    }
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
    const expiresAt = expires.toISOString();
    // Persist to localStorage so it survives page refresh
    saveMockState({ currentPlan: planType, expiresAt, billingCycle: cycle });
    set({
      currentPlan: planType,
      isPremium: true,
      expiresAt,
      cancelAtPeriodEnd: false,
      billingCycle: cycle,
      isMockActive: true,
      isLoading: false,
      error: null,
    });
  },

  mockCancel: () => {
    // Clear persisted mock state
    clearMockState();
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

