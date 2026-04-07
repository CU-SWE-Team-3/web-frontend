'use client';

import React, { useEffect, useState } from 'react';

export interface RepostToastProps {
  trackTitle: string;
  artworkUrl?: string | null;
  visible: boolean;
  onDismiss: () => void;
}

export const RepostToast: React.FC<RepostToastProps> = ({
  trackTitle,
  artworkUrl,
  visible,
  onDismiss,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);

  if (!visible && !show) return null;

  return (
    <div
      data-testid="repost-toast"
      style={{
        position: 'fixed',
        top: 60,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#333',
        borderRadius: 6,
        padding: '10px 16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(-12px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
        maxWidth: 360,
      }}
    >
      {artworkUrl && (
        <img
          src={artworkUrl}
          alt=""
          style={{
            width: 40,
            height: 40,
            borderRadius: 4,
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {trackTitle}
        </div>
        <div style={{ color: '#999', fontSize: 12 }}>
          was reposted to{' '}
          <span style={{ color: '#ff5500', fontWeight: 600 }}>the feed</span>.
        </div>
      </div>
    </div>
  );
};
