'use client';

import { type FC } from 'react';
import { LikeIcon } from '@/shared/ui/icons';

// ─── LikeButton ───────────────────────────────────────────────────────────────
// Presentational component only — no API calls or side effects here.
// Wire it up with useLikeTrack / useUnlikeTrack in the parent component.

export interface LikeButtonProps {
  /** Whether the current user has already liked this track */
  isLiked: boolean;
  /** Raw like count to display (formatted automatically as K / M) */
  likeCount?: number;
  /** Called when the user clicks the button */
  onToggle?: () => void;
  /** Extra Tailwind classes forwarded to the root <button> */
  className?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const LikeButton: FC<LikeButtonProps> = ({
  isLiked,
  likeCount,
  onToggle,
  className = '',
}) => (
  <button
    data-testid="like-button"
    type="button"
    onClick={onToggle}
    aria-label={isLiked ? 'Unlike this track' : 'Like this track'}
    aria-pressed={isLiked}
    onMouseDown={(e) => {
      // Subtle scale-pulse feedback on press
      const el = e.currentTarget;
      el.style.transform = 'scale(1.18)';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
      }, 150);
    }}
    className={[
      // Base layout
      'flex items-center gap-1.5 px-2.5 py-1',
      'text-[13px] rounded border',
      // Smooth transitions (color + transform)
      'transition-colors duration-[120ms]',
      // Liked vs. un-liked visual state
      isLiked
        ? 'border-[#f50] text-[#f50] bg-[#111]'
        : 'border-[#333] text-[#ccc] bg-[#111] hover:border-[#666]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {/* Heart icon — filled when liked, outlined when not */}
    <LikeIcon
      size={14}
      fill={isLiked ? 'currentColor' : 'none'}
      className="transition-transform duration-[120ms]"
    />
    {likeCount !== undefined && <span>{fmt(likeCount)}</span>}
  </button>
);
