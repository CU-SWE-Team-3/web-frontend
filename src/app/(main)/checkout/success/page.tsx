'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Check, Upload, Download, BarChart3, Calendar } from 'lucide-react'
import { ROUTES } from '@/shared/constants/routes'
import s from './success.module.scss'

const CONFETTI_COLORS = ['#f50', '#ff8c42', '#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#ffd166']

function Confetti() {
  const [pieces, setPieces] = useState<Array<{ id: number; left: string; delay: string; color: string; size: number }>>([])

  useEffect(() => {
    const p = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 6,
    }))
    setPieces(p)
  }, [])

  return (
    <div className={s.confetti}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className={s.confettiPiece}
          style={{
            left: p.left,
            animationDelay: p.delay,
            background: p.color,
            width: p.size,
            height: p.size,
          }}
        />
      ))}
    </div>
  )
}

export default function CheckoutSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const proFeatures = [
    { icon: <Upload size={16} />, label: 'Unlimited track uploads' },
    { icon: <Download size={16} />, label: 'Offline listening & downloads' },
    { icon: <Calendar size={16} />, label: 'Scheduled releases' },
    { icon: <BarChart3 size={16} />, label: 'Full analytics & insights' },
  ]

  return (
    <div className={s.successPage}>
      {showConfetti && <Confetti />}

      <div className={s.card}>
        <div className={s.iconWrap}>
          <Crown size={36} />
        </div>

        <h1 className={s.title}>Welcome to Pro! 🎉</h1>
        <p className={s.subtitle}>
          Your subscription is active. You now have access to all premium features.
          Start creating without limits.
        </p>

        <div className={s.features}>
          {proFeatures.map((feat) => (
            <div key={feat.label} className={s.featureItem}>
              <span className={s.featureIcon}>{feat.icon}</span>
              {feat.label}
            </div>
          ))}
        </div>

        <Link href={ROUTES.HOME} className={s.cta}>
          Start uploading
        </Link>

        <Link href={ROUTES.SETTINGS} className={s.secondaryLink}>
          Manage your subscription →
        </Link>
      </div>
    </div>
  )
}
