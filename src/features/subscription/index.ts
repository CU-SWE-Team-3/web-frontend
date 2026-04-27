// ─── Public API for the subscription feature ────────────────────────────────
// Other parts of the app should only import from this file.

export { PricingPage } from './ui/PricingPage/PricingPage'
export { CheckoutModal } from './ui/CheckoutModal/CheckoutModal'
export { UpgradePrompt } from './ui/UpgradePrompt/UpgradePrompt'
export { PlanBadge } from './ui/PlanBadge/PlanBadge'
export { ManageSubscription } from './ui/ManageSubscription/ManageSubscription'
export { DownloadButton } from './ui/DownloadButton/DownloadButton'

export { useSubscriptionStore } from './model/useSubscriptionStore'
export { subscriptionRepository } from './api/subscriptionRepository'

export type { SubscriptionPlan, PlanFeature, CheckoutState, CardDetails } from './model/subscriptionTypes'
export { PLAN_FEATURES, PLAN_PRICES, UPLOAD_LIMITS } from './model/subscriptionTypes'
