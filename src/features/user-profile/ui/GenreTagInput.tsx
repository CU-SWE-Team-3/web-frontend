'use client';

import { type FC, type KeyboardEvent, useState } from 'react';
import { X } from 'lucide-react';
import { AppInput } from '@/shared/ui';
import s from './GenreTagInput.module.scss';

export interface GenreTagInputProps {
  genres: string[];
  onChange: (genres: string[]) => void;
  maxTags?: number;
  className?: string;
}

export const GenreTagInput: FC<GenreTagInputProps> = ({
  genres,
  onChange,
  maxTags = 10,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const tag = inputValue.trim().toLowerCase();
      if (!genres.includes(tag) && genres.length < maxTags) {
        onChange([...genres, tag]);
      }
      setInputValue('');
    }
    if (e.key === 'Backspace' && !inputValue && genres.length > 0) {
      onChange(genres.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(genres.filter((g) => g !== tag));
  };

  return (
    <div className={[s.wrapper, className].filter(Boolean).join(' ')}>
      <span className={s.label}>Favorite Genres</span>
      <div className={s.tags}>
        {genres.map((genre) => (
          <span key={genre} className={s.tagItem}>
            # {genre}
            <button
              type="button"
              className={s.removeBtn}
              onClick={() => removeTag(genre)}
              aria-label={`Remove ${genre}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <AppInput
        placeholder="Type a genre and press Enter"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={genres.length >= maxTags}
      />
    </div>
  );
};
