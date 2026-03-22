'use client';

import { type FC, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui';
import { ROUTES } from '@/shared/constants/routes';

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
  const router = useRouter();
  const tabs = [
    { key: 'likes', label: 'Likes', href: `/profile/${username}/likes` },
    { key: 'following', label: 'Following', href: `/profile/${username}/following` },
    { key: 'followers', label: 'Followers', href: `/profile/${username}/followers` },
  ] as const;

  return (
    <div style={{ background: 'var(--sc-bg-base)', minHeight: '100vh', color: 'var(--sc-text-primary)', fontFamily: 'var(--sc-font-family)' }}>
      {/* ===== TOP NAV (shared) ===== */}
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

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
