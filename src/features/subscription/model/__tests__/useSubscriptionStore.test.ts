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
