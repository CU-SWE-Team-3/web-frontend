'use client';

import { type FC, useEffect, useState, useCallback } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

const VARIANT_STYLES: Record<ToastVariant, { bg: string; accent: string; icon: string }> = {
  success: { bg: 'var(--sc-bg-primary)', accent: 'var(--sc-success)', icon: '✓' },
  error:   { bg: 'var(--sc-bg-primary)', accent: 'var(--sc-danger)',  icon: '✕' },
  info:    { bg: 'var(--sc-bg-primary)', accent: 'var(--sc-info)',    icon: 'ℹ' },
  warning: { bg: 'var(--sc-bg-primary)', accent: 'var(--sc-warning)', icon: '⚠' },
};

export interface AppToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  open: boolean;
  onClose: () => void;
}

export const AppToast: FC<AppToastProps> = ({
  message,
  variant = 'info',
  duration = 4000,
  open,
  onClose,
}) => {
  const [visible, setVisible] = useState(open);
  const { bg, accent, icon } = VARIANT_STYLES[variant];

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, dismiss]);

  if (!open && !visible) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: 'var(--sc-space-6)',
        right: 'var(--sc-space-6)',
        zIndex: 'var(--sc-z-toast)' as unknown as number,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sc-space-3)',
        padding: 'var(--sc-space-3) var(--sc-space-4)',
        background: bg,
        borderLeft: `4px solid ${accent}`,
        borderRadius: 'var(--sc-radius-lg)',
        boxShadow: 'var(--sc-shadow-lg)',
        fontFamily: 'var(--sc-font-family)',
        fontSize: 'var(--sc-font-size-md)',
        color: 'var(--sc-gray-900)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
        maxWidth: 400,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--sc-radius-full)',
          background: accent,
          color: 'var(--sc-white)',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      <span style={{ flex: 1 }}>{message}</span>

      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--sc-gray-400)',
          cursor: 'pointer',
          fontSize: 16,
          padding: 2,
          lineHeight: 1,
        }}
      >
        ×
      </button>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 3,
          background: accent,
          animation: `shrink ${duration}ms linear forwards`,
        }}
      />

      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};
