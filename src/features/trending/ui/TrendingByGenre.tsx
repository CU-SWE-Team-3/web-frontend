'use client';

import React from 'react';
import Link from 'next/link';
import { useEditorial } from '../model/trendingQueries';
import { ROUTES } from '@/shared/constants/routes';
import { getStationHref } from '../lib/stationLinks';
import { HorizontalScroll } from '@/shared/ui/HorizontalScroll/HorizontalScroll';

export const TrendingByGenre: React.FC = () => {
  const { data: buckets = [], isLoading } = useEditorial();

  // Use all buckets returned by the editorial endpoint for the genre slider
  const genreBuckets = buckets;

  if (isLoading) {
    return (
      <div className="py-8 px-4 max-w-[1240px] mx-auto animate-pulse">
        <div className="h-7 w-48 bg-[#222] rounded mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="min-w-[160px] flex flex-col gap-2">
              <div className="aspect-square bg-[#222] rounded-md" />
              <div className="h-4 w-24 bg-[#222] rounded" />
              <div className="h-3 w-32 bg-[#111] rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section data-testid="trending-by-genre" className="py-8 px-4 max-w-[1240px] mx-auto overflow-hidden">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-[22px] font-bold text-white mb-1">Trending by genre</h2>
          <p className="text-sm text-[#999]">The biggest tracks in the BioBeats community</p>
        </div>
        <Link 
          href={ROUTES.TRENDING} 
          className="text-xs font-semibold text-[#ff5500] hover:underline"
        >
          View all
        </Link>
      </div>

      {genreBuckets.length === 0 ? (
        <div className="text-[#666] text-sm py-4">
          No trending playlists available right now. Please check your backend data.
        </div>
      ) : (
        <HorizontalScroll className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
          {genreBuckets.map((bucket, index) => {
            // Find the first track to use as artwork if the bucket itself doesn't have one
            const firstTrack = bucket.tracks?.[0];
            const artwork = firstTrack?.artworkUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
            const title = bucket.title.replace('Top ', '').replace(/SoundCloud/gi, 'BioBeats');

            return (
              <Link
                key={bucket.id}
                href={getStationHref(bucket, index, 'set')}
                className="group min-w-[160px] max-w-[160px] flex flex-col gap-2 no-underline"
              >
                <div className="relative aspect-square rounded-md overflow-hidden bg-[#222] shadow-lg transition-transform group-hover:scale-[1.02]">
                  <img 
                    src={artwork} 
                    alt={bucket.title}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#ff5500] flex items-center justify-center shadow-xl">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <polygon points="6,4 20,12 6,20" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white truncate group-hover:underline">
                    {title}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[12px] text-[#999]">Trending Music</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--sc-verified, #3da1f2)">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-3.3-3.3 1.4-1.4 1.9 1.9 4.9-4.9 1.4 1.4-6.3 6.3z" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </HorizontalScroll>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
