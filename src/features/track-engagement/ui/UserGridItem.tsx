import React from 'react';
import Link from 'next/link';
import { UserAvatar, FollowButton } from '@/shared/ui';
import { ROUTES } from '@/shared/constants/routes';
import s from './UserGridItem.module.scss';

interface UserGridItemProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    followerCount: number;
    isFollowing: boolean;
  };
}

export const UserGridItem = ({ user }: UserGridItemProps) => {
  return (
    <div className={s.container}>
      <Link href={ROUTES.PROFILE(user.username)} className={s.avatarLink}>
        <UserAvatar
          src={user.avatarUrl}
          name={user.displayName}
          className={s.customAvatar}
        />
      </Link>
      
      <div className={s.info}>
        <Link href={ROUTES.PROFILE(user.username)} className={s.displayName}>
          {user.displayName}
        </Link>
        <div className={s.stats}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span>{user.followerCount} followers</span>
        </div>
      </div>

      <div className={s.action}>
        <FollowButton
          isFollowing={user.isFollowing}
          className={s.followBtn}
          onClick={(e) => {
            e.preventDefault();
            // Follow logic can be wired later
            console.log('Follow toggled for', user.displayName);
          }}
        />
      </div>
    </div>
  );
};
