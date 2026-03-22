'use client';

import { type FC, type MouseEventHandler, useState } from 'react';
import s from './FollowButton.module.scss';

export interface FollowButtonProps {
  isFollowing: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const FollowButton: FC<FollowButtonProps> = ({
  isFollowing,
  loading = false,
  disabled = false,
  onClick,
  className,
}) => {
  const [hovered, setHovered] = useState(false);

  const label = loading
    ? '...'
    : isFollowing
      ? hovered ? 'Unfollow' : 'Following'
      : 'Follow';

  return (
    <button
      data-testid={isFollowing ? 'follow-button-following' : 'follow-button-follow'}
      className={[
        s.followBtn,
        isFollowing ? s.following : '',
        disabled || loading ? s.disabled : '',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled || loading}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {label}
    </button>
  );
};
