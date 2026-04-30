'use client';
// component-id: PremiumAdBanner_001

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Megaphone } from 'lucide-react';
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore';
import { ROUTES } from '@/shared/constants/routes';
import s from './PremiumAdBanner.module.scss';

/**
 * Floating premium ad toast shown to users without an active subscription.
 */
export const PremiumAdBanner: React.FC = () => {
  const { currentPlan, isPremium } = useSubscriptionStore();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

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
      <button
        className={s.dismissBtn}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss ad"
        data-testid="premium-ad-dismiss"
      >
        &times;
      </button>

      <div className={s.iconWrap}>
        <Megaphone className={s.icon} size={18} aria-hidden="true" />
      </div>

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
