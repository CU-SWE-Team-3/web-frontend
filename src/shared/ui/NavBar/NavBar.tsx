import { type FC, type ReactNode } from 'react';
import s from './NavBar.module.scss';
import { SearchBar } from '../SearchBar';
import { BiobeatsLogo } from '../Brand';

export interface NavBarProps {
  isLoggedIn?: boolean;
  avatarSlot?: ReactNode;
  bellSlot?: ReactNode;
  onUpload?: () => void;
  onSignIn?: () => void;
  onCreateAccount?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  className?: string;
}

export const NavBar: FC<NavBarProps> = ({
  isLoggedIn = false,
  avatarSlot,
  bellSlot,
  onUpload,
  onSignIn,
  onCreateAccount,
  searchValue,
  onSearchChange,
  className,
}) => (
  <nav className={[s.navbar, className].filter(Boolean).join(' ')}>
    {/* Logo */}
    <div className={s.logo}>
      <BiobeatsLogo size={36} color="var(--sc-primary)" />
      <span className={s.logoText}>BIOBEATS</span>
    </div>

    {/* Search */}
    <div className={s.searchWrap}>
      <SearchBar value={searchValue} onChange={onSearchChange} />
    </div>

    {/* Right actions */}
    <div className={s.actions}>
      {isLoggedIn ? (
        <>
          <button className={s.uploadBtn} onClick={onUpload}>Upload</button>
          {bellSlot}
          {avatarSlot}
        </>
      ) : (
        <>
          <button className={s.ghostBtn} onClick={onSignIn}>Sign in</button>
          <button className={s.primaryBtn} onClick={onCreateAccount}>Create account</button>
        </>
      )}
    </div>
  </nav>
);
