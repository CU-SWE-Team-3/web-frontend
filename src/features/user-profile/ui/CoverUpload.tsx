'use client';

import { type FC, type ChangeEvent, useRef } from 'react';
import { Camera } from 'lucide-react';
import s from './CoverUpload.module.scss';

export interface CoverUploadProps {
  currentSrc?: string | null;
  previewUrl?: string | null;
  onFileSelect: (file: File) => void;
  className?: string;
}

export const CoverUpload: FC<CoverUploadProps> = ({
  currentSrc,
  previewUrl,
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
      data-testid="cover-upload"
      className={[s.wrapper, className].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload cover photo"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
    >
      {displaySrc ? (
        <img className={s.image} src={displaySrc} alt="Cover" />
      ) : (
        <div className={s.placeholder}>
          <Camera size={32} />
        </div>
      )}
      <div className={s.overlay}>
        <Camera size={20} />
        <span>Change cover</span>
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
