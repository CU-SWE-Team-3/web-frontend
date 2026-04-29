'use client';
// component-id: ArtistProPage_001

import React, { useCallback, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { FEATURE_SECTIONS } from '@/features/subscription/types';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import s from './ArtistProPage.module.scss';

const HERO_FEATURES = [
  {
    icon: '📡',
    name: 'Grow your audience',
    desc: 'Add your tracks to algorithmically generated playlists and get your music in front of more fans on BioBeats and beyond.',
  },
  {
    icon: '📊',
    name: 'Know your audience',
    desc: 'Get access to advanced statistics and see how fans are finding your music, your top fans, and where they\'re located.',
  },
  {
    icon: '∞',
    name: 'Upload unlimited tracks',
    desc: 'Upload as many tracks as you want with no limits on upload size or track length. Reach your fans on mobile and desktop.',
  },
  {
    icon: '💸',
    name: 'Distribution is included',
    desc: 'Send your songs to Spotify, Apple Music, TikTok, and 50+ stores. Keep 100% of your royalties, and use BioBeats for free.',
  },
];

export default function ArtistProPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
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

  // Routes to Artist plan specifically
  const handleGetArtist = useCallback(() => {
    router.push(`${ROUTES.PAYMENT}?plan=Artist`);
  }, [router]);

  // Routes to Artist Pro plan (default)
  const handleGetArtistPro = useCallback(() => {
    router.push(ROUTES.PAYMENT);
  }, [router]);

  const renderCellValue = (value: string | null, isProCol = false) => {
    if (value === null) {
      return <span className={s.compareNotAvailable}>- Not Available -</span>;
    }
    if (value === 'Available') {
      return (
        <span className={s.compareAvailable}>
          Available <span>✅</span>
        </span>
      );
    }
    if (value === 'ARTIST PRO') {
      return <span className={s.compareProBadge}>⭐ ARTIST PRO</span>;
    }
    if (value === 'ARTIST') {
      return <span className={s.compareArtistBadge}>🎵 ARTIST</span>;
    }
    if (isProCol) {
      return <span className={s.compareHighlight}>{value}</span>;
    }
    return <span style={{ fontSize: '12px', color: '#555' }}>{value}</span>;
  };

  return (
    <div className={s.page} data-testid="artist-pro-page">

      {/* ── BioBeats Nav Bar ── */}
      <header className={s.navBar} data-testid="artist-pro-navbar">
        <Link href={ROUTES.HOME} className={s.navLogoLink} data-testid="artist-pro-logo">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="#ff5500">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z" />
          </svg>
          <span className={s.navBrandText}>BioBeats</span>
        </Link>

        {user && (
          <div ref={dropdownRef} className={s.navProfileWrapper} data-testid="artist-pro-user-info">
            <button
              className={s.navProfileBtn}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              data-testid="artist-pro-profile-btn"
            >
              <div className={s.navAvatar}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt={user.displayName} />
                  : <span className={s.navAvatarInitial}>{user.displayName?.[0]?.toUpperCase()}</span>
                }
              </div>
              <span className={s.navUserName}>{user.displayName}</span>
              <span className={s.navChevron}>▾</span>
            </button>
            {dropdownOpen && (
              <div className={s.navDropdown} data-testid="artist-pro-profile-dropdown">
                <button
                  className={s.navDropdownItem}
                  onClick={handleSignOut}
                  data-testid="artist-pro-signout-btn"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className={s.hero} data-testid="artist-pro-hero">
        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>
            <span className={s.heroEmoji}>🎙️</span>
            Join millions of artists that use BioBeats to get heard.
          </p>
          <h1 className={s.heroTitle} data-testid="artist-pro-title">
            Reach more listeners.
          </h1>
          <p className={s.heroSubtitle}>
            Get the tools you need to grow your audience and make money from your music.
          </p>
          <div className={s.heroActions}>
            <button
              id="artist-pro-get-cta"
              data-testid="artist-pro-get-btn"
              className={s.btnPrimary}
              onClick={handleGetArtistPro}
            >
              Get Artist Pro
            </button>
            <button
              id="artist-pro-all-plans"
              data-testid="artist-pro-all-plans-btn"
              className={s.btnSecondary}
              onClick={() => {
                document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              All plans
            </button>
          </div>
        </div>
        <div className={s.heroImage}>
          <div className={s.heroVisual} aria-hidden="true">
            <span className={s.heroVisualIcon}>🎧</span>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <div className={s.features} data-testid="artist-pro-features">
        {HERO_FEATURES.map((f) => (
          <div key={f.name} className={s.featureItem} data-testid="artist-pro-feature-item">
            <div className={s.featureIcon}>{f.icon}</div>
            <p className={s.featureName}>{f.name}</p>
            <p className={s.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* ── Available Plans ── */}
      <section className={s.plansBg} id="plans-section">
        <div className={s.plansSection} data-testid="artist-pro-plans">
          <h2 className={s.sectionTitle} data-testid="artist-pro-plans-title">
            Available plans.
          </h2>
          <div className={s.planCards}>
            {/* Artist Plan */}
            <div className={s.planCard} data-testid="plan-card-artist">
              <div className={s.planNameRow}>
                <span className={s.planName}>Artist</span>
                <span className={s.planBadgeIcon}>🎵</span>
              </div>
              <p className={s.planDesc}>Lots of cool tools for your artist hub</p>
              <p className={s.planPrice}>
                EGP 29.99 <span>/ month, billed yearly for EGP 359.88</span>
              </p>
              <p className={s.planYearly}>or EGP 29.99 / month billed monthly</p>
              <button
                data-testid="plan-card-artist-cta"
                className={`${s.planCtaBtn} ${s.outline}`}
                onClick={handleGetArtist}
              >
                Get started
              </button>
              <ul className={s.planFeatures}>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>2 hours upload</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Promote tracks and get 100+ listeners</span>
                  <span className={`${s.planFeaturePro} ${s.green}`}>2 TRACKS</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Full 5+ monetize tracks</span>
                  <span className={`${s.planFeaturePro} ${s.orange}`}>2 TRACKS</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Approve track brand or brand link</span>
                  <span className={`${s.planFeaturePro} ${s.red}`}>2 TRACKS</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>AI Clearing</span>
                  <span className={`${s.planFeaturePro} ${s.green}`}>1 MONTH</span>
                </li>
              </ul>
            </div>

            {/* Artist Pro Plan */}
            <div className={`${s.planCard} ${s.featured}`} data-testid="plan-card-artist-pro">
              <span className={s.popularBadge}>MOST POPULAR</span>
              <div className={s.planNameRow}>
                <span className={s.planName}>Artist Pro</span>
                <span className={s.planBadgeIcon}>⭐</span>
              </div>
              <p className={s.planDesc}>Lots of cool tools for your artist hub</p>
              <p className={`${s.planPrice} ${s.pro}`}>
                EGP 74.99 <span>/ month, billed yearly for EGP 899.88</span>
              </p>
              <p className={s.planYearly}>or EGP 74.99 / month billed monthly</p>
              <button
                id="artist-pro-plan-cta"
                data-testid="plan-card-pro-cta"
                className={`${s.planCtaBtn} ${s.solid}`}
                onClick={handleGetArtistPro}
              >
                Get started
              </button>
              <ul className={s.planFeatures}>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Unlimited upload</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Promote tracks and get 100+ listeners</span>
                  <span className={`${s.planFeaturePro} ${s.green}`}>UNLIMITED</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Full 5+ monetize tracks</span>
                  <span className={`${s.planFeaturePro} ${s.green}`}>UNLIMITED</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Approve track brand or brand link</span>
                  <span className={`${s.planFeaturePro} ${s.green}`}>UNLIMITED</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>AI Clearing</span>
                  <span className={`${s.planFeaturePro} ${s.green}`}>3 MONTHS</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>+ 6 more</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Audience retention analytics</span>
                </li>
                <li className={s.planFeatureItem}>
                  <span className={s.planFeatureCheck}>✓</span>
                  <span>Comments hub management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Compare Features ── */}
      <section className={s.compareSection} data-testid="artist-pro-compare">
        <h2 className={s.compareTitle} data-testid="artist-pro-compare-title">
          Compare features.
        </h2>
        <div className={s.compareTable}>
          {/* Header row */}
          <div className={s.compareHeader}>
            <div className={s.compareHeaderEmpty} />
            <div className={s.compareHeaderPlan}>
              <p className={s.comparePlanName}>Basic</p>
              <p className={s.comparePlanPrice}>Free</p>
              <button className={`${s.compareGetStartedBtn} ${s.current}`} disabled>
                Current plan
              </button>
            </div>
            <div className={s.compareHeaderPlan}>
              <p className={s.comparePlanName}>Artist</p>
              <p className={s.comparePlanPrice}>EGP 29.99 / month, billed yearly for EGP 359.88</p>
              <button
                data-testid="compare-artist-cta"
                className={`${s.compareGetStartedBtn}`}
                onClick={handleGetArtist}
              >
                Get started
              </button>
            </div>
            <div className={s.compareHeaderPlan}>
              <p className={`${s.comparePlanName} ${s.proName}`}>Artist Pro</p>
              <p className={s.comparePlanPrice}>EGP 74.99 / month, billed yearly for EGP 899.88</p>
              <button
                data-testid="compare-pro-cta"
                className={`${s.compareGetStartedBtn} ${s.solid}`}
                onClick={handleGetArtistPro}
              >
                Get started
              </button>
            </div>
          </div>

          {/* Feature sections */}
          {FEATURE_SECTIONS.map((section) => (
            <div key={section.title} data-testid={`compare-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <h3 className={s.compareSectionTitle}>{section.title}</h3>
              {section.rows.map((row) => (
                <div key={row.name} className={s.compareRow} data-testid="compare-row">
                  <div>
                    <p className={s.compareFeatureName}>{row.name}</p>
                    {row.description && (
                      <p className={s.compareFeatureDesc}>{row.description}</p>
                    )}
                  </div>
                  <div className={s.compareCell}>{renderCellValue(row.basic)}</div>
                  <div className={s.compareCell}>{renderCellValue(row.artist)}</div>
                  <div className={s.compareCell}>{renderCellValue(row.pro, true)}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={s.footer} data-testid="artist-pro-footer">
        <div className={s.footerSignIn}>
          Signed in as User.{' '}
          <Link href={ROUTES.LOGIN} data-testid="artist-pro-footer-signout">
            Sign out
          </Link>
        </div>
        <div className={s.footerLinks}>
          {['Legal', 'Privacy', 'Cookies', 'Consent Manager', 'Imprint', 'Help Center'].map(
            (label) => (
              <span key={label} className={s.footerLink}>
                {label}
              </span>
            )
          )}
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
