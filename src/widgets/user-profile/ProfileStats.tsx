'use client';

import { type FC } from 'react';
import s from './ProfileStats.module.scss';

export interface ProfileStatsProps {
  followers: number;
  following: number;
  tracks: number;
}

export const ProfileStats: FC<ProfileStatsProps> = ({
  followers,
  following,
  tracks,
}) => (
  <div className={s.row}>
    <div className={s.stat}>
      <span className={s.label}>Followers</span>
      <span className={s.value}>{followers}</span>
    </div>
    <div className={s.stat}>
      <span className={s.label}>Following</span>
      <span className={s.value}>{following}</span>
    </div>
    <div className={s.stat}>
      <span className={s.label}>Tracks</span>
      <span className={s.value}>{tracks}</span>
    </div>
  </div>
);
