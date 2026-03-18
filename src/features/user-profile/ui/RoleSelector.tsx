'use client';

import { type FC } from 'react';
import { Mic2, Headphones } from 'lucide-react';
import s from './RoleSelector.module.scss';

export interface RoleSelectorProps {
  role: 'artist' | 'listener';
  onChange: (role: 'artist' | 'listener') => void;
  className?: string;
}

export const RoleSelector: FC<RoleSelectorProps> = ({
  role,
  onChange,
  className,
}) => (
  <div className={[s.wrapper, className].filter(Boolean).join(' ')}>
    <button
      type="button"
      className={[s.option, role === 'artist' ? s.active : '']
        .filter(Boolean)
        .join(' ')}
      onClick={() => onChange('artist')}
      aria-pressed={role === 'artist'}
    >
      <Mic2 size={18} />
      Artist
    </button>
    <button
      type="button"
      className={[s.option, role === 'listener' ? s.active : '']
        .filter(Boolean)
        .join(' ')}
      onClick={() => onChange('listener')}
      aria-pressed={role === 'listener'}
    >
      <Headphones size={18} />
      Listener
    </button>
  </div>
);
