'use client';

import { type FC, type MouseEventHandler } from 'react';

export interface NotificationBellProps {
  count?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const NotificationBell: FC<NotificationBellProps> = ({
  count = 0, onClick, className,
}) => (
  <button
    data-testid="notification-bell"
    className={className}
    onClick={onClick}
    aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: 'var(--sc-gray-400)',
      fontSize: 20,
      padding: 0,
      transition: 'color var(--sc-transition-fast)',
    }}
  >
    🔔
    {count > 0 && (
      <span
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          minWidth: 16,
          height: 16,
          padding: '0 4px',
          borderRadius: 'var(--sc-radius-full)',
          background: 'var(--sc-danger)',
          color: 'var(--sc-white)',
          fontFamily: 'var(--sc-font-family)',
          fontSize: 10,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        {count >= 10 ? '9+' : count}
      </span>
    )}
  </button>
);
