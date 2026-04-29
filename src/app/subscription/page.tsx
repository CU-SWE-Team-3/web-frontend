'use client';
// component-id: SubscriptionPage_001

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore';
import { NavBar } from '@/shared/ui/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import s from './SubscriptionPage.module.scss';

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const { syncFromUser, currentPlan, isPremium, expiresAt, cancelAtPeriodEnd, cancel, isLoading, error } =
    useSubscriptionStore();
  const [showBanner, setShowBanner] = useState(true);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    syncFromUser(user);
  }, [user, syncFromUser]);

  const handleCancel = async () => {
    try {
      await cancel();
      setCancelSuccess(true);
    } catch {
      // error is already set in the store
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPlanDisplay = () => {
    if (currentPlan === 'Pro') return 'Artist Pro';
    if (currentPlan === 'Go+') return 'Go+';
    return 'Basic';
  };

  return (
    <div className={s.page} data-testid="subscription-page">
      <NavBar />

      {/* ── Announcement Banner ── */}
      {showBanner && (
        <div className={s.banner} data-testid="subscription-banner">
          <div className={s.bannerContent}>
            <span className={s.bannerDot} />
            <p className={s.bannerText}>
              Uploading tracks just got way easier: upload, get heard, and get paid in one seamless
              experience.{' '}
              <Link href={ROUTES.ARTIST_PRO} data-testid="subscription-banner-link">
                Try it out!
              </Link>
            </p>
          </div>
          <button
            className={s.bannerClose}
            onClick={() => setShowBanner(false)}
            aria-label="Close banner"
            data-testid="subscription-banner-close"
          >
            ×
          </button>
        </div>
      )}

      <div className={s.content}>
        {/* ── Main Column ── */}
        <div className={s.mainCol}>
          <h1 className={s.pageTitle} data-testid="subscription-title">
            Subscriptions
          </h1>

          <h2 className={s.sectionSubtitle} data-testid="subscription-current-plans-title">
            Current plans
          </h2>

          {/* Error */}
          {error && (
            <div className={s.errorMsg} data-testid="subscription-error">
              {error}
            </div>
          )}

          {/* Cancel Success */}
          {cancelSuccess && (
            <div className={s.successMsg} data-testid="subscription-cancel-success">
              Subscription cancelled. You will retain premium access until your billing cycle ends.
            </div>
          )}

          {/* Plan Card */}
          <div className={s.planCard} data-testid="subscription-plan-card">
            <div className={s.planHeader}>
              <div>
                <h3 className={s.planName} data-testid="subscription-plan-name">
                  {getPlanDisplay()}
                </h3>
                {currentPlan === 'Free' && (
                  <p className={s.planDescription} data-testid="subscription-plan-description">
                    Artist Pro plans include unlimited upload space and advanced features.
                  </p>
                )}
                {isPremium && expiresAt && (
                  <p className={s.planBillingInfo} data-testid="subscription-billing-info">
                    {cancelAtPeriodEnd
                      ? `Access until ${formatDate(expiresAt)}`
                      : `Renews on ${formatDate(expiresAt)}`}
                  </p>
                )}
                {cancelAtPeriodEnd && (
                  <p className={s.planExpiryNote} data-testid="subscription-expiry-note">
                    Your subscription will expire on {formatDate(expiresAt)}. You still have premium
                    access until then.
                  </p>
                )}
              </div>

              {currentPlan === 'Free' ? (
                <Link
                  href={ROUTES.ARTIST_PRO}
                  className={s.tryProBtn}
                  data-testid="subscription-try-pro-btn"
                >
                  Try Artist Pro
                </Link>
              ) : (
                !cancelAtPeriodEnd && (
                  <button
                    className={s.cancelBtn}
                    onClick={handleCancel}
                    disabled={isLoading}
                    data-testid="subscription-cancel-btn"
                  >
                    {isLoading ? 'Cancelling...' : 'Cancel plan'}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Student Discount */}
          <div className={s.studentBanner} data-testid="subscription-student-banner">
            Are you a student?{' '}
            <Link href={ROUTES.ARTIST_PRO} data-testid="subscription-student-link">
              Get SoundCloud Go+ for 50% off
            </Link>
          </div>

          {/* Purchase History */}
          <h2 className={s.historyTitle} data-testid="subscription-history-title">
            Purchase history
          </h2>
          <p className={s.historyEmpty} data-testid="subscription-history-empty">
            No purchase history available.
          </p>
        </div>

        {/* ── Sidebar ── */}
        <aside className={s.sideCol} data-testid="subscription-sidebar">
          <h3 className={s.sideTitle}>Helpful links</h3>

          {isPremium && (
            <p className={s.changePaymentLink}>Change your credit card or payment details</p>
          )}

          <nav className={s.sideLinks}>
            <a href="#" className={s.sideLink} data-testid="subscription-sidebar-troubleshoot">
              Troubleshoot payment failures
            </a>
            <a href="#" className={s.sideLink} data-testid="subscription-sidebar-billing-help">
              General payments and billing help
            </a>
            <a href="#" className={s.sideLink} data-testid="subscription-sidebar-tax">
              Understand sales tax and VAT
            </a>
          </nav>

          <div className={s.sideLegalLinks}>
            {['Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager', 'Imprint', 'Artist Resources', 'Newsroom', 'Charts', 'Transparency Reports'].map(
              (label) => (
                <a key={label} href="#" className={s.sideLegalLink}>
                  {label}
                </a>
              )
            )}
          </div>

          <div className={s.sideLanguage}>
            Language:
            <select className={s.langSelect} defaultValue="en" data-testid="subscription-lang-select">
              <option value="en">English (US)</option>
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
}
