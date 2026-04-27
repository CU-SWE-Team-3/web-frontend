'use client'

import { useState, type FC } from 'react'
import { Check, Minus } from 'lucide-react'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { useSubscriptionStore } from '../../model/useSubscriptionStore'
import { PLAN_FEATURES, PLAN_PRICES } from '../../model/subscriptionTypes'
import type { SubscriptionPlan } from '../../model/subscriptionTypes'
import s from './PricingPage.module.scss'

const componentId = 'subscription-pricing-page'

interface PricingPageProps {
  onOpenCheckout?: () => void
}

export const PricingPage: FC<PricingPageProps> = ({ onOpenCheckout }) => {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const user = useAuthStore((state) => state.user)
  const { currentPlan, openCheckout } = useSubscriptionStore()

  const currentUserPlan: SubscriptionPlan = currentPlan || (user as any)?.subscriptionPlan || 'Free'

  const handleGetPro = () => {
    if (onOpenCheckout) {
      onOpenCheckout()
    } else {
      openCheckout()
    }
  }

  const proPrice = billing === 'yearly'
    ? PLAN_PRICES.Pro.yearly
    : PLAN_PRICES.Pro.monthly

  const freeFeatures = [
    'Upload up to 3 tracks',
    'Basic track statistics',
    'Share & embed tracks',
    'Community access',
  ]

  const proFeatures = [
    'Unlimited uploads',
    'Offline listening (download)',
    'Scheduled releases',
    'Full analytics & insights',
    'Priority support',
    'Pro badge on profile',
  ]

  return (
    <div className={s.pricingPage} data-testid={componentId} id={componentId}>
      {/* Header */}
      <div className={s.header}>
        <h1 className={s.title}>Choose your plan</h1>
        <p className={s.subtitle}>
          Unlock your full potential on BioBeats. Upload more, reach further, and sound better with Pro.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className={s.billingToggle}>
        <button
          className={billing === 'monthly' ? s.billingOptionActive : s.billingOption}
          onClick={() => setBilling('monthly')}
          data-testid={`${componentId}-billing-monthly`}
        >
          Monthly
        </button>
        <button
          className={billing === 'yearly' ? s.billingOptionActive : s.billingOption}
          onClick={() => setBilling('yearly')}
          data-testid={`${componentId}-billing-yearly`}
        >
          Yearly
          <span className={s.saveBadge}>Save 17%</span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className={s.plansGrid}>
        {/* Free Plan */}
        <div className={s.planCard} data-testid={`${componentId}-plan-free`}>
          {currentUserPlan === 'Free' && (
            <span className={s.currentBadge}>Current Plan</span>
          )}
          <h2 className={s.planName}>Free</h2>
          <p className={s.planTagline}>Get started with the basics</p>
          <div className={s.freePriceLabel}>$0</div>
          {currentUserPlan === 'Free' ? (
            <button className={s.ctaButtonCurrent} disabled>
              Current Plan
            </button>
          ) : (
            <button className={s.ctaButtonFree} disabled>
              Downgrade not available
            </button>
          )}
          <ul className={s.featureList}>
            {freeFeatures.map((feat) => (
              <li key={feat} className={s.featureItem}>
                <span className={`${s.featureIcon} ${s.featureCheck}`}>
                  <Check size={16} />
                </span>
                {feat}
              </li>
            ))}
            <li className={s.featureItem}>
              <span className={`${s.featureIcon} ${s.featureDash}`}>
                <Minus size={16} />
              </span>
              <span style={{ color: '#666' }}>Offline listening</span>
            </li>
            <li className={s.featureItem}>
              <span className={`${s.featureIcon} ${s.featureDash}`}>
                <Minus size={16} />
              </span>
              <span style={{ color: '#666' }}>Scheduled releases</span>
            </li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className={s.planCardPro} data-testid={`${componentId}-plan-pro`}>
          {currentUserPlan === 'Pro' ? (
            <span className={s.currentBadge}>Current Plan</span>
          ) : (
            <span className={s.popularBadge}>Most Popular</span>
          )}
          <h2 className={s.planName}>Pro</h2>
          <p className={s.planTagline}>For serious creators</p>
          <div className={s.priceRow}>
            <span className={s.priceAmount}>
              ${billing === 'yearly' ? (proPrice / 12).toFixed(2) : proPrice.toFixed(2)}
            </span>
            <span className={s.pricePeriod}>/month</span>
          </div>
          {billing === 'yearly' && (
            <p style={{ fontSize: 13, color: '#999', marginTop: -20, marginBottom: 28 }}>
              ${proPrice.toFixed(2)} billed yearly
            </p>
          )}
          {currentUserPlan === 'Pro' ? (
            <button className={s.ctaButtonCurrent} disabled>
              Current Plan
            </button>
          ) : (
            <button
              className={s.ctaButtonPro}
              onClick={handleGetPro}
              data-testid={`${componentId}-cta-pro`}
            >
              Try Pro free for 30 days
            </button>
          )}
          <ul className={s.featureList}>
            {proFeatures.map((feat) => (
              <li key={feat} className={s.featureItem}>
                <span className={`${s.featureIcon} ${s.featureCheck}`}>
                  <Check size={16} />
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
