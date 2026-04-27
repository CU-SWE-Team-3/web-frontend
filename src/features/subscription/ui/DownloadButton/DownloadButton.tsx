'use client'

import { useState, useRef, useEffect, type FC } from 'react'
import { Download, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/shared/constants/routes'
import { useSubscriptionStore } from '../../model/useSubscriptionStore'
import s from './DownloadButton.module.scss'

const componentId = 'subscription-download-button'

interface DownloadButtonProps {
  trackId: string
  trackTitle: string
  enableDirectDownloads?: boolean
}

export const DownloadButton: FC<DownloadButtonProps> = ({
  trackId,
  trackTitle,
  enableDirectDownloads = true,
}) => {
  const router = useRouter()
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const {
    currentPlan,
    downloadingTrackId,
    downloadTrack,
  } = useSubscriptionStore()

  const isDownloading = downloadingTrackId === trackId
  const isPro = currentPlan === 'Pro'

  // Close tooltip on click outside
  useEffect(() => {
    if (!showTooltip) return
    const handleClick = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setShowTooltip(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showTooltip])

  const handleClick = async () => {
    if (!isPro) {
      setShowTooltip(!showTooltip)
      return
    }

    if (!enableDirectDownloads) {
      return
    }

    try {
      await downloadTrack(trackId, trackTitle)
    } catch (err: any) {
      console.warn('Download failed:', err?.message)
    }
  }

  if (!enableDirectDownloads && isPro) {
    return null // Artist has disabled downloads for this track
  }

  return (
    <div className={s.wrapper} ref={tooltipRef}>
      <button
        className={isPro ? (isDownloading ? s.downloadBtnActive : s.downloadBtn) : s.lockedBtn}
        onClick={handleClick}
        disabled={isDownloading}
        data-testid={componentId}
        id={componentId}
        title={isPro ? 'Download for offline listening' : 'Pro subscription required'}
      >
        {isDownloading ? (
          <>
            <span className={s.spinner} />
            Downloading...
          </>
        ) : isPro ? (
          <>
            <Download size={14} />
            Download
          </>
        ) : (
          <>
            <Lock size={14} />
            Offline
          </>
        )}
      </button>

      {showTooltip && !isPro && (
        <div className={s.tooltip}>
          <p className={s.tooltipText}>
            Offline listening is available with a Pro subscription. Download tracks for on-the-go listening.
          </p>
          <button
            className={s.tooltipCta}
            onClick={() => {
              setShowTooltip(false)
              router.push(ROUTES.PRICING)
            }}
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  )
}
