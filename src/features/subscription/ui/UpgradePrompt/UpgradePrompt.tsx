'use client'

import { useState, type FC } from 'react'
import { Crown, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/constants/routes'
import { useSubscriptionStore } from '../../model/useSubscriptionStore'
import s from './UpgradePrompt.module.scss'

const componentId = 'subscription-upgrade-prompt'

interface UpgradePromptProps {
  trackCount?: number
  trackLimit?: number
  context?: 'upload' | 'my-tracks' | 'general'
  onUpgradeClick?: () => void
  dismissible?: boolean
}

export const UpgradePrompt: FC<UpgradePromptProps> = ({
  trackCount,
  trackLimit = 3,
  context = 'general',
  onUpgradeClick,
  dismissible = true,
}) => {
  const [dismissed, setDismissed] = useState(false)
  const router = useRouter()
  const { openCheckout } = useSubscriptionStore()

  if (dismissed) return null

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick()
    } else {
      router.push(ROUTES.PRICING)
    }
  }

  const getMessage = () => {
    switch (context) {
      case 'upload':
        return {
          title: 'Upload limit reached',
          description: trackCount !== undefined
            ? <>You've used <span className={s.trackCount}>{trackCount}/{trackLimit}</span> free uploads. Upgrade to Pro for unlimited uploads.</>
            : 'Free accounts are limited to 3 uploads. Upgrade to Pro for unlimited.',
        }
      case 'my-tracks':
        return {
          title: 'Want more space?',
          description: trackCount !== undefined
            ? <>You have <span className={s.trackCount}>{trackCount}/{trackLimit}</span> tracks. Go Pro for unlimited uploads and more features.</>
            : 'Upgrade to Pro for unlimited uploads, offline listening, and more.',
        }
      default:
        return {
          title: 'Unlock your full potential',
          description: 'Upgrade to Pro for unlimited uploads, offline listening, scheduled releases, and more.',
        }
    }
  }

  const msg = getMessage()

  return (
    <div className={s.banner} data-testid={componentId} id={componentId}>
      <div className={s.iconWrap}>
        <Crown size={22} />
      </div>
      <div className={s.content}>
        <div className={s.title}>{msg.title}</div>
        <div className={s.description}>{msg.description}</div>
      </div>
      <button
        className={s.upgradeButton}
        onClick={handleUpgrade}
        data-testid={`${componentId}-cta`}
      >
        Upgrade to Pro
      </button>
      {dismissible && (
        <button className={s.dismissButton} onClick={() => setDismissed(true)}>
          <X size={16} />
        </button>
      )}
    </div>
  )
}
