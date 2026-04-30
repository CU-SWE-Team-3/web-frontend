'use client';
// component-id: PremiumAdBanner_001

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore';
import { ROUTES } from '@/shared/constants/routes';
import s from './PremiumAdBanner.module.scss';

/**
 * Floating "premium ad" toast — bottom-left of screen.
 * Only renders when user has NO active subscription (Free / null / undefined).
 * Disappears automatically for Go+, Artist, or Pro subscribers.
 */
export const PremiumAdBanner: React.FC = () => {
  const { currentPlan, isPremium } = useSubscriptionStore();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  // Slide-in after a short delay so it doesn't flash on page load
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Hide for any paid plan
  const isSubscribed =
    isPremium ||
    currentPlan === 'Go+' ||
    currentPlan === 'Artist' ||
    currentPlan === 'Pro';

  if (isSubscribed || dismissed) return null;

  return (
    <div
      className={`${s.banner} ${visible ? s.visible : ''}`}
      data-testid="premium-ad-banner"
      role="complementary"
      aria-label="Premium subscription ad"
    >
      {/* Dismiss button */}
      <button
        className={s.dismissBtn}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss ad"
        data-testid="premium-ad-dismiss"
      >
        ×
      </button>

      {/* Ad icon */}
      <div className={s.iconWrap}>
        <span className={s.icon}>📢</span>
      </div>

      {/* Ad text */}
      <p className={s.text}>
        I am an ad{' '}
        <Link
          href={ROUTES.GO_PLUS}
          className={s.subscribeLink}
          data-testid="premium-ad-subscribe-link"
        >
          subscribe
        </Link>{' '}
        to remove me
      </p>
    </div>
  );
};
