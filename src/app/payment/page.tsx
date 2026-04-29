'use client';
// component-id: PaymentPage_001

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore';
import { ROUTES } from '@/shared/constants/routes';
import s from './PaymentPage.module.scss';

type BillingCycle = 'yearly' | 'monthly';
type PaymentMethod = 'applepay' | 'card' | 'paypal';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

const PRICES = {
  yearly: { total: 899.88, perMonth: 74.99 },
  monthly: { total: 149.99, perMonth: 149.99 },
};

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { checkout } = useSubscriptionStore();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('applepay');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const currentPricing = PRICES[billingCycle];

  const handleBuySubscription = useCallback(async () => {
    setStatus('processing');
    setError(null);

    try {
      // Call POST /subscriptions/checkout as defined in the YAML spec
      const checkoutUrl = await checkout('Pro');

      // Log the checkoutUrl (in a real integration we'd redirect to it)
      console.info('[PaymentPage] Checkout URL received:', checkoutUrl);

      // Simulate payment processing (mock flow — no real Stripe redirect)
      await new Promise((res) => setTimeout(res, 2000));

      setStatus('success');

      // Redirect to subscription page after success
      await new Promise((res) => setTimeout(res, 1200));
      router.push(ROUTES.SUBSCRIPTION);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(message);
      setStatus('error');
    }
  }, [checkout, router]);

  const getBuyBtnLabel = () => {
    if (status === 'processing') return 'Processing payment...';
    if (status === 'success') return 'Payment successful ✓';
    return 'Buy subscription';
  };

  const renewalDate = new Date();
  renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  const renewalStr = renewalDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={s.page} data-testid="payment-page">
      {/* ── Header ── */}
      <header className={s.header}>
        <Link href={ROUTES.FEED} className={s.logoLink} data-testid="payment-logo">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="#ff5500">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
          </svg>
        </Link>
        {user && (
          <div className={s.headerUser} data-testid="payment-user-info">
            <div className={s.userAvatar}>
              {user.avatarUrl && <img src={user.avatarUrl} alt={user.displayName} />}
            </div>
            <span>{user.displayName}</span>
            <span className={s.chevronIcon}>∨</span>
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <div className={s.content}>
        <h1 className={s.pageTitle} data-testid="payment-title">
          Get Artist Pro
        </h1>

        <div className={s.layout}>
          {/* ── Left Column ── */}
          <div className={s.leftCol}>
            {/* 1. Billing Cycle */}
            <h2 className={s.sectionTitle} data-testid="payment-billing-section">
              1. Billing cycle
            </h2>
            <div className={s.billingOptions}>
              <div
                className={`${s.billingOption} ${billingCycle === 'yearly' ? s.selected : ''}`}
                role="radio"
                aria-checked={billingCycle === 'yearly'}
                onClick={() => setBillingCycle('yearly')}
                data-testid="billing-yearly"
              >
                <div
                  className={`${s.billingRadio} ${billingCycle === 'yearly' ? s.checked : ''}`}
                />
                <div className={s.billingInfo}>
                  <div className={s.billingLabel}>Yearly billing</div>
                  <div className={s.billingPrice}>
                    EGP {PRICES.yearly.total.toFixed(2)}, that&apos;s EGP{' '}
                    {PRICES.yearly.perMonth.toFixed(2)}/month
                  </div>
                </div>
                <span className={s.discountBadge}>50% YEARLY DISCOUNT</span>
              </div>

              <div
                className={`${s.billingOption} ${billingCycle === 'monthly' ? s.selected : ''}`}
                role="radio"
                aria-checked={billingCycle === 'monthly'}
                onClick={() => setBillingCycle('monthly')}
                data-testid="billing-monthly"
              >
                <div
                  className={`${s.billingRadio} ${billingCycle === 'monthly' ? s.checked : ''}`}
                />
                <div className={s.billingInfo}>
                  <div className={s.billingLabel}>Monthly billing</div>
                  <div className={s.billingPrice}>
                    EGP {PRICES.monthly.perMonth.toFixed(2)}/month
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Details */}
            <h2 className={s.sectionTitle} data-testid="payment-method-section">
              2. Payment details <span className={s.lockIcon}>🔒</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>
              Add new payment methods
            </p>
            <div className={s.paymentOptions}>
              {/* Apple Pay */}
              <div
                className={`${s.paymentOption} ${paymentMethod === 'applepay' ? s.selected : ''}`}
                role="radio"
                aria-checked={paymentMethod === 'applepay'}
                onClick={() => setPaymentMethod('applepay')}
                data-testid="payment-applepay"
              >
                <div
                  className={`${s.billingRadio} ${paymentMethod === 'applepay' ? s.checked : ''}`}
                />
                <span className={s.paymentLabel}>Apple Pay</span>
                <span className={s.applePayLogo}>⬛ Pay</span>
              </div>

              {/* Card */}
              <div
                className={`${s.paymentOption} ${paymentMethod === 'card' ? s.selected : ''}`}
                role="radio"
                aria-checked={paymentMethod === 'card'}
                onClick={() => setPaymentMethod('card')}
                data-testid="payment-card"
              >
                <div
                  className={`${s.billingRadio} ${paymentMethod === 'card' ? s.checked : ''}`}
                />
                <span className={s.paymentLabel}>Card</span>
                <div className={s.cardIcons}>
                  <div className={`${s.cardIcon} ${s.visa}`}>VISA</div>
                  <div className={`${s.cardIcon} ${s.amex}`}>AMEX</div>
                  <div className={`${s.cardIcon} ${s.maestro}`}>MC</div>
                  <div className={`${s.cardIcon} ${s.jcb}`}>JCB</div>
                  <div className={`${s.cardIcon} ${s.discover}`}>DC</div>
                </div>
              </div>

              {/* PayPal */}
              <div
                className={`${s.paymentOption} ${paymentMethod === 'paypal' ? s.selected : ''}`}
                role="radio"
                aria-checked={paymentMethod === 'paypal'}
                onClick={() => setPaymentMethod('paypal')}
                data-testid="payment-paypal"
              >
                <div
                  className={`${s.billingRadio} ${paymentMethod === 'paypal' ? s.checked : ''}`}
                />
                <span className={s.paymentLabel}>PayPal</span>
                <span className={s.paypalLogo}>PayPal</span>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className={s.rightCol}>
            {/* 3. Review Purchase */}
            <div className={s.reviewSection} data-testid="payment-review">
              <h2 className={s.reviewTitle}>3. Review your purchase</h2>

              <div className={s.reviewProductRow}>
                <div className={s.reviewProductIcon}>
                  <svg width="20" height="20" viewBox="0 0 32 32">
                    <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
                  </svg>
                </div>
                <span className={s.reviewProductName}>Artist Pro</span>
              </div>

              <span className={s.couponLink}>Do you have a coupon code?</span>

              <div className={s.reviewDivider} />

              <div className={s.reviewRow}>
                <span className={s.reviewLabel}>Total</span>
                <span className={s.reviewValue} data-testid="payment-total">
                  EGP {currentPricing.total.toFixed(2)}
                </span>
              </div>
              <div className={s.reviewRow}>
                <span className={s.reviewBillingLabel}>Billing cycle</span>
                <span className={s.reviewBillingValue}>
                  {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                </span>
              </div>

              <p className={s.reviewNote}>
                Subscription will automatically renew at EGP{' '}
                {currentPricing.total.toFixed(2)} every{' '}
                {billingCycle === 'yearly' ? 'year' : 'month'}, starting {renewalStr}, unless
                you cancel before the day of your next renewal in your subscription settings.
              </p>
              <p className={s.reviewCurrency}>All prices in EGP</p>
            </div>

            {/* Error */}
            {error && status === 'error' && (
              <div className={s.errorMsg} data-testid="payment-error">
                {error}
              </div>
            )}

            {/* Buy Button */}
            <button
              id="payment-buy-btn"
              data-testid="payment-buy-btn"
              className={`${s.buyBtn} ${status === 'processing' ? s.processing : ''} ${status === 'success' ? s.success : ''}`}
              onClick={handleBuySubscription}
              disabled={status === 'processing' || status === 'success'}
            >
              {getBuyBtnLabel()}
            </button>

            <p className={s.legalNote}>
              By submitting your payment information and clicking &apos;Buy subscription&apos; you
              agree to the{' '}
              <a href="#">Terms of Use for Artist Subscriptions</a> and{' '}
              <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className={s.footer} data-testid="payment-footer">
        <div className={s.footerSignIn}>
          Signed in as {user?.displayName ?? 'User'}.{' '}
          <Link href={ROUTES.LOGIN} data-testid="payment-footer-signout">
            Sign out
          </Link>
        </div>
        <div className={s.footerLinks}>
          {['Legal', 'Privacy', 'Cookies', 'Consent Manager', 'Imprint', 'Help Center'].map(
            (label) => (
              <span key={label} className={s.footerLink}>
                {label}
              </span>
            )
          )}
        </div>
      </footer>
    </div>
  );
}
