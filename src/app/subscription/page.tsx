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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    syncFromUser(user);
  }, [user, syncFromUser]);

  const handleCancel = () => {
    // Show confirmation step first
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    try {
      await cancel();
      setShowCancelConfirm(false);
      setCancelSuccess(true);
    } catch {
      setShowCancelConfirm(false);
    }
  };

  const handleDismissCancel = () => {
    setShowCancelConfirm(false);
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
    if (currentPlan === 'Artist') return 'Artist';
    if (currentPlan === 'Pro') return 'Artist Pro';
    if (currentPlan === 'Go+') return 'Go+';
    return 'Basic';
  };

  return (
    <div className={s.page} data-testid="subscription-page">
      <NavBar />

      {/* ── Announcement Banner ── */}
      {showBanner && !isPremium && (
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
              Your plan has been cancelled. You keep premium access until the billing period ends.
            </div>
          )}

          {/* Cancel Confirmation Dialog */}
          {showCancelConfirm && (
            <div className={s.cancelConfirmCard} data-testid="subscription-cancel-confirm">
              <p className={s.cancelConfirmText}>
                Are you sure you want to cancel your plan? You will keep premium access until the billing period ends.
              </p>
              <div className={s.cancelConfirmActions}>
                <button
                  className={s.cancelConfirmYes}
                  onClick={handleConfirmCancel}
                  disabled={isLoading}
                  data-testid="subscription-cancel-confirm-yes"
                >
                  {isLoading ? 'Cancelling...' : 'Yes, cancel plan'}
                </button>
                <button
                  className={s.cancelConfirmNo}
                  onClick={handleDismissCancel}
                  data-testid="subscription-cancel-confirm-no"
                >
                  Keep my plan
                </button>
              </div>
            </div>
          )}

          {/* Plan Card */}
          <div className={s.planCard} data-testid="subscription-plan-card">
            <div className={s.planHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 className={s.planName} data-testid="subscription-plan-name">
                    {getPlanDisplay()}
                  </h3>
                  {isPremium && (
                    <span className={s.activeBadge} data-testid="subscription-active-badge">
                      ACTIVE
                    </span>
                  )}
                </div>
                {currentPlan === 'Free' && (
                  <p className={s.planDescription} data-testid="subscription-plan-description">
                    Artist Pro plans include unlimited upload space and advanced features.
                  </p>
                )}
                {isPremium && !cancelAtPeriodEnd && (
                  <p className={s.planDescription} data-testid="subscription-plan-active-desc">
                    You&apos;re currently subscribed to the {getPlanDisplay()} plan. Enjoy all premium features!
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
                    disabled={showCancelConfirm || isLoading}
                    data-testid="subscription-cancel-btn"
                  >
                    Cancel plan
                  </button>
                )
              )}
            </div>
          </div>

          {/* Go+ Offline Library shortcut */}
          {currentPlan === 'Go+' && (
            <Link
              href={ROUTES.OFFLINE}
              className={s.offlineCard}
              data-testid="subscription-offline-card"
            >
              <span className={s.offlineCardIcon}>📥</span>
              <div>
                <p className={s.offlineCardTitle}>Offline Library</p>
                <p className={s.offlineCardDesc}>Access your downloaded tracks for listening anywhere.</p>
              </div>
              <span className={s.offlineCardArrow}>›</span>
            </Link>
          )}

          {/* Student Discount / Go+ Promo */}
          {currentPlan !== 'Go+' && (
            <div className={s.studentBanner} data-testid="subscription-student-banner">
              Discover ad-free &amp; offline listening.{' '}
              <Link href={ROUTES.GO_PLUS} data-testid="subscription-student-link">
                Get BioBeats Go+ for $0.99 →
              </Link>
            </div>
          )}

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
