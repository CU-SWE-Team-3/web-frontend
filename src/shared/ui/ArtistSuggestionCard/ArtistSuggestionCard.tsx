'use client';

import { type FC, type MouseEventHandler, type ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import s from './ArtistSuggestionCard.module.scss';

export interface ArtistSuggestionCardProps {
  username?: string;
  name: string;
  avatarSlot: ReactNode;
  followers?: number | string;
  tracks?: number | string;
  verified?: boolean;
  followSlot: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export const ArtistSuggestionCard: FC<ArtistSuggestionCardProps> = ({
  username, name, avatarSlot, followers, tracks, verified, followSlot, className, onClick,
}) => {
  const card = (
    <div className={[s.card, className].filter(Boolean).join(' ')} onClick={onClick}>
      {avatarSlot}
      <div className={s.info}>
        <span className={s.name}>
          {name}
          {verified && <span style={{ color: 'var(--sc-verified)', fontSize: 14 }}>✓</span>}
        </span>
        <span className={s.meta}>
          {followers !== undefined && <span>👤 {followers}</span>}
          {tracks !== undefined && <span>🎵 {tracks}</span>}
        </span>
      </div>
      {followSlot}
    </div>
  )

  return username
    ? <Link href={ROUTES.PROFILE(username)} style={{ textDecoration: 'none', color: 'inherit' }}>{card}</Link>
    : card
};
