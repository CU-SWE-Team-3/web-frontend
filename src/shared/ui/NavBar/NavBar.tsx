'use client';

import { type FC, useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useNotificationStore } from '@/features/notifications/model/useNotificationStore';
import { NotificationDropdown } from '@/features/notifications/ui/NotificationDropdown';
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

  // ── Profile dropdown state ──
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '');

  // ── Mobile hamburger menu state ──
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // ── Sync internal search with external search value (e.g. on navigation) ──
  useEffect(() => {
    if (searchValue !== undefined) {
      setInternalSearch(searchValue);
    }
  }, [searchValue]);

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(query.trim())}`);
  };

  // ── Notification state ──
  const { unreadCount, isDropdownOpen, setDropdownOpen: setNotifDropdownOpen, markAllRead, fetchUnreadCount } = useNotificationStore();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // ── More dropdown state ──
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close more dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  // Close mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMoreOpen(false);
    setMobileMenuOpen(false);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    useAuthStore.getState().setUser(null as any);
    router.push(ROUTES.LOGIN);
  };

  const handleBellClick = useCallback(() => {
    const opening = !isDropdownOpen;
    setNotifDropdownOpen(opening);
    if (opening && unreadCount > 0) {
      markAllRead();
    }
  }, [isDropdownOpen, setNotifDropdownOpen, markAllRead, unreadCount]);

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
      <SearchBar
        value={internalSearch}
        onChange={setInternalSearch}
        onSubmit={handleSearchSubmit}
      />
    </div>

    {/* Right: Actions */}
    <div className={s.rightSection}>
      {isAuthenticated ? (
        <>
          <span className={s.tryProLink}>Try Artist Pro</span>
          <Link href={ROUTES.ARTIST_STUDIO} className={s.navTextLink}>For Artists</Link>
          <button className={s.navTextLink} onClick={onUpload} data-testid="navbar-upload-button">Upload</button>
          <Link href={user ? ROUTES.PROFILE((user as any).permalink || user.id) : ROUTES.FEED} data-testid="navbar-user-avatar">
            <div className={s.avatarSmall}>
              {user?.avatarUrl && <img src={user.avatarUrl} alt="avatar" className={s.avatarImg} />}
            </div>
          </Link>

          {/* ── Profile Dropdown ── */}
          <div ref={dropdownRef} className={s.dropdownWrapper}>
            <button className={s.iconBtn} onClick={() => setDropdownOpen(!dropdownOpen)} data-testid="navbar-user-dropdown">
              <ChevronDownIcon size={16} />
            </button>

            {dropdownOpen && (
              <div className={s.dropdown} data-testid="navbar-profile-dropdown-menu">
                <Link href={user ? ROUTES.PROFILE((user as any).permalink || user.id) : '/'} className={s.dropdownItem} onClick={() => setDropdownOpen(false)} data-testid="navbar-dropdown-profile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Profile
                </Link>
                <Link href={ROUTES.LIBRARY_LIKES} className={s.dropdownItem} onClick={() => setDropdownOpen(false)} data-testid="navbar-dropdown-likes">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  Likes
                </Link>
                <Link href={ROUTES.MY_TRACKS} className={s.dropdownItem} onClick={() => setDropdownOpen(false)} data-testid="navbar-dropdown-tracks">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="2" height="20"/><rect x="9" y="6" width="2" height="16"/><rect x="14" y="4" width="2" height="18"/><rect x="19" y="8" width="2" height="14"/></svg>
                  Tracks
                </Link>
                <Link href={ROUTES.SETTINGS} className={s.dropdownItem} onClick={() => setDropdownOpen(false)} data-testid="navbar-dropdown-insights">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  Settings
                </Link>
                <div className={s.dropdownDivider} />
                <button className={s.dropdownItem} onClick={handleLogout} data-testid="navbar-more-signout">Sign out</button>
              </div>
            )}
          </div>

          {/* ── Notification Bell with Dropdown (M10) ── */}
          <div ref={notifRef} className={s.dropdownWrapper}>
            <button
              className={s.iconBtn}
              onClick={handleBellClick}
              data-testid="navbar-notifications-button"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              style={{ position: 'relative' }}
            >
              <NotificationIcon size={18} />
              {unreadCount > 0 && (
                <span
                  data-testid="notification-unread-dot"
                  className={s.notifDot}
                />
              )}
            </button>
            <NotificationDropdown />
          </div>

          {/* ── Message Dropdown (M9) ── */}
          <MessageDropdown buttonClassName={s.iconBtn} />

          {/* ── More (3-dots) Dropdown ── */}
          <div ref={moreRef} className={s.dropdownWrapper}>
            <button
              className={`${s.iconBtn} ${s.desktopOnlyIcon}`}
              onClick={() => setMoreOpen(!moreOpen)}
              data-testid="navbar-more-button"
            >
              <MoreIcon size={18} />
            </button>

            {moreOpen && (
              <div className={`${s.dropdown} ${s.moreDropdown}`} data-testid="navbar-more-dropdown-menu">
                <Link href="#" className={s.dropdownItem} onClick={() => setMoreOpen(false)} data-testid="navbar-more-about">About us</Link>
                <Link href="#" className={s.dropdownItem} onClick={() => setMoreOpen(false)} data-testid="navbar-more-legal">Legal</Link>
                <Link href="#" className={s.dropdownItem} onClick={() => setMoreOpen(false)} data-testid="navbar-more-copyright">Copyright</Link>
                <div className={s.dropdownDivider} />
                <Link href="#" className={s.dropdownItem} onClick={() => setMoreOpen(false)} data-testid="navbar-more-mobile-apps">Mobile apps</Link>
                <Link href={ROUTES.ARTIST_STUDIO} className={s.dropdownItem} onClick={() => setMoreOpen(false)} data-testid="navbar-more-artist-membership">Artist Membership</Link>
                <div className={s.dropdownDivider} />
                <Link href={ROUTES.SETTINGS} className={s.dropdownItem} onClick={() => setMoreOpen(false)} data-testid="navbar-more-settings">Settings</Link>
                <button className={s.dropdownItem} onClick={handleLogout} data-testid="navbar-more-signout">Sign out</button>
              </div>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <div ref={mobileMenuRef} className={s.mobileMenuWrapper}>
            <button
              className={s.hamburgerBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              data-testid="navbar-hamburger"
            >
              <span className={`${s.hamburgerLine} ${mobileMenuOpen ? s.hamburgerLineOpen1 : ''}`} />
              <span className={`${s.hamburgerLine} ${mobileMenuOpen ? s.hamburgerLineOpen2 : ''}`} />
              <span className={`${s.hamburgerLine} ${mobileMenuOpen ? s.hamburgerLineOpen3 : ''}`} />
            </button>

            {mobileMenuOpen && (
              <div className={s.mobileMenu} data-testid="navbar-mobile-menu">
                <Link href={ROUTES.DASHBOARD} className={s.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link href={ROUTES.FEED} className={s.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>Feed</Link>
                <Link href={ROUTES.LIBRARY} className={s.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>Library</Link>
                <div className={s.mobileDivider} />
                <Link href={ROUTES.ARTIST_STUDIO} className={s.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>For Artists</Link>
                <button className={s.mobileMenuItem} onClick={() => { setMobileMenuOpen(false); onUpload?.(); }}>Upload</button>
                <Link href={user ? ROUTES.PROFILE((user as any).permalink || user.id) : '/'} className={s.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <Link href={ROUTES.MY_TRACKS} className={s.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>My Tracks</Link>
                <Link href={ROUTES.SETTINGS} className={s.mobileMenuItem} onClick={() => setMobileMenuOpen(false)}>Settings</Link>
                <div className={s.mobileDivider} />
                <button className={`${s.mobileMenuItem} ${s.mobileMenuItemDanger}`} onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
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
