import { type FC } from 'react';

export interface TrackDurationProps {
  seconds: number;
  className?: string;
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const TrackDuration: FC<TrackDurationProps> = ({ seconds, className }) => (
  <span
    data-testid="track-duration"
    className={className}
    style={{
      fontFamily: 'var(--sc-font-family)',
      fontSize: 'var(--sc-font-size-sm)',
      color: 'var(--sc-gray-500)',
    }}
  >
    {fmtDuration(seconds)}
  </span>
);
