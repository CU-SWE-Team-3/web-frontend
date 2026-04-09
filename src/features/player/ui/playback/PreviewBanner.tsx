'use client';

import { type FC } from 'react';
import { formatTime } from '../../lib/playbackUtils';
import s from './PreviewBanner.module.scss';

export interface PreviewBannerProps {
  userTier?: 'free' | 'pro' | 'guest';
  previewTimeRemaining?: number;
  onCtaClick?: () => void;
}

export const PreviewBanner: FC<PreviewBannerProps> = ({
  userTier = 'guest',
  previewTimeRemaining = 30,
  onCtaClick,
}) => {
  const message = userTier === 'guest' ? 'Sign in for full access' : 'Upgrade to listen';
  const ctaText = userTier === 'guest' ? 'Sign In' : 'Go Pro';

  return (
    <div id="sc-preview-banner" data-testid="sc-preview-banner" className={s.banner}>
      <div className={s.info}>
        <span className={s.message}>{message}</span>
        <span id="sc-preview-timer" data-testid="sc-preview-timer" className={s.timer}>
          {formatTime(previewTimeRemaining)} remaining
        </span>
      </div>
      <button id="sc-preview-cta" data-testid="sc-preview-cta" onClick={onCtaClick} className={s.cta}>
        {ctaText}
      </button>
    </div>
  );
};
