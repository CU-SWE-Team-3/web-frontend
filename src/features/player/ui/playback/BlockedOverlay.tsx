'use client';

import { type FC } from 'react';
import { Lock } from 'lucide-react';
import s from './BlockedOverlay.module.scss';

export interface BlockedOverlayProps {
  region?: string;
  userTier?: 'free' | 'pro' | 'guest';
  onCtaClick?: () => void;
  artworkUrl?: string;
}

export const BlockedOverlay: FC<BlockedOverlayProps> = ({
  region,
  userTier,
  onCtaClick,
  artworkUrl,
}) => {
  const isRegionBlock = !!region;
  const message = isRegionBlock ? 'Not available in your region' : 'Go Pro to unlock';
  const ctaText = isRegionBlock ? 'Learn More' : 'Go Pro';

  return (
    <div id="sc-blocked-overlay" className={s.overlay}>
      {artworkUrl && (
        <div className={s.backdrop} style={{ backgroundImage: `url(${artworkUrl})` }} />
      )}
      <div className={s.scrim} />
      <div className={s.content}>
        <div className={s.iconWrap}>
          <Lock size={24} color="var(--sc-gray-500)" />
        </div>
        <p className={s.label}>{message}</p>
        <button id="sc-blocked-cta" onClick={onCtaClick} className={s.cta}>
          {ctaText}
        </button>
      </div>
    </div>
  );
};
