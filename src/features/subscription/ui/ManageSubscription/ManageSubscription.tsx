'use client'

import { useState, type FC } from 'react'
import { Crown, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/constants/routes'
import { useSubscriptionStore } from '../../model/useSubscriptionStore'
import { PLAN_PRICES } from '../../model/subscriptionTypes'
import { PlanBadge } from '../PlanBadge/PlanBadge'
import s from './ManageSubscription.module.scss'

const componentId = 'subscription-manage-panel'

export const ManageSubscription: FC = () => {
  const router = useRouter()
  const [isCancelling, setIsCancelling] = useState(false)
  const [isReactivating, setIsReactivating] = useState(false)

  const {
    currentPlan,
    expiresAt,
    cancelAtPeriodEnd,
    cancelSubscription,
    reactivateSubscription,
    openCheckout,
  } = useSubscriptionStore()

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Pro subscription? You\'ll keep access until the end of your billing period.')) {
      return
    }
    setIsCancelling(true)
    await cancelSubscription()
    setIsCancelling(false)
  }

  const handleReactivate = async () => {
    setIsReactivating(true)
    await reactivateSubscription()
    setIsReactivating(false)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className={s.panel} data-testid={componentId} id={componentId}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Crown size={20} style={{ color: currentPlan === 'Pro' ? '#f50' : '#666' }} />
          <h2 className={s.title}>Subscription</h2>
        </div>
      </div>

      {currentPlan === 'Free' ? (
        /* Free user — show upgrade prompt */
        <div className={s.freeState}>
          <h3>You're on the Free plan</h3>
          <p>
            Upgrade to Pro for unlimited uploads, offline listening,
            scheduled releases, and premium analytics.
          </p>
          <button
            className={s.upgradeBtn}
            onClick={() => router.push(ROUTES.PRICING)}
            data-testid={`${componentId}-upgrade-cta`}
          >
            Upgrade to Pro
          </button>
        </div>
      ) : (
        /* Pro user — show subscription details */
        <>
          <div className={s.planCard}>
            <div className={s.planInfo}>
              <h3>
                BioBeats Pro
                <PlanBadge plan="Pro" size="sm" />
              </h3>
              <p>
                {cancelAtPeriodEnd
                  ? 'Cancels at end of billing period'
                  : 'Active subscription'}
              </p>
            </div>
            <div className={s.planPrice}>
              <span className={s.amount}>${PLAN_PRICES.Pro.monthly.toFixed(2)}</span>
              <span className={s.period}>/month</span>
            </div>
          </div>

          {cancelAtPeriodEnd && (
            <div className={s.cancelWarning}>
              <AlertTriangle size={16} className={s.cancelWarningIcon} />
              <span className={s.cancelWarningText}>
                Your subscription has been cancelled and will expire on{' '}
                <strong>{formatDate(expiresAt)}</strong>.
                You'll keep Pro access until then. Reactivate anytime to continue.
              </span>
            </div>
          )}

          <div className={s.details}>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Status</span>
              <span className={cancelAtPeriodEnd ? s.detailValueWarning : s.detailValue}>
                {cancelAtPeriodEnd ? 'Cancelling' : 'Active'}
              </span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>
                {cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
              </span>
              <span className={s.detailValue}>{formatDate(expiresAt)}</span>
            </div>
            <div className={s.detailRow}>
              <span className={s.detailLabel}>Upload limit</span>
              <span className={s.detailValue}>Unlimited</span>
            </div>
          </div>

          <div className={s.actions}>
            {cancelAtPeriodEnd ? (
              <button
                className={s.reactivateButton}
                onClick={handleReactivate}
                disabled={isReactivating}
              >
                {isReactivating ? 'Reactivating...' : 'Reactivate subscription'}
              </button>
            ) : (
              <button
                className={s.cancelButton}
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel subscription'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
