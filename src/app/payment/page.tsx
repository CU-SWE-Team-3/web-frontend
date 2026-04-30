'use client';
// component-id: PaymentPage_001

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore';
import { PLAN_PRICING } from '@/features/subscription/types';
import { ROUTES } from '@/shared/constants/routes';
import s from './PaymentPage.module.scss';

type BillingCycle = 'yearly' | 'monthly';
type PaymentMethod = 'stripe' | 'applepay';
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';
type SelectedPlan = 'Artist' | 'Pro' | 'Go+';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const { checkout, mockCheckout } = useSubscriptionStore();

  // Profile dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    router.push(ROUTES.LOGIN);
  };

  // Determine selected plan from query param
  const planParam = searchParams.get('plan');
  const selectedPlan: SelectedPlan =
    planParam === 'Artist' ? 'Artist' : planParam === 'Go+' ? 'Go+' : 'Pro';

  const isGoPlus = selectedPlan === 'Go+';
  const pricing = isGoPlus ? PLAN_PRICING['Go+'] : selectedPlan === 'Artist' ? PLAN_PRICING.Artist : PLAN_PRICING.Pro;

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Mock Stripe card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const getPriceForCycle = () => {
    if (isGoPlus) return { total: 0.99, perMonth: 0.33 };
    if (billingCycle === 'yearly') return { total: pricing.yearlyTotal, perMonth: pricing.yearly };
    return { total: pricing.monthly, perMonth: pricing.monthly };
  };

  const currentPricing = getPriceForCycle();

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isStripeFormValid = () => {
    const digits = cardNumber.replace(/\D/g, '');
    const expiryDigits = cardExpiry.replace(/\D/g, '');
    return digits.length === 16 && expiryDigits.length === 4 && cardCvc.length >= 3 && cardName.trim().length > 0;
  };

  const handleBuySubscription = useCallback(async () => {
    if (selectedPlan === 'Artist' && paymentMethod === 'stripe' && !isStripeFormValid()) {
      setError('Please fill in all card details correctly.');
      return;
    }
    setStatus('processing');
    setError(null);
    try {
      if (selectedPlan === 'Artist') {
        // The current backend contract only supports Pro and Go+ checkout.
        // Keep Artist as a local demo tier until the API exposes it.
        await new Promise((res) => setTimeout(res, 800));
        mockCheckout('Artist', billingCycle);
        setStatus('success');
        await new Promise((res) => setTimeout(res, 800));
        router.push(ROUTES.SUBSCRIPTION);
      } else {
        const checkoutUrl = await checkout(isGoPlus ? 'Go+' : 'Pro');
        window.location.assign(checkoutUrl);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(message);
      setStatus('error');
    }
  }, [paymentMethod, selectedPlan, billingCycle, checkout, mockCheckout, router, isGoPlus, cardNumber, cardExpiry, cardCvc, cardName]);

  const getBuyBtnLabel = () => {
    if (status === 'processing') return 'Processing payment...';
    if (status === 'success') return '✓ Payment Successful';
    if (isGoPlus) return 'Get 3 months for $0.99';
    return 'Buy subscription';
  };

  const renewalDate = new Date();
  if (isGoPlus) {
    renewalDate.setMonth(renewalDate.getMonth() + 3);
  } else if (billingCycle === 'yearly') {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  }
  const renewalStr = renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={s.page} data-testid="payment-page">
      {/* ── Header ── */}
      <header className={s.header}>
        <Link href={ROUTES.HOME} className={s.logoLink} data-testid="payment-logo">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="#ff5500">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
          </svg>
          <span className={s.brandText}>BioBeats</span>
        </Link>

        {user && (
          <div ref={dropdownRef} className={s.profileWrapper} data-testid="payment-user-info">
            <button
              className={s.profileBtn}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              data-testid="payment-profile-btn"
            >
              <div className={s.userAvatar}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.displayName} />
                  : <span className={s.avatarInitial}>{user.displayName?.[0]?.toUpperCase()}</span>
                }
              </div>
              <span className={s.profileName}>{user.displayName}</span>
              <span className={s.chevronIcon}>▾</span>
            </button>
            {dropdownOpen && (
              <div className={s.profileDropdown} data-testid="payment-profile-dropdown">
                <button
                  className={s.profileDropdownItem}
                  onClick={handleSignOut}
                  data-testid="payment-signout-btn"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Success Banner ── */}
      {status === 'success' && (
        <div className={s.successBanner} data-testid="payment-success-banner">
          <div className={s.successIcon}>✓</div>
          <div>
            <p className={s.successTitle}>Payment Successful!</p>
            <p className={s.successSubtext}>Redirecting you to your subscriptions...</p>
          </div>
        </div>
      )}

      {/* ── Go+ Promo Banner ── */}
      {isGoPlus && (
        <div className={s.goplusPromoBanner} data-testid="payment-goplus-promo">
          <span className={s.goplusPromoText}>🎵 Special offer: Get 3 months of Go+ for just <strong>$0.99</strong></span>
        </div>
      )}

      {/* ── Content ── */}
      <div className={s.content}>
        <h1 className={s.pageTitle} data-testid="payment-title">
          Get {pricing.label}
        </h1>

        <div className={s.layout}>
          {/* ── Left Column ── */}
          <div className={s.leftCol}>
            {/* Billing Cycle — hidden for Go+ (fixed 3-month offer) */}
            {!isGoPlus && (
              <>
                <h2 className={s.sectionTitle} data-testid="payment-billing-section">1. Billing cycle</h2>
                <div className={s.billingOptions}>
                  <div
                    className={`${s.billingOption} ${billingCycle === 'yearly' ? s.selected : ''}`}
                    role="radio"
                    aria-checked={billingCycle === 'yearly'}
                    onClick={() => setBillingCycle('yearly')}
                    data-testid="billing-yearly"
                  >
                    <div className={`${s.billingRadio} ${billingCycle === 'yearly' ? s.checked : ''}`} />
                    <div className={s.billingInfo}>
                      <div className={s.billingLabel}>Yearly billing</div>
                      <div className={s.billingPrice}>
                        EGP {pricing.yearlyTotal.toFixed(2)}, that&apos;s EGP {pricing.yearly.toFixed(2)}/month
                      </div>
                    </div>
                    {selectedPlan === 'Pro' && <span className={s.discountBadge}>BEST VALUE</span>}
                  </div>
                  <div
                    className={`${s.billingOption} ${billingCycle === 'monthly' ? s.selected : ''}`}
                    role="radio"
                    aria-checked={billingCycle === 'monthly'}
                    onClick={() => setBillingCycle('monthly')}
                    data-testid="billing-monthly"
                  >
                    <div className={`${s.billingRadio} ${billingCycle === 'monthly' ? s.checked : ''}`} />
                    <div className={s.billingInfo}>
                      <div className={s.billingLabel}>Monthly billing</div>
                      <div className={s.billingPrice}>EGP {pricing.monthly.toFixed(2)}/month</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Payment Details */}
            <h2 className={s.sectionTitle} data-testid="payment-method-section">
              {isGoPlus ? '1.' : '2.'} Payment details <span className={s.lockIcon}>🔒</span>
            </h2>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>Select your payment method</p>
            <div className={s.paymentOptions}>
              {/* Stripe */}
              <div
                className={`${s.paymentOption} ${paymentMethod === 'stripe' ? s.selected : ''}`}
                role="radio"
                aria-checked={paymentMethod === 'stripe'}
                onClick={() => setPaymentMethod('stripe')}
                data-testid="payment-stripe"
              >
                <div className={`${s.billingRadio} ${paymentMethod === 'stripe' ? s.checked : ''}`} />
                <span className={s.paymentLabel}>Stripe</span>
                <div className={s.stripeLogoWrap}>
                  <span className={s.stripeLogo}>stripe</span>
                  <div className={s.cardIcons}>
                    <div className={`${s.cardIcon} ${s.visa}`}>VISA</div>
                    <div className={`${s.cardIcon} ${s.amex}`}>AMEX</div>
                    <div className={`${s.cardIcon} ${s.maestro}`}>MC</div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'stripe' && (
                <div className={s.stripeForm} data-testid="stripe-form">
                  <div className={s.stripeFormRow}>
                    <label className={s.stripeLabel}>
                      Card number
                      <input type="text" className={s.stripeInput} placeholder="4242 4242 4242 4242"
                        value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        data-testid="stripe-card-number" maxLength={19} />
                    </label>
                  </div>
                  <div className={s.stripeFormRowSplit}>
                    <label className={s.stripeLabel}>
                      Expiry date
                      <input type="text" className={s.stripeInput} placeholder="MM/YY"
                        value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        data-testid="stripe-card-expiry" maxLength={5} />
                    </label>
                    <label className={s.stripeLabel}>
                      CVC
                      <input type="text" className={s.stripeInput} placeholder="123"
                        value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        data-testid="stripe-card-cvc" maxLength={4} />
                    </label>
                  </div>
                  <div className={s.stripeFormRow}>
                    <label className={s.stripeLabel}>
                      Name on card
                      <input type="text" className={s.stripeInput} placeholder="John Doe"
                        value={cardName} onChange={(e) => setCardName(e.target.value)}
                        data-testid="stripe-card-name" />
                    </label>
                  </div>
                  <p className={s.stripeSecure}>
                    <span className={s.stripeLockIcon}>🔒</span>
                    Your payment info is encrypted and secure via Stripe
                  </p>
                </div>
              )}

              {/* Apple Pay */}
              <div
                className={`${s.paymentOption} ${paymentMethod === 'applepay' ? s.selected : ''}`}
                role="radio"
                aria-checked={paymentMethod === 'applepay'}
                onClick={() => setPaymentMethod('applepay')}
                data-testid="payment-applepay"
              >
                <div className={`${s.billingRadio} ${paymentMethod === 'applepay' ? s.checked : ''}`} />
                <span className={s.paymentLabel}>Apple Pay</span>
                <span className={s.applePayLogo}>⬛ Pay</span>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className={s.rightCol}>
            <div className={s.reviewSection} data-testid="payment-review">
              <h2 className={s.reviewTitle}>{isGoPlus ? '2.' : '3.'} Review your purchase</h2>
              <div className={s.reviewProductRow}>
                <div className={s.reviewProductIcon}>
                  <svg width="20" height="20" viewBox="0 0 32 32">
                    <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
                  </svg>
                </div>
                <span className={s.reviewProductName}>{pricing.label}</span>
              </div>
              <span className={s.couponLink}>Do you have a coupon code?</span>
              <div className={s.reviewDivider} />
              <div className={s.reviewRow}>
                <span className={s.reviewLabel}>Total</span>
                <span className={s.reviewValue} data-testid="payment-total">
                  {isGoPlus ? `$${currentPricing.total.toFixed(2)}` : `EGP ${currentPricing.total.toFixed(2)}`}
                </span>
              </div>
              <div className={s.reviewRow}>
                <span className={s.reviewBillingLabel}>Billing cycle</span>
                <span className={s.reviewBillingValue}>
                  {isGoPlus ? '3-month promo' : billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
                </span>
              </div>
              {isGoPlus && (
                <div className={s.reviewRow}>
                  <span className={s.reviewBillingLabel}>After promo ends</span>
                  <span className={s.reviewBillingValue}>$9.99/month</span>
                </div>
              )}
              <p className={s.reviewNote}>
                {isGoPlus
                  ? `Your Go+ trial starts today. After 90 days, you will be billed $9.99/month starting ${renewalStr}, unless you cancel.`
                  : `Subscription will automatically renew at ${isGoPlus ? '$' : 'EGP '}${currentPricing.total.toFixed(2)} every ${billingCycle === 'yearly' ? 'year' : 'month'}, starting ${renewalStr}, unless you cancel.`
                }
              </p>
              <p className={s.reviewCurrency}>{isGoPlus ? 'Price in USD' : 'All prices in EGP'}</p>
            </div>

            {error && status === 'error' && (
              <div className={s.errorMsg} data-testid="payment-error">{error}</div>
            )}
            {error && status === 'idle' && (
              <div className={s.errorMsg} data-testid="payment-validation-error">{error}</div>
            )}

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
              By submitting your payment information and clicking &apos;{isGoPlus ? 'Get 3 months for $0.99' : 'Buy subscription'}&apos; you agree to the{' '}
              <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className={s.footer} data-testid="payment-footer">
        <div className={s.footerSignIn}>
          Signed in as {user?.displayName ?? 'User'}.{' '}
          <button className={s.footerSignOutLink} onClick={handleSignOut} data-testid="payment-footer-signout">
            Sign out
          </button>
        </div>
        <div className={s.footerLinks}>
          {['Legal', 'Privacy', 'Cookies', 'Consent Manager', 'Imprint', 'Help Center'].map((label) => (
            <span key={label} className={s.footerLink}>{label}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
