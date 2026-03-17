// app/page.tsx — SoundCloud Clone Landing Page
// This is the very first page users see.
// It matches the SoundCloud homepage screenshot with:
//  1. Announcement banner (top)
//  2. Navigation bar (logo + Sign in / Create account)
//  3. Hero slider (background image + text)
//  4. Search bar + Upload CTA
//  5. "Trending" section header

import Link from 'next/link'
import HeroSlider from './components/Register/HeroSlider'
import { ROUTES } from '@/shared/constants/routes'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#111111] text-white font-[var(--font-inter)]">

      {/* ── 1. Announcement Banner ───────────────────────────────────────── */}
      <div className="bg-[#1a1a1a] border-b border-[#333] py-2 px-4 text-center text-xs text-gray-300 flex items-center justify-center gap-2">
        <span className="text-[#ff5500] font-bold text-sm">↑</span>
        <span>
          <strong>Now available:</strong> Get heard by up to 100 listeners on your next upload with Artist or Artist Pro.{' '}
          <span className="text-[#ff5500] hover:underline cursor-pointer font-medium">Learn More</span>
        </span>
        <button className="ml-auto text-gray-500 hover:text-white text-base leading-none">×</button>
      </div>

      {/* ── 2. Navigation Bar ────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 py-3 bg-[#111111]">
        {/* Logo — left side */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="white" aria-label="SoundCloud">
            <path d="M1.28 21.76a3.2 3.2 0 106.4 0v-6.4a3.2 3.2 0 00-6.4 0v6.4zM8.96 21.76a3.2 3.2 0 106.4 0v-9.6a3.2 3.2 0 00-6.4 0v9.6zM16.64 21.76a3.2 3.2 0 106.4 0V8.96a3.2 3.2 0 00-6.4 0v12.8zM24.32 21.76a3.2 3.2 0 106.4 0V6.4a3.2 3.2 0 00-6.4 0v15.36z"/>
          </svg>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">SoundCloud</span>
        </Link>

        {/* Auth buttons — right side */}
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.LOGIN}
            className="text-white text-sm font-medium px-4 py-1.5 rounded-sm hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.REGISTER}
            className="bg-[#ff5500] hover:bg-[#e64d00] text-white text-sm font-bold px-4 py-1.5 rounded-sm transition-colors"
          >
            Create account
          </Link>
          <button className="text-white text-sm font-medium px-4 py-1.5 rounded-sm border border-white/30 hover:border-white/60 transition-colors hidden md:block">
            For Artists
          </button>
        </div>
      </nav>

      {/* ── 3. Hero Slider ──────────────────────────────────────────────── */}
      {/* This is the big background image slider you already built */}
      <div className="px-4 py-4 max-w-[1240px] mx-auto">
        <HeroSlider />
      </div>

      {/* ── 4. Search Bar + Upload CTA ──────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 px-4 py-6 max-w-[800px] mx-auto">
        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for artists, bands, tracks, podcasts"
            className="w-full h-10 pl-4 pr-10 bg-white text-black text-sm rounded-full outline-none focus:ring-2 focus:ring-[#ff5500] placeholder:text-gray-400"
          />
          {/* Search icon */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
        </div>

        <span className="text-gray-400 text-sm shrink-0">or</span>

        {/* Upload CTA */}
        <Link
          href={ROUTES.REGISTER}
          className="shrink-0 px-5 h-10 flex items-center border border-white/40 hover:border-white text-white text-sm font-medium rounded-full transition-colors"
        >
          Upload your own
        </Link>
      </div>

      {/* ── 5. Trending Section Header ──────────────────────────────────── */}
      <div className="text-center py-4 px-4">
        <h2 className="text-white text-xl font-bold">
          Hear what&apos;s trending for free in the SoundCloud community
        </h2>
      </div>

    </div>
  )
}
