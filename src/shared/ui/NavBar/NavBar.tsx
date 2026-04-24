'use client';

import { type FC, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { MessageDropdown } from '@/features/messaging/ui/MessageDropdown';
import { ChevronDownIcon, NotificationIcon, MoreIcon } from '@/shared/ui/icons';
import s from './NavBar.module.scss';
import { SearchBar } from '../SearchBar';

export interface NavBarProps {
  onUpload?: () => void;
  className?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
}

export const NavBar: FC<NavBarProps> = ({
  onUpload,
  className,
  searchValue,
  onSearchChange,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    useAuthStore.getState().setUser(null as any);
    router.push(ROUTES.LOGIN);
  };

  return (
  <nav data-testid="navbar" className={[s.navbar, className].filter(Boolean).join(' ')}>
    {/* Left: Logo + Nav Links */}
    <div className={s.leftSection}>
      <Link href={ROUTES.FEED} className={s.logoLink} data-testid="navbar-logo">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="var(--sc-primary)">
          <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z"/>
        </svg>
      </Link>
      <Link href={ROUTES.DASHBOARD} className={`${s.navLink} ${pathname === ROUTES.DASHBOARD ? s.navLinkActive : ''}`} data-testid="navbar-home-link">Home</Link>
      <Link href={ROUTES.FEED} className={`${s.navLink} ${pathname === '/feed' ? s.navLinkActive : ''}`} data-testid="navbar-feed-link">Feed</Link>
      <Link href={ROUTES.LIBRARY} className={`${s.navLink} ${pathname.startsWith('/library') ? s.navLinkActive : ''}`} data-testid="navbar-library-link">Library</Link>
    </div>

    {/* Center: Search */}
    <div className={s.centerSection}>
      <SearchBar value={searchValue} onChange={onSearchChange} />
    </div>

    {/* Right: Actions */}
    <div className={s.rightSection}>
      {isAuthenticated ? (
        <>
          <span className={s.tryProLink}>Try Artist Pro</span>
          <Link href={ROUTES.FOR_ARTISTS} className={s.navTextLink}>For Artists</Link>
          <button className={s.navTextLink} onClick={onUpload} data-testid="navbar-upload-button">Upload</button>
          <Link href={user ? ROUTES.PROFILE((user as any).permalink || user.id) : ROUTES.FEED} data-testid="navbar-user-avatar">
            <div className={s.avatarSmall}>
              {user?.avatarUrl && <img src={user.avatarUrl} alt="avatar" className={s.avatarImg} />}
            </div>
          </Link>

          {/* Dropdown trigger */}
          <div ref={dropdownRef} className={s.dropdownWrapper}>
            <button className={s.iconBtn} onClick={() => setDropdownOpen(!dropdownOpen)} data-testid="navbar-user-dropdown">
              <ChevronDownIcon size={16} />
            </button>

            {dropdownOpen && (
              <div className={s.dropdown}>
                <Link
                  href={user ? ROUTES.PROFILE((user as any).permalink || user.id) : '/'}
                  className={s.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                  data-testid="navbar-dropdown-profile"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </Link>
                <Link
                  href={ROUTES.LIBRARY_LIKES}
                  className={s.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                  data-testid="navbar-dropdown-likes"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  Likes
                </Link>
                <Link
                  href={ROUTES.HISTORY}
                  className={s.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                  data-testid="navbar-dropdown-history"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  History
                </Link>
                <Link
                  href={ROUTES.SETTINGS}
                  className={s.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                  data-testid="navbar-dropdown-settings"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </Link>
                <div className={s.dropdownDivider} />
                <button className={s.dropdownItem} onClick={handleLogout} data-testid="navbar-dropdown-signout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>

          <button className={s.iconBtn} data-testid="navbar-notifications-button"><NotificationIcon size={18} /></button>
          <MessageDropdown buttonClassName={s.iconBtn} />
          <button className={s.iconBtn} data-testid="navbar-more-button"><MoreIcon size={18} /></button>
        </>
      ) : (
        <>
          <Link href={ROUTES.LOGIN} className={s.ghostBtn} data-testid="navbar-signin-button">Sign in</Link>
          <Link href={ROUTES.REGISTER} className={s.primaryBtn} data-testid="navbar-create-account-button">Create account</Link>
          <MessageDropdown buttonClassName={s.iconBtn} />
          <button className={s.iconBtn} data-testid="navbar-more-button"><MoreIcon size={18} /></button>
        </>
      )}
    </div>
  </nav>
  );
};
