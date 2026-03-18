'use client';

import { type FC } from 'react';
import s from './UserAvatar.module.scss';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const FALLBACK_COLORS = [
  '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
  '#2196f3', '#00bcd4', '#009688', '#4caf50',
  '#ff9800', '#ff5722', '#795548', '#607d8b',
] as const;

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

export const UserAvatar: FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
}) => {
  const safeName = name || 'User';
  const initial = safeName.charAt(0);
  const bg = hashColor(safeName);

  const classes = [s.avatar, s[size], className].filter(Boolean).join(' ');

  return (
    <div className={classes} aria-label={name} role="img">
      {src ? (
        <img className={s.image} src={src} alt={name} />
      ) : (
        <div className={s.fallback} style={{ background: bg }}>
          {initial}
        </div>
      )}
    </div>
  );
};
