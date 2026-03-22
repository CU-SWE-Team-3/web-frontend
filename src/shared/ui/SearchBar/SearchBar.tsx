'use client';

import { type FC, type ChangeEventHandler, useState, useCallback } from 'react';
import s from './SearchBar.module.scss';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  placeholder = 'Search for artists, bands, tracks, podcasts',
  className,
}) => {
  const [internal, setInternal] = useState('');
  const value = controlledValue ?? internal;

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const v = e.target.value;
    setInternal(v);
    onChange?.(v);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setInternal('');
    onChange?.('');
  }, [onChange]);

  return (
    <div data-testid="navbar-search-bar" className={[s.wrap, className].filter(Boolean).join(' ')}>
      <span className={s.searchIcon}>🔍</span>
      <input
        data-testid="navbar-search-input"
        className={s.input}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <button className={s.clearBtn} onClick={handleClear} aria-label="Clear search" data-testid="navbar-search-clear-button">
          ✕
        </button>
      )}
    </div>
  );
};
