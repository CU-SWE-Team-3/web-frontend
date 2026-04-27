'use client'

import { useState, type FC } from 'react'
import { X, Check, AlertCircle, Lock, CreditCard } from 'lucide-react'
import { useSubscriptionStore } from '../../model/useSubscriptionStore'
import { PLAN_PRICES } from '../../model/subscriptionTypes'
import s from './CheckoutModal.module.scss'

const componentId = 'subscription-checkout-modal'

export const CheckoutModal: FC = () => {
  const { checkout, closeCheckout, processCheckout } = useSubscriptionStore()
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  })

  if (!checkout.isOpen) return null

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  const isFormValid =
    card.number.replace(/\s/g, '').length >= 13 &&
    card.expiry.length >= 4 &&
    card.cvc.length >= 3 &&
    card.name.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return
    await processCheckout()
  }

  const price = PLAN_PRICES.Pro.monthly

  return (
    <div className={s.overlay} onClick={(e) => {
      if (e.target === e.currentTarget && checkout.step === 'form') closeCheckout()
    }}>
      <div className={s.modal} data-testid={componentId} id={componentId}>
        {/* Header */}
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>
            {checkout.step === 'success' ? 'Welcome to Pro!' : 'Upgrade to Pro'}
          </h2>
          {checkout.step !== 'processing' && (
            <button className={s.closeButton} onClick={closeCheckout}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className={s.modalBody}>
          {/* ── Form Step ── */}
          {checkout.step === 'form' && (
            <>
              <div className={s.planSummary}>
                <div className={s.planInfo}>
                  <h3>BioBeats Pro</h3>
                  <p>Monthly subscription</p>
                </div>
                <span className={s.planPrice}>${price.toFixed(2)}/mo</span>
              </div>

              <form className={s.form} onSubmit={handleSubmit}>
                <div className={s.fieldGroup}>
                  <label className={s.fieldLabel}>Cardholder name</label>
                  <input
                    className={s.fieldInput}
                    type="text"
                    placeholder="John Doe"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    style={{ letterSpacing: 'normal', fontFamily: 'inherit' }}
                    data-testid={`${componentId}-name`}
                  />
                </div>

                <div className={s.fieldGroup}>
                  <label className={s.fieldLabel}>Card number</label>
                  <input
                    className={s.fieldInput}
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                    data-testid={`${componentId}-card-number`}
                  />
                </div>

                <div className={s.fieldRow}>
                  <div className={s.fieldGroup}>
                    <label className={s.fieldLabel}>Expiry</label>
                    <input
                      className={s.fieldInput}
                      type="text"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      data-testid={`${componentId}-expiry`}
                    />
                  </div>
                  <div className={s.fieldGroup}>
                    <label className={s.fieldLabel}>CVC</label>
                    <input
                      className={s.fieldInput}
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={card.cvc}
                      onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      data-testid={`${componentId}-cvc`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={s.submitButton}
                  disabled={!isFormValid}
                  data-testid={`${componentId}-submit`}
                >
                  <CreditCard size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: -2 }} />
                  Subscribe — ${price.toFixed(2)}/month
                </button>
              </form>

              <div className={s.stripeBranding}>
                <Lock size={12} className={s.secureIcon} />
                Secured by
                <span className={s.stripeLogo}>stripe</span>
              </div>
            </>
          )}

          {/* ── Processing Step ── */}
          {checkout.step === 'processing' && (
            <div className={s.processingState}>
              <div className={s.spinner} />
              <p className={s.processingText}>Processing your payment...</p>
              <p className={s.processingSubtext}>Please don't close this window</p>
            </div>
          )}

          {/* ── Success Step ── */}
          {checkout.step === 'success' && (
            <div className={s.successState}>
              <div className={s.successIcon}>
                <Check size={32} />
              </div>
              <h3 className={s.successTitle}>You're now Pro! 🎉</h3>
              <p className={s.successText}>
                Enjoy unlimited uploads, offline listening, scheduled releases,
                and all the tools you need to grow your audience.
              </p>
              <button className={s.successButton} onClick={closeCheckout}>
                Start creating
              </button>
            </div>
          )}

          {/* ── Error Step ── */}
          {checkout.step === 'error' && (
            <div className={s.errorState}>
              <div className={s.errorIcon}>
                <AlertCircle size={32} />
              </div>
              <h3 className={s.errorTitle}>Payment failed</h3>
              <p className={s.errorText}>
                {checkout.error || 'Something went wrong. Please try again.'}
              </p>
              <button
                className={s.retryButton}
                onClick={() => useSubscriptionStore.setState({
                  checkout: { ...checkout, step: 'form', error: null }
                })}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
