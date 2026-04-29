// component-id: SubscriptionApi_001

import apiClient from '@/shared/api/client';
import type { CheckoutResponse, CancelResponse, SubscriptionPlan } from '../types';

/**
 * POST /subscriptions/checkout
 * Creates a Stripe checkout session for the selected plan.
 * Returns checkoutUrl to redirect the user to complete payment.
 */
export async function createCheckoutSession(
  planType: Exclude<SubscriptionPlan, 'Free'>
): Promise<CheckoutResponse> {
  try {
    const response = await apiClient.post<CheckoutResponse>('/subscriptions/checkout', {
      planType,
    });
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message ?? 'Failed to create checkout session.';
    console.error('[subscriptionApi] createCheckoutSession error:', message);
    throw new Error(message);
  }
}

/**
 * DELETE /subscriptions/cancel
 * Marks the user's subscription as cancelAtPeriodEnd: true.
 * User retains premium access until subscriptionExpiresAt.
 */
export async function cancelSubscription(): Promise<CancelResponse> {
  try {
    const response = await apiClient.delete<CancelResponse>('/subscriptions/cancel');
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const message =
      axiosError?.response?.data?.message ?? 'Failed to cancel subscription.';
    console.error('[subscriptionApi] cancelSubscription error:', message);
    throw new Error(message);
  }
}
