'use client';

import { type FC, type ChangeEventHandler, type KeyboardEvent, useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchRepository } from '@/features/search/api/searchRepository';
import type { SearchResults, TrackResult, UserResult } from '@/features/search/model/types';
import { ROUTES } from '@/shared/constants/routes';
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
  const router = useRouter();
  const [internal, setInternal] = useState(controlledValue ?? '');
  const [suggestions, setSuggestions] = useState<SearchResults | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync internal state with controlledValue when it changes (e.g. navigation)
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternal(controlledValue);
    }
  }, [controlledValue]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (internal.trim().length < 2) {
      setSuggestions(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchRepository.autocomplete(internal);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions(null);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [internal]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const v = e.target.value;
    setInternal(v);
    onChange?.(v);
    setShowSuggestions(true);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setInternal('');
    onChange?.('');
    setSuggestions(null);
    setShowSuggestions(false);
  }, [onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      if (internal.trim().length > 0) {
        onSubmit?.(internal.trim());
      }
    }
  }, [onSubmit, internal]);

  const handleSearchClick = useCallback(() => {
    setShowSuggestions(false);
    if (internal.trim().length > 0) {
      onSubmit?.(internal.trim());
    }
  }, [onSubmit, internal]);

  const handleSuggestionClick = (type: 'track' | 'user', item: any) => {
    setShowSuggestions(false);
    if (type === 'track') {
      router.push(ROUTES.TRACK(item.permalink || item._id));
    } else {
      router.push(ROUTES.PROFILE(item.permalink || item._id));
    }
  };

  const hasSuggestions = suggestions && (suggestions.tracks.length > 0 || suggestions.users.length > 0);

  return (
    <div 
      ref={wrapRef}
      data-testid="navbar-search-bar" 
      className={[s.wrap, className].filter(Boolean).join(' ')}
    >
      <button
        className={s.searchIcon}
        onClick={handleSearchClick}
        aria-label="Search"
        data-testid="navbar-search-submit-button"
        style={{ background: 'none', border: 'none', cursor: internal.trim() ? 'pointer' : 'default', padding: 0 }}
      >
        🔍
      </button>
      <input
        data-testid="navbar-search-input"
        className={s.input}
        type="text"
        value={internal}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => internal.length >= 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {internal.length > 0 && (
        <button className={s.clearBtn} onClick={handleClear} aria-label="Clear search" data-testid="navbar-search-clear-button">
          ✕
        </button>
      )}

      {showSuggestions && hasSuggestions && (
        <div className={s.suggestions}>
          {suggestions.tracks.slice(0, 5).map((t: TrackResult) => (
            <button key={t._id} className={s.suggestionItem} onClick={() => handleSuggestionClick('track', t)}>
              <img src={t.artworkUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=32&h=32&fit=crop'} alt="" className={s.suggestionThumb} />
              <div className={s.suggestionTitle}>{t.title}</div>
              <div className={s.suggestionType}>Track</div>
            </button>
          ))}
          {suggestions.users.slice(0, 3).map((u: UserResult) => (
            <button key={u._id} className={s.suggestionItem} onClick={() => handleSuggestionClick('user', u)}>
              <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop'} alt="" className={s.suggestionThumb} style={{ borderRadius: '50%' }} />
              <div className={s.suggestionTitle}>{u.displayName}</div>
              <div className={s.suggestionType}>Artist</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
