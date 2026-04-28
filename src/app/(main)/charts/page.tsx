'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

// ─── Feature Hooks ────────────────────────────────────────────────────────────
import { useEditorial } from '@/features/trending';

// ─── Shared UI ────────────────────────────────────────────────────────────────
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { ROUTES } from '@/shared/constants/routes';

// ─── Chart Card Component ─────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, color, artwork }: { title: string; subtitle: string; color: string; artwork?: string }) => (
  <div className="flex flex-col gap-2 group cursor-pointer w-[160px]">
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

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main className="max-w-[1240px] mx-auto px-6 py-10 flex gap-10">
        
        {/* Left Column: Charts Grid */}
        <section className="flex-1 min-w-0">
          <div className="mb-12">
            <h2 className="text-[24px] font-bold text-white mb-6">Music Charts US</h2>
            <div className="flex flex-wrap gap-5">
              <ChartCard title="All music genres" subtitle="Music Charts" color="#ff5500" />
              <ChartCard title="New & Hot" subtitle="Music Charts" color="#ff2052" />
              <ChartCard title="Artist Pro" subtitle="Music Charts" color="#444" />
              <ChartCard title="Hip Hop" subtitle="Music Charts" color="#a0f" />
              <ChartCard title="Electronic" subtitle="Music Charts" color="#0af" />
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-[24px] font-bold text-white mb-6">Music Charts UK</h2>
            <div className="flex flex-wrap gap-5">
              <ChartCard title="All music genres" subtitle="Music Charts" color="#0072ff" />
              <ChartCard title="New & Hot" subtitle="Music Charts" color="#ff00c8" />
              <ChartCard title="Artist Pro" subtitle="Music Charts" color="#333" />
              <ChartCard title="Rock" subtitle="Music Charts" color="#f00" />
              <ChartCard title="Dance" subtitle="Music Charts" color="#0f0" />
            </div>
          </div>

          {/* Dynamic Editorial Buckets */}
          {!isLoading && buckets.length > 0 && (
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
                  />
                ))}
              </div>
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

          <SidebarSection title="Artists you should follow" showViewAll>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#222]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">Artist Name {i}</p>
                    <p className="text-xs text-[#555]">👥 {i}K · 🎵 {i*5}</p>
                  </div>
                  <button className="px-3 py-1 text-xs font-bold bg-white text-black rounded hover:bg-gray-200">Follow</button>
                </div>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="Likes" showViewAll>
             <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-8 h-8 rounded bg-[#222] border border-white/5" />
                ))}
             </div>
          </SidebarSection>

        </aside>
      </main>
    </div>
  );
}
