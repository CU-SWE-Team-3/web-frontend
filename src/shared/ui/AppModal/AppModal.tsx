'use client';

import { type FC, type ReactNode, useEffect, useRef } from 'react';
import s from './AppModal.module.scss';

type ModalSize = 'sm' | 'md' | 'lg';

const WIDTH: Record<ModalSize, string> = {
  sm: '400px',
  md: '560px',
  lg: '720px',
};

export interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: ModalSize;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const AppModal: FC<AppModalProps> = ({
  open,
  onOpenChange,
  size = 'md',
  title,
  description,
  children,
  className,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className={s.overlay}
      onClick={(e) => { if (e.target === overlayRef.current) onOpenChange(false); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={[s.panel, className].filter(Boolean).join(' ')}
        style={{ maxWidth: WIDTH[size] }}
      >
        {(title || description) && (
          <div className={s.header}>
            {title && <h2 className={s.title}>{title}</h2>}
            {description && <p className={s.description}>{description}</p>}
          </div>
        )}
        <button
          className={s.closeBtn}
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          ✕
        </button>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  );
};
