'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Feature Hooks ────────────────────────────────────────────────────────────
import { useSearch } from '@/features/search';
import { usePlayerStore } from '@/features/player/model/playerStore';

// ─── Shared UI ────────────────────────────────────────────────────────────────
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { FeedTrackCard } from '@/shared/ui/FeedTrackCard/FeedTrackCard';
import { ROUTES } from '@/shared/constants/routes';

// ─── Types ────────────────────────────────────────────────────────────────────
import type { TrackResult, UserResult, PlaylistResult } from '@/features/search';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n?: number): string {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDuration(secs?: number): string {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Sidebar Tab Definition ──────────────────────────────────────────────────
type Tab = 'everything' | 'tracks' | 'people' | 'albums' | 'playlists';
const TABS: { id: Tab; label: string }[] = [
  { id: 'everything', label: 'Everything' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'people', label: 'People' },
  { id: 'albums', label: 'Albums' },
  { id: 'playlists', label: 'Playlists' },
];

function DummyWaveform() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 48, width: '100%' }}>
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} style={{
          flex: 1,
          height: Math.max(3, (8 + Math.abs(Math.sin(i * 0.4) * 35)) / 100 * 48),
          borderRadius: 1,
          background: 'rgba(255,255,255,0.4)',
        }} />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const [activeTab, setActiveTab] = useState<Tab>('everything');

  const { data: results, isLoading } = useSearch(query);
  const play = usePlayerStore((s) => s.play);

  const tracks = results?.tracks ?? [];
  const users = results?.users ?? [];
  const playlists = results?.playlists ?? [];

  const filteredResults = useMemo(() => {
    if (activeTab === 'tracks') return tracks;
    if (activeTab === 'people') return users;
    if (activeTab === 'playlists') return playlists;
    if (activeTab === 'albums') return []; // We don't have albums in backend
    return [...tracks, ...users, ...playlists]; // Everything
  }, [activeTab, tracks, users, playlists]);

  return (
    <div className="min-h-screen bg-[#111111] text-white font-inter">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} searchValue={query} />

      <main data-testid="search-page" className="max-w-[1240px] mx-auto px-6 py-8 flex gap-10">
        
        {/* Sidebar */}
        <aside className="w-[220px] flex-shrink-0">
          <div className="mb-6">
            <h1 className="text-[24px] font-bold text-white mb-6">
              Search results for "{query}"
            </h1>
            <nav data-testid="search-sidebar" className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  data-testid={`search-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-4 py-2.5 rounded text-[14px] font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-black' 
                      : 'text-[#ccc] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-10 pt-4 border-t border-white/10 text-[11px] text-[#777] leading-tight flex flex-col gap-2">
            <p>Legal - Privacy - Cookie Policy - Cookie Manager - Imprint - Artist Resources - Newsroom - Charts - Transparency Reports</p>
            <p className="mt-2 text-[#aaa]">Language: <span className="text-[#3399ff]">English (US)</span></p>
          </div>
        </aside>

        {/* Results Area */}
        <section className="flex-1 min-w-0 pt-[72px]">
          <div className="mb-8 border-b border-white/10 pb-4">
            {!isLoading && query && (
              <p className="text-[#999] text-[13px] font-medium">
                Found {playlists.length}+ playlists, {tracks.length}+ tracks, {users.length}+ people
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-8 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-5">
                  <div className="w-[160px] h-[160px] bg-[#222] rounded" />
                  <div className="flex-1 space-y-4 py-2">
                    <div className="h-4 w-1/4 bg-[#222] rounded" />
                    <div className="h-6 w-1/2 bg-[#2a2a2a] rounded" />
                    <div className="h-[60px] w-full bg-[#1a1a1a] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !query ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#555]">
              <span className="text-6xl mb-6">🔍</span>
              <p className="text-lg">Search for artists, tracks, or playlists</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#555]">
              <span className="text-6xl mb-6">🏜️</span>
              <p className="text-lg">No {activeTab} found for &quot;{query}&quot;</p>
            </div>
          ) : (
            <div data-testid="search-results-list" className="flex flex-col gap-8">
              
              {/* TOP RESULT: People */}
              {(activeTab === 'people' || activeTab === 'everything') && users.length > 0 && (
                <div className="flex items-center gap-8 pb-8 border-b border-white/5">
                  <div className="w-[200px] h-[200px] rounded-full overflow-hidden flex-shrink-0 border-4 border-[#333]">
                    <img src={users[0].avatarUrl} alt={users[0].displayName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-[20px] font-bold flex items-center gap-2">
                      <Link href={ROUTES.PROFILE(users[0].permalink)} className="hover:underline">{users[0].displayName}</Link>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#3399ff"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </h2>
                    <p className="text-[14px] text-[#999] mt-1">{users[0].displayName}</p>
                    <p className="text-[14px] text-[#999]">Unknown Location</p>
                    <p className="text-[12px] text-[#777] mt-2 flex items-center gap-1">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                       {fmt(users[0].followerCount)} followers
                    </p>
                  </div>
                  <div>
                    <button className="px-4 py-1.5 bg-white text-black font-bold text-[13px] rounded hover:bg-gray-200">
                      Follow
                    </button>
                  </div>
                </div>
              )}

              {/* TRACK RESULTS */}
              {(activeTab === 'tracks' || activeTab === 'everything') && (
                tracks.map(t => (
                  <FeedTrackCard
                    key={t._id}
                    title={t.title}
                    artist={t.artist.displayName}
                    artistPermalink={t.artist.permalink || t.artist._id}
                    trackPermalink={t.permalink || t._id}
                    coverUrl={t.artworkUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop'}
                    plays={t.playCount}
                    likes={t.likeCount}
                    reposts={t.repostCount ?? 0}
                    comments={t.commentCount ?? 0}
                    waveformSlot={<DummyWaveform />}
                    onPlay={() => play({
                      id: t._id,
                      title: t.title,
                      artist: t.artist.displayName,
                      artworkUrl: t.artworkUrl ?? '',
                      streamUrl: t.hlsUrl ?? '',
                      hlsUrl: t.hlsUrl ?? '',
                      duration: fmtDuration(t.duration),
                      waveform: [],
                    } as any)}
                    actionsSlot={
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-2 py-1 text-[12px] bg-transparent border border-white/10 rounded text-[#ccc] hover:border-white/30">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                          Like
                        </button>
                        <button className="flex items-center gap-1.5 px-2 py-1 text-[12px] bg-transparent border border-white/10 rounded text-[#ccc] hover:border-white/30">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                          Repost
                        </button>
                      </div>
                    }
                  />
                ))
              )}
              
              {/* PLAYLIST RESULTS */}
              {(activeTab === 'playlists') && playlists.map(p => (
                <div key={p._id} className="flex gap-4 py-4 border-b border-white/5">
                  <img src={p.artworkUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=160&h=160&fit=crop'} className="w-[160px] h-[160px] rounded object-cover" />
                  <div className="flex-1">
                     <p className="text-[13px] text-[#999]">{p.owner.displayName}</p>
                     <h3 className="text-[18px] font-bold hover:text-[#ccc] cursor-pointer">{p.title}</h3>
                  </div>
                </div>
              ))}

            </div>
          )}
        </section>
      </main>
      
      <style jsx global>{`
        body { background-color: #111111; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
