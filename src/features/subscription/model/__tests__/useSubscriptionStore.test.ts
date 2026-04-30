// component-id: UseSubscriptionStoreTests_001

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../useSubscriptionStore';

// Mock the API functions
vi.mock('../../api/subscriptionApi', () => ({
  createCheckoutSession: vi.fn(),
  cancelSubscription: vi.fn(),
}));

import { createCheckoutSession, cancelSubscription } from '../../api/subscriptionApi';

describe('useSubscriptionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useSubscriptionStore.setState({
      currentPlan: 'Free',
      isPremium: false,
      expiresAt: null,
      cancelAtPeriodEnd: false,
      isLoading: false,
      error: null,
      billingCycle: null,
      isMockActive: false,
    });
  });

  describe('syncFromUser', () => {
    it('resets to Free plan when user is null', () => {
      useSubscriptionStore.getState().syncFromUser(null);
      const state = useSubscriptionStore.getState();
      expect(state.currentPlan).toBe('Free');
      expect(state.isPremium).toBe(false);
      expect(state.expiresAt).toBeNull();
    });

    it('syncs Pro plan from user object', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'Artist' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
        isPremium: true,
        subscriptionPlan: 'Pro' as const,
        subscriptionExpiresAt: '2026-05-25T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      };

      useSubscriptionStore.getState().syncFromUser(mockUser);
      const state = useSubscriptionStore.getState();

      expect(state.currentPlan).toBe('Pro');
      expect(state.isPremium).toBe(true);
      expect(state.expiresAt).toBe('2026-05-25T00:00:00.000Z');
      expect(state.cancelAtPeriodEnd).toBe(false);
    });

    it('syncs cancelAtPeriodEnd flag from user', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'Artist' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
        isPremium: true,
        subscriptionPlan: 'Pro' as const,
        subscriptionExpiresAt: '2026-05-25T00:00:00.000Z',
        cancelAtPeriodEnd: true,
      };

      useSubscriptionStore.getState().syncFromUser(mockUser);
      expect(useSubscriptionStore.getState().cancelAtPeriodEnd).toBe(true);
    });

    it('defaults to Free plan when subscriptionPlan is undefined', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'Listener' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
      };

      useSubscriptionStore.getState().syncFromUser(mockUser);
      expect(useSubscriptionStore.getState().currentPlan).toBe('Free');
    });
  });

  describe('checkout', () => {
    it('calls createCheckoutSession and returns the checkoutUrl', async () => {
      vi.mocked(createCheckoutSession).mockResolvedValueOnce({
        success: true,
        checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_abc123',
      });

      const url = await useSubscriptionStore.getState().checkout('Pro');

      expect(createCheckoutSession).toHaveBeenCalledWith('Pro');
      expect(url).toBe('https://checkout.stripe.com/c/pay/cs_test_abc123');
      expect(useSubscriptionStore.getState().isLoading).toBe(false);
    });

    it('sets error state on checkout failure', async () => {
      vi.mocked(createCheckoutSession).mockRejectedValueOnce(
        new Error('You are already an active premium subscriber.')
      );

      await expect(useSubscriptionStore.getState().checkout('Pro')).rejects.toThrow(
        'You are already an active premium subscriber.'
      );

      const state = useSubscriptionStore.getState();
      expect(state.error).toBe('You are already an active premium subscriber.');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('mockCheckout', () => {
    it('sets the store to a Pro plan with yearly billing', () => {
      useSubscriptionStore.getState().mockCheckout('Pro', 'yearly');
      const state = useSubscriptionStore.getState();

      expect(state.currentPlan).toBe('Pro');
      expect(state.isPremium).toBe(true);
      expect(state.billingCycle).toBe('yearly');
      expect(state.cancelAtPeriodEnd).toBe(false);
      expect(state.expiresAt).toBeTruthy();
      expect(state.error).toBeNull();
    });

    it('sets the store to an Artist plan with monthly billing', () => {
      useSubscriptionStore.getState().mockCheckout('Artist', 'monthly');
      const state = useSubscriptionStore.getState();

      expect(state.currentPlan).toBe('Artist');
      expect(state.isPremium).toBe(true);
      expect(state.billingCycle).toBe('monthly');
      expect(state.expiresAt).toBeTruthy();
    });

    it('sets expiresAt to roughly one year from now for yearly billing', () => {
      const beforeCall = new Date();
      useSubscriptionStore.getState().mockCheckout('Pro', 'yearly');
      const state = useSubscriptionStore.getState();

      const expires = new Date(state.expiresAt!);
      const expectedYear = beforeCall.getFullYear() + 1;
      expect(expires.getFullYear()).toBe(expectedYear);
    });

    it('sets expiresAt to roughly one month from now for monthly billing', () => {
      const beforeCall = new Date();
      useSubscriptionStore.getState().mockCheckout('Pro', 'monthly');
      const state = useSubscriptionStore.getState();

      const expires = new Date(state.expiresAt!);
      const expectedMonth = (beforeCall.getMonth() + 1) % 12;
      expect(expires.getMonth()).toBe(expectedMonth);
    });

    it('sets isMockActive to true', () => {
      useSubscriptionStore.getState().mockCheckout('Pro', 'yearly');
      expect(useSubscriptionStore.getState().isMockActive).toBe(true);
    });

    it('prevents syncFromUser from overwriting mock checkout state', () => {
      // First, do a mock checkout
      useSubscriptionStore.getState().mockCheckout('Pro', 'yearly');
      expect(useSubscriptionStore.getState().currentPlan).toBe('Pro');

      // Now try to sync from a Free user — should be skipped
      const freeUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'Listener' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      useSubscriptionStore.getState().syncFromUser(freeUser);

      // Plan should still be Pro, not Free
      expect(useSubscriptionStore.getState().currentPlan).toBe('Pro');
      expect(useSubscriptionStore.getState().isPremium).toBe(true);
    });
  });

  describe('mockCancel', () => {
    it('resets all state to Free/Basic', () => {
      // Set up a subscribed state first
      useSubscriptionStore.getState().mockCheckout('Pro', 'yearly');
      expect(useSubscriptionStore.getState().isPremium).toBe(true);

      // Now cancel
      useSubscriptionStore.getState().mockCancel();
      const state = useSubscriptionStore.getState();

      expect(state.currentPlan).toBe('Free');
      expect(state.isPremium).toBe(false);
      expect(state.expiresAt).toBeNull();
      expect(state.cancelAtPeriodEnd).toBe(false);
      expect(state.billingCycle).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('clears isMockActive so syncFromUser resumes normally', () => {
      useSubscriptionStore.getState().mockCheckout('Artist', 'monthly');
      expect(useSubscriptionStore.getState().isMockActive).toBe(true);

      useSubscriptionStore.getState().mockCancel();
      expect(useSubscriptionStore.getState().isMockActive).toBe(false);
    });

    it('allows syncFromUser to work again after mockCancel', () => {
      // Subscribe then cancel
      useSubscriptionStore.getState().mockCheckout('Pro', 'yearly');
      useSubscriptionStore.getState().mockCancel();

      // Now syncFromUser should work normally
      const premiumUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'Artist' as const,
        createdAt: '2026-01-01T00:00:00.000Z',
        isPremium: true,
        subscriptionPlan: 'Pro' as const,
        subscriptionExpiresAt: '2027-01-01T00:00:00.000Z',
        cancelAtPeriodEnd: false,
      };
      useSubscriptionStore.getState().syncFromUser(premiumUser);
      expect(useSubscriptionStore.getState().currentPlan).toBe('Pro');
    });
  });

  describe('cancel', () => {
    it('calls cancelSubscription and sets cancelAtPeriodEnd to true', async () => {
      vi.mocked(cancelSubscription).mockResolvedValueOnce({
        success: true,
        data: {
          message: 'Subscription cancelled.',
          expiresAt: '2026-05-25T00:00:00.000Z',
        },
      });

      await useSubscriptionStore.getState().cancel();

      const state = useSubscriptionStore.getState();
      expect(cancelSubscription).toHaveBeenCalled();
      expect(state.cancelAtPeriodEnd).toBe(true);
      expect(state.expiresAt).toBe('2026-05-25T00:00:00.000Z');
      expect(state.isLoading).toBe(false);
    });

    it('sets error on cancellation failure', async () => {
      vi.mocked(cancelSubscription).mockRejectedValueOnce(
        new Error('You do not have an active subscription.')
      );

      await expect(useSubscriptionStore.getState().cancel()).rejects.toThrow(
        'You do not have an active subscription.'
      );

      expect(useSubscriptionStore.getState().error).toBe('You do not have an active subscription.');
    });
  });

  describe('clearError', () => {
    it('clears the error state', () => {
      useSubscriptionStore.setState({ error: 'Some error' });
      useSubscriptionStore.getState().clearError();
      expect(useSubscriptionStore.getState().error).toBeNull();
    });
  });
});
