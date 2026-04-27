// ─── Subscription Types ──────────────────────────────────────────────────────

export type SubscriptionPlan = 'Free' | 'Pro'

export interface PlanFeature {
  label: string
  free: boolean | string
  pro: boolean | string
}

export const PLAN_FEATURES: PlanFeature[] = [
  { label: 'Upload limit', free: '3 tracks', pro: 'Unlimited' },
  { label: 'Offline listening', free: false, pro: true },
  { label: 'Scheduled releases', free: false, pro: true },
  { label: 'Track statistics', free: 'Basic', pro: 'Full analytics' },
  { label: 'Priority support', free: false, pro: true },
]

export const PLAN_PRICES = {
  Free: { monthly: 0, yearly: 0 },
  Pro: { monthly: 9.99, yearly: 99.99 },
} as const

export const UPLOAD_LIMITS = {
  Free: 3,
  Pro: Infinity,
} as const

export interface CheckoutState {
  isOpen: boolean
  step: 'form' | 'processing' | 'success' | 'error'
  selectedPlan: SubscriptionPlan
  error: string | null
}

export interface CardDetails {
  number: string
  expiry: string
  cvc: string
  name: string
}
