'use client';
// component-id: GoPlusPage_001

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ROUTES } from '@/shared/constants/routes';
import s from './GoPlus.module.scss';

export default function GoPlusPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className={s.page} data-testid="goplus-page">
      {/* ── Header ── */}
      <header className={s.header}>
        <Link href={ROUTES.HOME} className={s.logoLink} data-testid="goplus-logo">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="#ff5500">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
          </svg>
          <span className={s.logoText}>BioBeats</span>
        </Link>

        {user && (
          <div ref={dropdownRef} className={s.profileWrapper} data-testid="goplus-user-info">
            <button
              className={s.profileBtn}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              data-testid="goplus-profile-btn"
            >
              <div className={s.userAvatar}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.displayName} />
                  : <span className={s.avatarInitial}>{user.displayName?.[0]?.toUpperCase()}</span>
                }
              </div>
              <span className={s.userName}>{user.displayName}</span>
              <span className={s.chevron}>▾</span>
            </button>
            {dropdownOpen && (
              <div className={s.profileDropdown} data-testid="goplus-profile-dropdown">
                <button
                  className={s.profileDropdownItem}
                  onClick={handleSignOut}
                  data-testid="goplus-signout-btn"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Hero Banner ── */}
      <section className={s.heroBanner} data-testid="goplus-hero">
        <div className={s.heroContent}>
          <h1 className={s.heroHeadline} data-testid="goplus-hero-title">
            GET 3 MONTHS OF<br />GO+ FOR $0.99
          </h1>
          <p className={s.heroSubtext}>
            With every track, ad-free and offline, you can spend all summer discovering new
            music. Offer valid for a limited time only.
          </p>
          <Link
            href={`${ROUTES.PAYMENT}?plan=Go%2B`}
            className={s.heroCta}
            data-testid="goplus-start-listening-btn"
          >
            Get 3 months of Go+ for $0.99
          </Link>
          <p className={s.heroNote}>$9.99/month after 90 days. Restrictions apply**</p>
        </div>
      </section>

      {/* ── Content ── */}
      <div className={s.content} data-testid="goplus-content">

        {/* Section 1 — What you get */}
        <h2 className={s.sectionTitle}>EVERYTHING YOU LOVE, UNLOCKED</h2>
        <div className={s.sectionAccent} />
        <p className={s.sectionText}>
          BioBeats Go+ was built for listeners who refuse to compromise. Since launching in 2021,
          Go+ has given millions of fans uninterrupted access to the world&apos;s largest catalogue of
          independent music — completely ad-free, with crystal-clear audio quality. Stream any track,
          any time, without a single interruption. Download your favourites and take them with you
          wherever the day takes you, no Wi-Fi required.
        </p>

        {/* Features grid */}
        <div className={s.featuresGrid}>
          {[
            { icon: '🚫', title: 'Zero Ads', desc: 'Listen to millions of tracks back-to-back with no interruptions, ever.' },
            { icon: '📥', title: 'Offline Listening', desc: 'Download tracks and playlists to enjoy anywhere — plane, gym, subway.' },
            { icon: '🎵', title: '320kbps Audio', desc: 'Experience music the way artists intended with high-fidelity streaming.' },
            { icon: '⏭️', title: 'Unlimited Skips', desc: 'Skip as many times as you want. Your ears, your rules.' },
            { icon: '🎙️', title: '320M+ Tracks', desc: 'Access the world\'s largest independent music catalogue, updated daily.' },
            { icon: '💸', title: 'Fan-Powered Royalties', desc: 'Your streams go directly to the artists you actually listen to most.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className={s.featureCard}>
              <span className={s.featureIcon}>{icon}</span>
              <h3 className={s.featureTitle}>{title}</h3>
              <p className={s.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Section 2 — The story */}
        <h2 className={s.sectionTitle}>THE STORY BEHIND GO+</h2>
        <div className={s.sectionAccent} />
        <p className={s.sectionText} style={{ marginBottom: 0 }}>
          Independent artists deserve to be heard — and their biggest fans deserve the best possible
          experience. That&apos;s why we created Go+. Unlike traditional streaming platforms that pay
          fractions of a cent regardless of who listens, Go+ introduced <strong>fan-powered royalties</strong>:
          a revolutionary model where 100% of your subscription goes directly to the artists in your
          own listening history. The more you stream, the more your favourite independent creators earn.
          Go+ isn&apos;t just a subscription — it&apos;s a direct connection between you and the music you love.
        </p>
      </div>

      {/* ── Footer ── */}
      <footer className={s.footer} data-testid="goplus-footer">
        <div className={s.footerSignIn}>
          Signed in as {user?.displayName ?? 'User'}.{' '}
          <button className={s.footerSignOutBtn} onClick={handleSignOut} data-testid="goplus-footer-signout">
            sign out
          </button>
        </div>
        <div className={s.footerLinks}>
          {['Legal', 'Privacy', 'Cookies', 'Consent Manager', 'Imprint', 'Help Center'].map((label) => (
            <span key={label} className={s.footerLink}>{label}</span>
          ))}
        </div>
        <div className={s.footerLang}>
          Language:
          <select defaultValue="en">
            <option value="en">English (US)</option>
          </select>
        </div>
      </footer>
    </div>
  );
}
