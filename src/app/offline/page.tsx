'use client';
// component-id: OfflinePage_001

import React, { useEffect } from 'react';
import Link from 'next/link';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { OfflineLibrary } from '@/features/subscription/ui/OfflineLibrary';
import { useOfflineStore } from '@/features/subscription/model/useOfflineStore';
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore';
import { ROUTES } from '@/shared/constants/routes';
import s from './OfflinePage.module.scss';

export default function OfflinePage() {
  const { hydrate } = useOfflineStore();
  const { currentPlan } = useSubscriptionStore();
  const isGoPlus = currentPlan === 'Go+';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className={s.page} data-testid="offline-page">
      <NavBar />

      <div className={s.content}>
        <div className={s.breadcrumb}>
          <Link href={ROUTES.SUBSCRIPTION} className={s.breadcrumbLink}>Subscription</Link>
          <span className={s.breadcrumbSep}>›</span>
          <span className={s.breadcrumbCurrent}>Offline Library</span>
        </div>

        <div className={s.pageHeader}>
          <div className={s.pageTitleRow}>
            <h1 className={s.pageTitle}>📥 Offline Library</h1>
            {isGoPlus && (
              <span className={s.goPlusBadge}>Go+</span>
            )}
          </div>
          <p className={s.pageSubtext}>
            {isGoPlus
              ? 'Your downloaded tracks for offline listening. Play them anywhere, even without a connection.'
              : 'Offline listening is a Go+ exclusive feature. Upgrade to download tracks and listen anywhere.'}
          </p>
        </div>

        {!isGoPlus ? (
          <div className={s.upsellCard} data-testid="offline-upsell">
            <div className={s.upsellIcon}>🎵</div>
            <h2 className={s.upsellTitle}>Unlock Offline Listening</h2>
            <p className={s.upsellText}>
              Get 3 months of Go+ for just $0.99 and download any track for offline listening.
              Ad-free, offline, all yours.
            </p>
            <Link href={`${ROUTES.PAYMENT}?plan=Go%2B`} className={s.upsellBtn} data-testid="offline-upgrade-btn">
              Get Go+ for $0.99
            </Link>
            <p className={s.upsellNote}>$9.99/month after 90 days. Cancel anytime.</p>
          </div>
        ) : (
          <OfflineLibrary />
        )}
      </div>
    </div>
  );
}
