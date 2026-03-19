'use client';

import { type FC, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, NotificationIcon, MessageIcon, MoreIcon } from '@/shared/ui/icons';

const FOOTER_LINKS = [
  'Legal', 'Privacy', 'Cookie Policy', 'Cookie Manager',
  'Imprint', 'Artist Resources', 'Newsroom', 'Charts',
  'Transparency Reports',
];

interface SocialPageLayoutProps {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  activeTab: 'likes' | 'following' | 'followers';
  children: ReactNode;
}

export const SocialPageLayout: FC<SocialPageLayoutProps> = ({
  username,
  displayName,
  avatarUrl,
  activeTab,
  children,
}) => {
  const tabs = [
    { key: 'likes', label: 'Likes', href: `/profile/${username}/likes` },
    { key: 'following', label: 'Following', href: `/profile/${username}/following` },
    { key: 'followers', label: 'Followers', href: `/profile/${username}/followers` },
  ] as const;

  return (
    <div style={{ background: 'var(--sc-bg-base)', minHeight: '100vh', color: 'var(--sc-text-primary)', fontFamily: 'var(--sc-font-family)' }}>
      {/* ===== TOP NAV ===== */}
      <header style={{
        background: 'var(--sc-bg-base)',
        height: 46,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--sc-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
          <Link href="/" style={{ color: 'var(--sc-text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
              <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z"/>
            </svg>
          </Link>
          <Link href="/" style={{ color: 'var(--sc-text-secondary)', fontSize: 14, textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--sc-text-secondary)', fontSize: 14, cursor: 'pointer' }}>Feed</span>
          <span style={{ color: 'var(--sc-text-secondary)', fontSize: 14, cursor: 'pointer' }}>Library</span>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              width: '100%', maxWidth: 460, height: 30,
              background: 'var(--sc-bg-elevated)', border: 'none',
              borderRadius: 'var(--sc-radius-md)', padding: '0 12px',
              color: 'var(--sc-text-primary)', fontSize: 13,
              fontFamily: 'var(--sc-font-family)', outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <span style={{ color: 'var(--sc-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Try Artist Pro</span>
          <span style={{ color: 'var(--sc-text-secondary)', fontSize: 13, cursor: 'pointer' }}>For Artists</span>
          <span style={{ color: 'var(--sc-text-secondary)', fontSize: 13, cursor: 'pointer' }}>Upload</span>
          <Link href={`/profile/${username}`}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sc-gray-500)', overflow: 'hidden' }}>
              {avatarUrl && <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
          </Link>
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><ChevronDownIcon size={16} /></button>
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><NotificationIcon size={18} /></button>
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><MessageIcon size={18} /></button>
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><MoreIcon size={18} /></button>
        </div>
      </header>

      {/* ===== AVATAR + TITLE ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '40px 30px 24px', maxWidth: 1240, margin: '0 auto' }}>
        <Link href={`/profile/${username}`} style={{ flexShrink: 0 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--sc-gray-500)', overflow: 'hidden' }}>
            {avatarUrl && <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--sc-text-primary)', margin: 0 }}>
          {activeTab === 'followers' && `Followers of ${displayName}`}
          {activeTab === 'following' && `${displayName} is following`}
          {activeTab === 'likes' && `Likes by ${displayName}`}
        </h1>
      </div>

      {/* ===== TABS ===== */}
      <div style={{ display: 'flex', gap: 0, padding: '0 30px', maxWidth: 1240, margin: '0 auto', borderBottom: '1px solid var(--sc-border)' }}>
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.href}
            style={{
              color: activeTab === tab.key ? 'var(--sc-text-primary)' : 'var(--sc-text-secondary)',
              fontSize: 14,
              padding: '10px 16px',
              borderBottom: activeTab === tab.key ? '2px solid var(--sc-text-primary)' : '2px solid transparent',
              textDecoration: 'none',
              fontFamily: 'var(--sc-font-family)',
              transition: 'color 120ms ease',
            }}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* ===== CONTENT ===== */}
      <div style={{ padding: '40px 30px', maxWidth: 1240, margin: '0 auto', minHeight: 300 }}>
        {children}
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{ padding: '40px 30px 20px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ fontSize: 11, color: 'var(--sc-text-secondary)', lineHeight: 1.8 }}>
          {FOOTER_LINKS.map((link, i) => (
            <span key={link}>
              <span style={{ cursor: 'pointer' }}>{link}</span>
              {i < FOOTER_LINKS.length - 1 && <span> · </span>}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--sc-text-secondary)', marginTop: 12 }}>
          Language: <span style={{ color: 'var(--sc-info)', cursor: 'pointer' }}>English (US)</span>
        </div>
      </div>
    </div>
  );
};
