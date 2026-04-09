'use client';

import { type FC, type ReactNode } from 'react';
import { PreviewBanner } from './PreviewBanner';
import { BlockedOverlay } from './BlockedOverlay';

export type PlaybackStateType = 'playable' | 'preview' | 'blocked';

export interface PlaybackStateGuardProps {
  state: PlaybackStateType;
  region?: string;
  userTier?: 'free' | 'pro' | 'guest';
  previewTimeRemaining?: number;
  children: ReactNode;
  onCtaClick?: () => void;
  artworkUrl?: string;
}

export const PlaybackStateGuard: FC<PlaybackStateGuardProps> = ({
  state,
  region,
  userTier,
  previewTimeRemaining = 30,
  children,
  onCtaClick,
  artworkUrl,
}) => {
  if (state === 'blocked') {
    return (
      <div id="sc-playback-guard" data-testid="sc-playback-guard" data-state="blocked">
        <BlockedOverlay
          region={region}
          userTier={userTier}
          onCtaClick={onCtaClick}
          artworkUrl={artworkUrl}
        />
      </div>
    );
  }

  if (state === 'preview') {
    return (
      <div id="sc-playback-guard" data-testid="sc-playback-guard" data-state="preview" style={{ position: 'relative' }}>
        {children}
        <PreviewBanner
          userTier={userTier}
          previewTimeRemaining={previewTimeRemaining}
          onCtaClick={onCtaClick}
        />
      </div>
    );
  }

  return (
    <div id="sc-playback-guard" data-testid="sc-playback-guard" data-state="playable">
      {children}
    </div>
  );
};
