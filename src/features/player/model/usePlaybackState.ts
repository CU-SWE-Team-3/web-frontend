'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Track } from './playerStore';

export type PlaybackState = 'playable' | 'preview' | 'blocked';

const PREVIEW_DURATION = 30;

export function usePlaybackState() {
  const [previewTimeRemaining, setPreviewTimeRemaining] = useState(PREVIEW_DURATION);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const getPlaybackState = useCallback(
    (
      track: Track | null,
      userRegion: string,
      userTier: 'free' | 'pro' | 'guest',
    ): PlaybackState => {
      if (!track) return 'playable';
      if (track.restrictedRegions?.includes(userRegion)) return 'blocked';
      if (userTier === 'guest') return 'preview';
      if (userTier === 'free' && track.tier === 'pro') return 'preview';
      return 'playable';
    },
    [],
  );

  const startPreviewCountdown = useCallback(() => {
    setPreviewTimeRemaining(PREVIEW_DURATION);
    setIsCountingDown(true);
  }, []);

  const stopPreviewCountdown = useCallback(() => {
    setIsCountingDown(false);
    setPreviewTimeRemaining(PREVIEW_DURATION);
  }, []);

  useEffect(() => {
    if (!isCountingDown) return;
    const interval = setInterval(() => {
      setPreviewTimeRemaining((prev) => {
        if (prev <= 1) { setIsCountingDown(false); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCountingDown]);

  return { getPlaybackState, previewTimeRemaining, startPreviewCountdown, stopPreviewCountdown };
}
