import { type FC } from 'react';
import { SkeletonLoader } from '../SkeletonLoader';

export interface TrackCardSkeletonProps {
  className?: string;
}

export const TrackCardSkeleton: FC<TrackCardSkeletonProps> = ({ className }) => (
  <div
    data-testid="track-card-skeleton"
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--sc-space-3)',
      height: 72,
      padding: '0 var(--sc-space-3)',
      width: '100%',
    }}
  >
    {/* Play button skeleton */}
    <SkeletonLoader width={40} height={40} rounded="circle" />

    {/* Cover art skeleton */}
    <SkeletonLoader width={40} height={40} />

    {/* Meta skeleton */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 140 }}>
      <SkeletonLoader width={120} height={12} />
      <SkeletonLoader width={80} height={10} />
    </div>

    {/* Waveform skeleton */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <SkeletonLoader width="100%" height={32} />
    </div>

    {/* Stats skeleton */}
    <div style={{ display: 'flex', gap: 'var(--sc-space-3)', flexShrink: 0 }}>
      <SkeletonLoader width={40} height={12} />
      <SkeletonLoader width={40} height={12} />
      <SkeletonLoader width={40} height={12} />
    </div>
  </div>
);
