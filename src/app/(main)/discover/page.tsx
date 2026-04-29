'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';
import { TrendingByGenre } from '@/features/trending';

export default function DiscoverPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main className="max-w-[1240px] mx-auto px-6 py-10">
        <h2 className="text-[24px] font-bold text-white mb-2">Discover</h2>
        <p className="text-[#999] text-sm mb-6">Explore the best of BioBeats.</p>
        
        {/* Only Trending Sliders, no charts */}
        <TrendingByGenre />
      </main>
    </div>
  );
}
