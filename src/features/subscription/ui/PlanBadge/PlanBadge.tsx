'use client'

import type { FC } from 'react'
import { Crown } from 'lucide-react'
import type { SubscriptionPlan } from '../../model/subscriptionTypes'
import s from './PlanBadge.module.scss'

const componentId = 'subscription-plan-badge'

interface PlanBadgeProps {
  plan?: SubscriptionPlan
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export const PlanBadge: FC<PlanBadgeProps> = ({
  plan = 'Free',
  size = 'md',
  showIcon = true,
}) => {
  const badgeClass = plan === 'Pro' ? s.badgePro : s.badgeFree
  const sizeClass = size === 'sm' ? s.sm : size === 'lg' ? s.lg : ''
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12

  if (plan === 'Free') return null // Don't show badge for free users

  return (
    <span
      className={`${badgeClass} ${sizeClass}`}
      data-testid={componentId}
      id={componentId}
    >
      {showIcon && (
        <span className={s.icon}>
          <Crown size={iconSize} />
        </span>
      )}
      Pro
    </span>
  )
}
