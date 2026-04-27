'use client'

import { PricingPage } from '@/features/subscription/ui/PricingPage/PricingPage'
import { CheckoutModal } from '@/features/subscription/ui/CheckoutModal/CheckoutModal'
import { useSubscriptionStore } from '@/features/subscription/model/useSubscriptionStore'

export default function PricingRoute() {
  const { openCheckout } = useSubscriptionStore()

  return (
    <>
      <PricingPage onOpenCheckout={openCheckout} />
      <CheckoutModal />
    </>
  )
}
