'use client';

import { type FC, type ReactNode, useState } from 'react';
import s from './AnnouncementBanner.module.scss';

export interface AnnouncementBannerProps {
  icon?: ReactNode;
  children: ReactNode;
  linkText?: string;
  linkHref?: string;
  dismissible?: boolean;
  className?: string;
}

export const AnnouncementBanner: FC<AnnouncementBannerProps> = ({
  icon = '🚀',
  children,
  linkText,
  linkHref,
  dismissible = true,
  className,
}) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className={[s.banner, className].filter(Boolean).join(' ')} role="banner">
      <span className={s.icon}>{icon}</span>
      <span>
        {children}
        {linkText && (
          <>
            {' '}
            <a className={s.link} href={linkHref}>
              {linkText}
            </a>
          </>
        )}
      </span>
      {dismissible && (
        <button
          className={s.dismiss}
          onClick={() => setVisible(false)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};
