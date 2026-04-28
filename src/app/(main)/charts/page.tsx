'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Feature Hooks ────────────────────────────────────────────────────────────
import { useEditorial } from '@/features/trending';
import { feedRepository } from '@/features/feed/api/feedRepository';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useLikedTracks } from '@/features/track-engagement/model/useLikedTracks';

// ─── Shared UI ────────────────────────────────────────────────────────────────
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';

// ─── Chart Card Component ─────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, color, artwork, onClick }: { title: string; subtitle: string; color: string; artwork?: string; onClick?: () => void }) => (
  <div className="flex flex-col gap-2 group cursor-pointer w-[160px]" onClick={onClick}>
    <div
      className="relative aspect-square rounded-sm overflow-hidden shadow-lg transition-transform hover:scale-[1.02]"
      style={{ backgroundColor: color }}
    >
      {artwork ? (
        <img src={artwork} alt={title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full p-4 flex flex-col justify-between text-white font-bold leading-tight">
          <span className="text-[28px]">TOP 50</span>
          <span className="text-[14px] opacity-80">{title.toUpperCase()}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-white truncate group-hover:underline">{title}</span>
      <span className="text-[12px] text-[#999]">{subtitle}</span>
    </div>
  </div>
);

// ─── Sidebar Section Component ────────────────────────────────────────────────
const SidebarSection = ({ title, children, showViewAll = false }: { title: string; children: React.ReactNode; showViewAll?: boolean }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
      <h3 className="text-[12px] font-bold text-[#555] uppercase tracking-widest">{title}</h3>
      {showViewAll && <span className="text-[11px] text-[#777] hover:text-white cursor-pointer">View all</span>}
    </div>
    {children}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChartsPage() {
  const router = useRouter();
  const { data: buckets = [], isLoading } = useEditorial();
  const { user } = useAuthStore();

  // ─── Real suggested artists from API ─────────────────────────────────────
  const [suggestedArtists, setSuggestedArtists] = useState<any[]>([]);
  useEffect(() => {
    feedRepository.getSuggestedArtists(1, 3).then(setSuggestedArtists).catch(() => {});
  }, []);

  // ─── Real liked tracks for current user ──────────────────────────────────
  const userId = (user as any)?._id || user?.id || '';
  const { data: likedTracks = [] } = useLikedTracks(userId);

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main className="max-w-[1240px] mx-auto px-6 py-10 flex gap-10">

        {/* Left Column: Charts Grid */}
        <section className="flex-1 min-w-0">
          {/* Dynamic Editorial Buckets from backend */}
          {!isLoading && buckets.length > 0 ? (
            <div>
              <h2 className="text-[24px] font-bold text-white mb-6">Trending Globally</h2>
              <div className="flex flex-wrap gap-5">
                {buckets.map(b => (
                  <ChartCard
                    key={b.id}
                    title={b.title}
                    subtitle="Platform Choice"
                    color="#222"
                    artwork={b.tracks?.[0]?.artworkUrl}
                    onClick={() => router.push(`/trending-music-eg/sets/${b.title.toLowerCase().replace(/\s+/g, '-')}`)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[#555] italic text-sm mt-10">
              No charts available at the moment.
            </div>
          )}
        </section>

        {/* Right Column: Sidebar */}
        <aside className="w-[300px] flex-shrink-0">

          <SidebarSection title="Artist Tools">
            <div className="grid grid-cols-4 gap-2">
              {['Amplify', 'Replace', 'Distribute', 'Master'].map(tool => (
                <div key={tool} className="flex flex-col items-center gap-1.5 p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs">✨</div>
                  <span className="text-[10px] text-[#999]">{tool}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-[12px] font-semibold text-white bg-[#ff5500]/10 border border-[#ff5500]/20 rounded-md hover:bg-[#ff5500]/20">
              Unlock Artist tools from EGP 29.99/month
            </button>
          </SidebarSection>

          {/* Real suggested artists */}
          <SidebarSection title="Artists you should follow" showViewAll>
            <div className="flex flex-col gap-4">
              {suggestedArtists.length > 0 ? (
                suggestedArtists.map(artist => (
                  <div key={artist._id || artist.id} className="flex items-center gap-3">
                    <Link href={ROUTES.PROFILE(artist.permalink || artist._id || artist.id)}>
                      {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.displayName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-white font-bold text-sm">
                          {(artist.displayName || '?')[0].toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={ROUTES.PROFILE(artist.permalink || artist._id || artist.id)}>
                        <p className="text-sm font-semibold truncate hover:underline">{artist.displayName}</p>
                      </Link>
                      <p className="text-xs text-[#555]">
                        {artist.followerCount ? `${(artist.followerCount / 1000).toFixed(1)}K followers` : 'Artist'}
                      </p>
                    </div>
                    <button className="px-3 py-1 text-xs font-bold bg-white text-black rounded hover:bg-gray-200">Follow</button>
                  </div>
                ))
              ) : (
                /* Skeleton while loading */
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-[#222]" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-[#222] rounded w-2/3" />
                      <div className="h-2 bg-[#1a1a1a] rounded w-1/2" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SidebarSection>

          {/* Real liked tracks */}
          <SidebarSection title="Likes" showViewAll>
            <div className="flex gap-2 flex-wrap">
              {likedTracks.length > 0 ? (
                likedTracks.slice(0, 5).map(t => (
                  <Link key={t.id} href={`/tracks/${t.id}`}>
                    {t.artworkUrl ? (
                      <img src={t.artworkUrl} alt={t.title} className="w-10 h-10 rounded object-cover hover:opacity-80 transition-opacity" title={t.title} />
                    ) : (
                      <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#555"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
                      </div>
                    )}
                  </Link>
                ))
              ) : (
                /* Skeleton / empty */
                [1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-10 h-10 rounded bg-[#222] border border-white/5" />
                ))
              )}
            </div>
          </SidebarSection>

        </aside>
      </main>
    </div>
  );
}
