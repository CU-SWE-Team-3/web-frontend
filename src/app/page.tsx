'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import HeroSlider from '@/widgets/Register/HeroSlider'
import { ROUTES } from '@/shared/constants/routes'
import { useAuthStore } from '@/features/auth/model/useAuthStore'
import { useEffect } from 'react'
import { TrendingByGenre } from '@/features/trending'

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.DASHBOARD)
    }
  }, [isAuthenticated, router])

  const handleSearch = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isAuthenticated) return null // Prevent flashing of landing page

  return (
    <div data-testid="landing-page" className="min-h-screen bg-[#111111] text-white">
      {/* Announcement Banner */}
      <div data-testid="announcement-banner" className="bg-[#1a1a1a] border-b border-[#333] py-2 px-4 text-center text-xs text-gray-300 flex items-center justify-center gap-2">
        <span className="text-[#ff5500] font-bold text-sm">♪</span>
        <span>
          <strong>Now available:</strong> Get heard by up to 100 listeners on your next upload with Artist or Artist Pro.{' '}
          <span className="text-[#ff5500] hover:underline cursor-pointer font-medium">Learn More</span>
        </span>
      </div>

      {/* Hero Slider (nav is integrated inside) */}
      <div className="px-4 py-4 max-w-[1240px] mx-auto">
        <HeroSlider />
      </div>

      {/* Search Bar */}
      <div data-testid="search-section" className="flex flex-col min-[430px]:flex-row items-stretch min-[430px]:items-center justify-center gap-3 min-[430px]:gap-4 px-4 py-6 max-w-[800px] mx-auto">
        <div className="w-full min-[430px]:flex-1 relative">
          <input
            data-testid="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search for artists, bands, tracks, podcasts"
            className="w-full h-11 min-[430px]:h-10 pl-4 pr-10 bg-white text-black text-sm rounded-full outline-none focus:ring-2 focus:ring-[#ff5500] placeholder:text-gray-400"
          />
          <svg 
            onClick={handleSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#ff5500]" 
            width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
          </svg>
        </div>
        <span className="text-gray-400 text-sm shrink-0 text-center">or</span>
        <Link
          href={ROUTES.REGISTER}
          data-testid="upload-your-own-btn"
          className="shrink-0 px-5 h-11 min-[430px]:h-10 flex items-center justify-center border border-white/40 hover:border-white text-white text-sm font-medium rounded-full transition-colors"
        >
          Upload your own
        </Link>
      </div>

      {/* Trending by Genre Section */}
      <TrendingByGenre />
    </div>
  )
}
