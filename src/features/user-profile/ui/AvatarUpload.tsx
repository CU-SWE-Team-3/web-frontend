'use client';

import { type FC, type ChangeEvent, useRef } from 'react';
import { Camera } from 'lucide-react';
import { UserAvatar } from '@/shared/ui';
import s from './AvatarUpload.module.scss';

export interface AvatarUploadProps {
  currentSrc?: string | null;
  previewUrl?: string | null;
  name: string;
  onFileSelect: (file: File) => void;
  className?: string;
}

export const AvatarUpload: FC<AvatarUploadProps> = ({
  currentSrc,
  previewUrl,
  name,
  onFileSelect,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const displaySrc = previewUrl ?? currentSrc;

  return (
    <div
      data-testid="avatar-upload"
      className={[s.wrapper, className].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload avatar"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
    >
      <UserAvatar src={displaySrc} name={name} size="xl" />
      <div className={s.overlay}>
        <Camera size={24} />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={s.hiddenInput}
        onChange={handleChange}
      />
    </div>
  );
};
