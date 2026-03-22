'use client';

import { type FC } from 'react';
import Link from 'next/link';
import s from './ProfileStats.module.scss';

export interface ProfileStatsProps {
  followers: number;
  following: number;
  tracks: number;
  username?: string;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export const ProfileStats: FC<ProfileStatsProps> = ({
  followers,
  following,
  tracks,
  username,
  onFollowersClick,
  onFollowingClick,
}) => (
  <div className={s.row}>
    {username ? (
      <Link href={`/profile/${username}/followers`} className={s.stat} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
        <span className={s.label}>Followers</span>
        <span data-testid="profile-followers-count" className={s.value}>{followers}</span>
      </Link>
    ) : (
      <div
        className={s.stat}
        onClick={onFollowersClick}
        style={{ cursor: onFollowersClick ? 'pointer' : 'default' }}
      >
        <span className={s.label}>Followers</span>
        <span data-testid="profile-followers-count" className={s.value}>{followers}</span>
      </div>
    )}
    {username ? (
      <Link href={`/profile/${username}/following`} className={s.stat} style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
        <span className={s.label}>Following</span>
        <span data-testid="profile-following-count" className={s.value}>{following}</span>
      </Link>
    ) : (
      <div
        className={s.stat}
        onClick={onFollowingClick}
        style={{ cursor: onFollowingClick ? 'pointer' : 'default' }}
      >
        <span className={s.label}>Following</span>
        <span data-testid="profile-following-count" className={s.value}>{following}</span>
      </div>
    )}
    <div className={s.stat}>
      <span className={s.label}>Tracks</span>
      <span data-testid="profile-tracks-count" className={s.value}>{tracks}</span>
    </div>
  </div>
);

