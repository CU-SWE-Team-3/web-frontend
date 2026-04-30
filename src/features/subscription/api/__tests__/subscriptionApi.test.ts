// component-id: SubscriptionApiTests_001

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCheckoutSession, cancelSubscription } from '../subscriptionApi';

// Mock the API client
vi.mock('@/shared/api/client', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '@/shared/api/client';

describe('subscriptionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('calls POST /subscriptions/checkout with the correct planType', async () => {
      const mockResponse = {
        data: {
          success: true,
          checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_abc123',
        },
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const result = await createCheckoutSession('Pro');

      expect(apiClient.post).toHaveBeenCalledWith('/subscriptions/checkout', {
        planType: 'Pro',
      });
      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/c/pay/cs_test_abc123');
    });

    it('calls POST /subscriptions/checkout for Go+ plan', async () => {
      const mockResponse = {
        data: {
          success: true,
          checkoutUrl: 'https://checkout.stripe.com/c/pay/cs_test_goplus',
        },
      };
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      await createCheckoutSession('Go+');

      expect(apiClient.post).toHaveBeenCalledWith('/subscriptions/checkout', {
        planType: 'Go+',
      });
    });

    it('throws with server error message when already subscribed (400)', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: {
          data: { message: 'You are already an active premium subscriber.' },
        },
      });

      await expect(createCheckoutSession('Pro')).rejects.toThrow(
        'You are already an active premium subscriber.'
      );
    });

    it('throws with fallback message on network error', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network Error'));

      await expect(createCheckoutSession('Pro')).rejects.toThrow(
        'Failed to create checkout session.'
      );
    });
  });

  describe('cancelSubscription', () => {
    it('calls DELETE /subscriptions/cancel', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            message: 'Subscription cancelled. You will retain premium access until your billing cycle ends.',
            expiresAt: '2026-05-25T00:00:00.000Z',
          },
        },
      };
      vi.mocked(apiClient.delete).mockResolvedValueOnce(mockResponse);

      const result = await cancelSubscription();

      expect(apiClient.delete).toHaveBeenCalledWith('/subscriptions/cancel');
      expect(result.success).toBe(true);
      expect(result.data.expiresAt).toBe('2026-05-25T00:00:00.000Z');
    });

    it('throws with server error message when no active subscription', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce({
        response: {
          data: { message: 'You do not have an active subscription.' },
        },
      });

      await expect(cancelSubscription()).rejects.toThrow(
        'You do not have an active subscription.'
      );
    });

    it('throws with fallback message on unknown error', async () => {
      vi.mocked(apiClient.delete).mockRejectedValueOnce(new Error('Network Error'));

      await expect(cancelSubscription()).rejects.toThrow('Failed to cancel subscription.');
    });
  });
});
