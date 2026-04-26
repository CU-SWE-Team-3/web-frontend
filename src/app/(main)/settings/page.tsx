'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BlockedUsersList } from '@/features/social-graph';
import { NotificationSettingsTab } from '@/features/notifications';
import { ChevronDownIcon, NotificationIcon, MessageIcon, MoreIcon } from '@/shared/ui/icons';

/* ─── Tabs ─── */
const TABS = [
  { key: 'account', label: 'Account' },
  { key: 'content', label: 'Content' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'privacy', label: 'Privacy' },
  { key: 'advertising', label: 'Advertising' },
  { key: '2fa', label: '2FA' },
] as const;

type TabKey = typeof TABS[number]['key'];

/* ─── Toggle ─── */
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    data-testid={undefined}
    style={{
      width: 44, height: 24, borderRadius: 12,
      background: checked ? 'var(--sc-primary)' : 'var(--sc-gray-500)',
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 200ms',
      flexShrink: 0,
    }}
  >
    <span style={{
      position: 'absolute', top: 2, left: checked ? 22 : 2,
      width: 20, height: 20, borderRadius: '50%', background: '#fff',
      transition: 'left 200ms',
    }} />
  </button>
);

/* ─── Privacy tab content ─── */
const PrivacyTab = () => {
  const [msgAnyone, setMsgAnyone] = useState(false);
  const [showActivities, setShowActivities] = useState(true);
  const [showTopFan, setShowTopFan] = useState(true);
  const [showFirstTopFans, setShowFirstTopFans] = useState(true);

  return (
    <div data-testid="settings-privacy-tab">
      <h2 style={{ color: 'var(--sc-primary)', fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Privacy settings</h2>

      {/* Toggle rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sc-text-primary)', marginBottom: 4 }}>Receive messages from anyone</div>
            <div style={{ fontSize: 12, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>For your safety, we recommend only allowing messages from people you follow. Turning this on will allow anyone to send you messages.</div>
          </div>
          <Toggle checked={msgAnyone} onChange={setMsgAnyone} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sc-text-primary)', marginBottom: 4 }}>Show my activities in social discovery playlists and modules</div>
            <div style={{ fontSize: 12, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>Your Likes, Reactions and other engagement may be shown to other users in discovery features such as &quot;Liked By&quot; playlists or update feeds. Turning this off won&apos;t hide your Likes on your profile or tracks.</div>
          </div>
          <Toggle checked={showActivities} onChange={setShowActivities} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sc-text-primary)', marginBottom: 4 }}>Show when I&apos;m a First or Top Fan</div>
            <div style={{ fontSize: 12, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>Appear in public Top Fans and First Fans lists</div>
          </div>
          <Toggle checked={showTopFan} onChange={setShowTopFan} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sc-text-primary)', marginBottom: 4 }}>Show First and Top Fans for my tracks</div>
            <div style={{ fontSize: 12, color: 'var(--sc-text-secondary)', lineHeight: 1.5 }}>Your First and Top Fans will appear on your tracks</div>
          </div>
          <Toggle checked={showFirstTopFans} onChange={setShowFirstTopFans} />
        </div>
      </div>

      {/* Blocked users section */}
      <div data-testid="settings-blocked-users-list" style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--sc-border)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--sc-text-primary)', marginBottom: 16 }}>Blocked users</h3>
        <BlockedUsersList />
      </div>
    </div>
  );
};

/* ─── Placeholder for other tabs ─── */
const PlaceholderTab = ({ name }: { name: string }) => (
  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--sc-text-secondary)', fontSize: 15 }}>
    {name} settings coming soon.
  </div>
);

/* ─── Main Settings Page ─── */
function SettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<TabKey>((tabParam as TabKey) || 'privacy');

  const renderTab = () => {
    switch (activeTab) {
      case 'privacy': return <PrivacyTab />;
      case 'account': return <PlaceholderTab name="Account" />;
      case 'content': return <PlaceholderTab name="Content" />;
      case 'notifications': return <NotificationSettingsTab />;
      case 'advertising': return <PlaceholderTab name="Advertising" />;
      case '2fa': return <PlaceholderTab name="2FA" />;
      default: return <PrivacyTab />;
    }
  };

  return (
    <div data-testid="settings-page" style={{ background: 'var(--sc-bg-base)', minHeight: '100vh', color: 'var(--sc-text-primary)', fontFamily: 'var(--sc-font-family)' }}>
      {/* ===== TOP NAV ===== */}
      <header data-testid="settings-nav" style={{
        background: 'var(--sc-bg-base)', height: 46,
        display: 'flex', alignItems: 'center', padding: '0 20px',
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
          <input type="text" placeholder="Search" data-testid="settings-search-input" style={{
            width: '100%', maxWidth: 460, height: 30,
            background: 'var(--sc-bg-elevated)', border: 'none',
            borderRadius: 'var(--sc-radius-md)', padding: '0 12px',
            color: 'var(--sc-text-primary)', fontSize: 13,
            fontFamily: 'var(--sc-font-family)', outline: 'none',
          }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <span style={{ color: 'var(--sc-primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Try Artist Pro</span>
          <span style={{ color: 'var(--sc-text-secondary)', fontSize: 13, cursor: 'pointer' }}>For Artists</span>
          <span style={{ color: 'var(--sc-text-secondary)', fontSize: 13, cursor: 'pointer' }}>Upload</span>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--sc-gray-500)' }} />
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><ChevronDownIcon size={16} /></button>
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><NotificationIcon size={18} /></button>
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><MessageIcon size={18} /></button>
          <button style={{ color: 'var(--sc-text-secondary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><MoreIcon size={18} /></button>
        </div>
      </header>

      {/* ===== ANNOUNCEMENT BANNER ===== */}
      <div style={{
        background: 'var(--sc-bg-surface)', display: 'flex', alignItems: 'center',
        padding: '8px 20px', fontSize: 13, color: 'var(--sc-text-secondary)', gap: 10,
      }}>
        <span style={{ fontSize: 16 }}>⚡</span>
        <span style={{ flex: 1 }}>
          Uploading tracks just got way easier: upload, get heard, and get paid in one seamless experience.{' '}
          <span style={{ color: 'var(--sc-primary)', cursor: 'pointer', fontWeight: 500 }}>Try it out</span>
        </span>
      </div>

      {/* ===== SETTINGS CONTAINER ===== */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '30px 20px' }}>
        <h1 data-testid="settings-title" style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Settings</h1>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--sc-border)', marginBottom: 30 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              data-testid={`settings-tab-${tab.key}`}
              style={{
                color: activeTab === tab.key ? 'var(--sc-text-primary)' : 'var(--sc-text-secondary)',
                fontSize: 13,
                padding: '10px 16px',
                borderBottom: activeTab === tab.key ? '2px solid var(--sc-text-primary)' : '2px solid transparent',
                background: 'none',
                border: 'none',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: activeTab === tab.key ? 'var(--sc-text-primary)' : 'transparent',
                fontFamily: 'var(--sc-font-family)',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? 600 : 400,
                transition: 'color 120ms ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        {renderTab()}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--sc-bg-base)' }} />}>
      <SettingsContent />
    </Suspense>
  );
}
