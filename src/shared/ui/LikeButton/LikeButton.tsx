'use client';

import { type FC, type MouseEventHandler } from 'react';

export interface LikeButtonProps {
  liked: boolean;
  count?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const LikeButton: FC<LikeButtonProps> = ({
  liked, count, onClick, className,
}) => (
  <button
    className={className}
    onClick={onClick}
    aria-label={liked ? 'Unlike' : 'Like'}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--sc-font-family)',
      fontSize: 'var(--sc-font-size-sm)',
      color: liked ? 'var(--sc-primary)' : 'var(--sc-gray-500)',
      padding: '4px 6px',
      borderRadius: 'var(--sc-radius-sm)',
      transition: 'color var(--sc-transition-fast), transform 100ms ease',
    }}
    onMouseDown={(e) => {
      const el = e.currentTarget;
      el.style.transform = 'scale(1.2)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
    }}
  >
    <span style={{ fontSize: 16 }}>{liked ? '♥' : '♡'}</span>
    {count !== undefined && <span>{fmt(count)}</span>}
  </button>
);
