import { type FC } from 'react';

export interface PlayCountProps {
  count: number;
  className?: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const PlayCount: FC<PlayCountProps> = ({ count, className }) => (
  <span
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--sc-font-family)',
      fontSize: 'var(--sc-font-size-xs)',
      color: 'var(--sc-gray-500)',
    }}
  >
    <span style={{ fontSize: 10 }}>▶</span>
    {fmt(count)}
  </span>
);
