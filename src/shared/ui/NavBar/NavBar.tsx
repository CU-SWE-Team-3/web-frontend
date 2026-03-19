import { type FC, type ReactNode } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import s from './NavBar.module.scss';
import { SearchBar } from '../SearchBar';
import { SoundCloudLogo } from '../Brand';

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
    <Link href={ROUTES.FEED}>
      <div className={s.logo}>
        <SoundCloudLogo size={36} color="var(--sc-primary)" />
        <span className={s.logoText}>SOUNDCLOUD</span>
      </div>
    </Link>

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
          <Link href={ROUTES.LOGIN} className={s.ghostBtn}>Sign in</Link>
          <Link href={ROUTES.REGISTER} className={s.primaryBtn}>Create account</Link>
        </>
      )}
    </div>
  </nav>
);
