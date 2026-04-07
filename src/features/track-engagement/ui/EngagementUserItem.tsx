import React from 'react';
import Link from 'next/link';
import { UserAvatar, FollowButton } from '@/shared/ui';
import { ROUTES } from '@/shared/constants/routes';
import s from './EngagementUserItem.module.scss';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  followerCount: number;
  isFollowing: boolean;
}

interface EngagementUserItemProps {
  user: User;
}

export const EngagementUserItem = ({ user }: EngagementUserItemProps) => {
  return (
    <div className={s.row} data-testid={`engagement-user-${user.id}`}>
      <Link href={ROUTES.PROFILE(user.username)} className={s.userLink}>
        <UserAvatar
          src={user.avatarUrl}
          name={user.displayName}
          size="sm"
        />
        <div className={s.info}>
          <div className={s.displayName}>{user.displayName}</div>
          <div className={s.stats}>
            {user.followerCount} followers
          </div>
        </div>
      </Link>

      <FollowButton
        isFollowing={user.isFollowing}
        onClick={(e) => {
          e.preventDefault();
          // Wire up with useFollow hook if available
          console.log('Follow toggled in modal for', user.displayName);
        }}
      />
    </div>
  );
};
