'use client';

import { type FC, type ChangeEventHandler, type KeyboardEvent, useState, useCallback } from 'react';
import s from './SearchBar.module.scss';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  /** Called when the user submits a search (presses Enter or clicks the search icon). */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: FC<SearchBarProps> = ({
  value: controlledValue,
  onChange,
  onSubmit,
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

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim().length > 0) {
      onSubmit?.(value.trim());
    }
  }, [onSubmit, value]);

  const handleSearchClick = useCallback(() => {
    if (value.trim().length > 0) {
      onSubmit?.(value.trim());
    }
  }, [onSubmit, value]);

  return (
    <div data-testid="navbar-search-bar" className={[s.wrap, className].filter(Boolean).join(' ')}>
      <button
        className={s.searchIcon}
        onClick={handleSearchClick}
        aria-label="Search"
        data-testid="navbar-search-submit-button"
        style={{ background: 'none', border: 'none', cursor: value.trim() ? 'pointer' : 'default', padding: 0 }}
      >
        🔍
      </button>
      <input
        data-testid="navbar-search-input"
        className={s.input}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
