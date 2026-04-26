"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { NavBar } from "@/shared/ui";
import { useTrack, useTracks } from "@/features/tracks/model/trackQueries";
import { useSuggestedUsers } from "@/features/social-graph/model/useSuggestedUsers";
import { useLikeTrack } from "@/features/track-engagement/model/useLikeTrack";
import { useUnlikeTrack } from "@/features/track-engagement/model/useUnlikeTrack";
import { useRepostTrack } from "@/features/track-engagement/model/useRepostTrack";
import { useUnrepostTrack } from "@/features/track-engagement/model/useUnrepostTrack";
import { TrackShareModal } from "@/shared/ui/TrackShareModal/TrackShareModal";
import { RepostToast } from "@/shared/ui/RepostToast/RepostToast";
import { usePlayerStore } from "@/features/player/model/playerStore";

export default function StationPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const trackQuery = useTrack(trackId);
  const track = trackQuery.data ?? null;
  const tracksQuery = useTracks();
  const suggestedQuery = useSuggestedUsers();
  const addToQueue = usePlayerStore(state => state.addToQueue);

  const allTracks = tracksQuery.data || [];
  const suggestedArtists = suggestedQuery.data || [];

  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  const toggleMainLike = () => {
    if (liked) {
      setLiked(false);
      unlikeMutation.mutate(trackId);
    } else {
      setLiked(true);
      likeMutation.mutate(trackId);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px',
    background: '#1a1a1a', border: '1px solid #333', borderRadius: 4,
    fontSize: 12, fontWeight: 500, color: '#ccc', cursor: 'pointer', whiteSpace: 'nowrap'
  };

  if (trackQuery.isLoading || tracksQuery.isLoading) {
    return <div className="min-h-screen bg-[#111] text-white flex items-center justify-center">Loading Station...</div>;
  }

  const title = track?.title || "Station Track";
  const artwork = track?.artworkUrl || (allTracks[0]?.artworkUrl) || "";

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col font-sans">
      <NavBar />
      
      <div className="flex-1 max-w-[1240px] w-full mx-auto" style={{ padding: '0', background: '#111' }}>
        
        {/* HERO BANNER */}
        <div className="relative w-full h-[320px] bg-gradient-to-r from-[#91818B] to-[#738C91] mt-[50px] flex p-6 justify-between overflow-hidden">
          {/* Left Side Info */}
          <div className="flex flex-col h-full justify-between z-10">
            <div className="flex gap-4">
              <button className="w-16 h-16 bg-[#111] text-[#f50] rounded-full flex items-center justify-center hover:bg-[#333] transition-colors border-2 border-transparent hover:border-[#f50]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
              <div className="flex flex-col items-start gap-1">
                <h1 className="bg-[#111] text-white px-3 py-1 text-2xl font-bold rounded-sm inline-block leading-none m-0 pt-2 pb-2">
                  {title}
                </h1>
                <span className="bg-[#111] text-[#999] px-2 py-1 text-[11px] font-semibold rounded-sm inline-flex items-center gap-1 leading-none mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 4A8 8 0 0 0 4 12h2a6 6 0 0 1 6-6V4zm0-4a12 12 0 0 0-12 12h2a10 10 0 0 1 10-10V0z"/></svg>
                  Track station
                </span>
              </div>
            </div>

            <div className="w-[100px] h-[100px] bg-[#111] mt-auto rounded-full flex flex-col items-center justify-center text-white shadow-lg overflow-hidden relative">
              <span className="text-[26px] font-bold leading-none mb-1">50</span>
              <span className="text-[10px] tracking-wider text-[#999] font-bold">TRACKS</span>
              <span className="text-[10px] text-[#999] mt-2 border-t border-[#333] pt-1 w-1/2 text-center">3:01:04</span>
            </div>
          </div>

          {/* Right Side Cover Art Collage */}
          <div className="w-[300px] h-[300px] relative z-10 bg-[#7B959A] shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col justify-end">
             {/* Fake Collage Background Circles */}
             <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-multiply" style={{ backgroundImage: `url(${artwork})` }}></div>
             <div className="absolute w-[200px] h-[200px] rounded-full top-[-40px] left-[-40px] border-4 border-[#111] bg-cover bg-center opacity-90 shadow-lg" style={{ backgroundImage: `url(${artwork})` }}></div>
             {allTracks[1]?.artworkUrl && (
               <div className="absolute w-[180px] h-[180px] rounded-full top-1/4 right-[-40px] border-4 border-[#111] bg-cover bg-center opacity-90 shadow-lg" style={{ backgroundImage: `url(${allTracks[1].artworkUrl})` }}></div>
             )}
             
             {/* Text overlay */}
             <div className="relative z-10 bg-gradient-to-t from-[#111] to-transparent p-4 pt-16">
               <h3 className="text-white text-lg italic tracking-wider font-extrabold m-0 leading-none shadow-black drop-shadow-md">STATION</h3>
               <p className="text-white text-md font-medium m-0 mt-1 shadow-black drop-shadow-md">{title}</p>
             </div>
          </div>
        </div>

        {/* MAIN TWO COLUMN LAYOUT */}
        <div className="flex bg-[#111] pt-6 px-6 pb-20">
          
          {/* Left Column - Tracklist */}
          <div className="flex-1 pr-8 border-r border-[#222]">
            
            {/* Action Bar */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#222]">
               <button data-testid="station-like-btn" onClick={toggleMainLike} style={{ ...btnBase, color: liked ? '#ff5500' : '#ccc', borderColor: liked ? '#ff5500' : '#333' }} className="hover:border-[#555]">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke={liked ? 'none' : 'currentColor'} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> Like
               </button>
               <button data-testid="station-share-btn" onClick={() => setShareOpen(true)} style={btnBase} className="hover:border-[#555]">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> Share
               </button>
               <button data-testid="station-nextup-btn" onClick={() => {
                 if (track) {
                   addToQueue({
                     id: track.id,
                     title: track.title,
                     artist: track.artist || 'Station Artist',
                     artworkUrl: track.artworkUrl || '',
                     hlsUrl: track.streamUrl || track.hlsUrl || ''
                   });
                   showToast('Added to Next up');
                 }
               }} style={btnBase} className="hover:border-[#555]">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 004 4h12"/><line x1="12" y1="19" x2="12" y2="19"/></svg> Add to Next up
               </button>
               <button data-testid="station-playlist-btn" onClick={() => showToast('Playlist feature coming soon')} style={btnBase} className="hover:border-[#555]">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/><path d="M12 15h6v6h-6z" fill="currentColor" stroke="none"/></svg> Add to playlist
               </button>
            </div>

            {/* Tracklist List */}
            <div className="flex flex-col w-full">
              {allTracks.map((t, idx) => (
                <StationTrackRow key={t.id} t={t} idx={idx} isActive={t.id === trackId} />
              ))}
            </div>
            
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-[320px] ml-8 flex flex-col pt-2">
            <h3 className="text-[12px] font-bold text-[#999] border-b border-[#222] pb-2 mb-4 tracking-wider">Based on 3 - {title}</h3>
            
            <div className="mt-2 mb-8">
               <h3 className="text-[12px] font-bold text-[#999] tracking-wider mb-4">ARTISTS FEATURED</h3>
               <div className="flex flex-col gap-4">
                 {suggestedArtists.slice(0, 5).map(a => (
                   <div key={a.id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <img src={a.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.displayName)}`} alt={a.displayName} className="w-12 h-12 rounded-full object-cover border border-[#333]" />
                       <div className="flex flex-col gap-1">
                         <span className="text-[13px] font-bold text-[#ccc] max-w-[140px] truncate">{a.displayName}</span>
                         <div className="flex items-center gap-3 text-[11px] text-[#999]">
                           <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> {a.followerCount || 0}</span>
                           <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg> 0</span>
                         </div>
                       </div>
                     </div>
                     <button className="bg-white text-black font-semibold text-[11px] px-3 py-1.5 rounded-[3px] hover:opacity-90">Follow</button>
                   </div>
                 ))}
               </div>
            </div>

            {/* Go Mobile Section from earlier! */}
            <div className="pt-4 border-t border-[#222]">
              <h3 className="text-[12px] font-bold text-[#999] tracking-wider mb-3">GO MOBILE</h3>
              <div className="flex gap-2 mb-4">
               <a href="#" className="inline-block hover:opacity-80 transition-opacity">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-[34px]" />
               </a>
               <a href="#" className="inline-block hover:opacity-80 transition-opacity">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-[34px]" />
               </a>
              </div>
              <p className="text-[10px] text-[#666] leading-relaxed">
                Legal ⁃ Privacy ⁃ Cookie Policy ⁃ Cookie Manager ⁃ Imprint ⁃ Artist Resources ⁃ Newsroom ⁃ Charts ⁃ Transparency Reports
              </p>
              <p className="text-[10px] text-blue-500 mt-2 hover:underline cursor-pointer">Language: English (US)</p>
            </div>
          </div>

        </div>

      </div>
      
      {toastMsg && (
        <div className="fixed bottom-[80px] left-1/2 -translate-x-1/2 bg-[#f50] text-[#fff] px-6 py-3 rounded-md text-[14px] font-bold shadow-[0_4px_16px_rgba(0,0,0,0.5)] z-50 transition-opacity duration-300">
          {toastMsg}
        </div>
      )}

      {track && (
        <TrackShareModal 
          open={shareOpen} 
          onClose={() => setShareOpen(false)} 
          trackTitle={track.title} 
          trackArtist={track.artist || 'Station Artist'} 
          trackUrl={typeof window !== 'undefined' ? window.location.href : ''} 
          trackArtworkUrl={track.artworkUrl}
        />
      )}
    </div>
  )
}

function StationTrackRow({ t, idx, isActive }: { t: any, idx: number, isActive: boolean }) {
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [nextUpToastVisible, setNextUpToastVisible] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const addToQueue = usePlayerStore(state => state.addToQueue);

  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();
  const repostMutation = useRepostTrack();
  const unrepostMutation = useUnrepostTrack();

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      unlikeMutation.mutate(t.id);
    } else {
      setLiked(true);
      likeMutation.mutate(t.id);
    }
  };

  const toggleRepost = () => {
    if (reposted) {
      setReposted(false);
      unrepostMutation.mutate(t.id);
    } else {
      setReposted(true);
      repostMutation.mutate({ trackId: t.id, track: t });
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/tracks/${t.id}`);
      setCopyToastVisible(true);
      setTimeout(() => setCopyToastVisible(false), 3000);
    }
  };

  return (
    <>
      <div className={`flex items-center group justify-between py-2 border-b border-[#222] ${isActive ? 'bg-[#222]' : 'hover:bg-[#1a1a1a]'}`}>
        <div className="flex items-center gap-3">
          <div className="relative w-[34px] h-[34px] bg-[#333] rounded overflow-hidden shadow">
            {t.artworkUrl ? (
                <img src={t.artworkUrl} alt="" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#555] to-[#333]" />
            )}
            
            {isActive && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
              <span className={`text-[12px] w-[14px] text-right font-medium ${isActive ? 'text-[#f50]' : 'text-[#999]'}`}>{idx + 1}</span>
              <span className="text-[12px] text-[#999]">•</span>
              <span className="text-[12px] text-[#999] hover:text-[#ccc] cursor-pointer max-w-[120px] truncate">{t.artist || 'Unknown Artist'}</span>
              <span className="text-[12px] text-[#ccc] mx-1">-</span>
              <span className="text-[12px] text-[#fff] font-medium cursor-pointer max-w-[160px] truncate">{t.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-2 relative">
          <div className={`flex items-center gap-1.5 opacity-80 ${isActive ? 'opacity-100 flex' : 'hidden group-hover:flex'}`}>
              <button onClick={toggleLike} className={`p-1 ${liked ? 'text-[#f50]' : 'text-[#ccc] hover:text-[#fff]'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke={liked ? 'none' : 'currentColor'} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              </button>
              <button onClick={toggleRepost} className={`p-1 ${reposted ? 'text-[#f50]' : 'text-[#ccc] hover:text-[#fff]'}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
              </button>
              <button onClick={() => setShareOpen(true)} className="text-[#ccc] hover:text-[#fff] p-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></button>
              <button onClick={handleCopyLink} className="text-[#ccc] hover:text-[#fff] p-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
              <div className="relative">
                <button onClick={(e) => { e.stopPropagation(); setMoreOpen(!moreOpen); }} className={`p-1 ${moreOpen ? 'text-[#fff]' : 'text-[#ccc] hover:text-[#fff]'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                </button>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMoreOpen(false); }} />
                    <div className="absolute top-8 right-0 w-[160px] bg-[#222] border border-[#333] shadow-lg rounded-[4px] z-50 flex flex-col py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { 
                        addToQueue({
                          id: t.id,
                          title: t.title,
                          artist: t.artist || 'Unknown Artist',
                          artworkUrl: t.artworkUrl || '',
                          hlsUrl: t.streamUrl || t.hlsUrl || ''
                        });
                        setNextUpToastVisible(true); 
                        setTimeout(() => setNextUpToastVisible(false), 3000); 
                        setMoreOpen(false); 
                      }} className="flex items-center gap-3 px-4 py-2 text-[12px] text-[#ccc] hover:bg-[#333] hover:text-white transition-colors w-full text-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 004 4h12"/><line x1="12" y1="19" x2="12" y2="19"/></svg> Add to Next up
                      </button>
                      <button onClick={() => { setIsPlaylistModalOpen(true); setMoreOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-[12px] text-[#ccc] hover:bg-[#333] hover:text-white transition-colors w-full text-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/><path d="M12 15h6v6h-6z" fill="currentColor" stroke="none"/></svg> Add to Playlist
                      </button>
                      <button onClick={() => { window.location.href = `/stations/track/${t.id}`; setMoreOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-[12px] text-[#ccc] hover:bg-[#333] hover:text-white transition-colors w-full text-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg> Station
                      </button>
                    </div>
                  </>
                )}
              </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#999]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {t.playCount || t.plays || 0}
          </div>
        </div>
      </div>

      <TrackShareModal open={shareOpen} onClose={() => setShareOpen(false)} trackTitle={t.title} trackArtist={t.artist || 'Unknown Artist'} trackUrl={`/tracks/${t.id}`} trackArtworkUrl={t.artworkUrl} />
      
      {copyToastVisible && (
        <div style={{ position: 'fixed', top: 60, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12, background: '#333', borderRadius: 4, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', color: '#fff', fontSize: 13, fontWeight: 500, animation: 'fadeIn 0.2s ease-out' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#009A55"><circle cx="12" cy="12" r="12"/><path d="M10 15.5l-3.5-3.5 1.5-1.5L10 12.5 16 6.5 17.5 8z" fill="#fff"/></svg> Link has been copied to the clipboard!
        </div>
      )}

      {nextUpToastVisible && (
        <div style={{ position: 'fixed', top: 60, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12, background: '#333', borderRadius: 4, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'fadeIn 0.2s ease-out' }}>
          {t.artworkUrl && <img src={t.artworkUrl} alt="" style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover' }} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{t.title}</span><span style={{ color: '#999', fontSize: 13 }}>was added to <span style={{ color: '#fff' }}>Next up</span>.</span>
          </div>
        </div>
      )}

      {isPlaylistModalOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)' }} onClick={() => setIsPlaylistModalOpen(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, background: '#111', width: '100%', maxWidth: 440, borderRadius: 4, display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', overflow: 'hidden' }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #333', paddingBottom: 16 }}>Create a playlist</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Playlist title <span style={{ color: '#f50' }}>*</span></label>
                <input type="text" autoFocus style={{ width: '100%', background: '#222', border: '1px solid #444', borderRadius: 4, padding: '8px 12px', color: '#fff', fontSize: 14, outline: 'none' }} placeholder="New playlist" />
              </div>
            </div>
            <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #333' }}>
              <button onClick={() => setIsPlaylistModalOpen(false)} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '8px 16px', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={() => setIsPlaylistModalOpen(false)} style={{ background: '#f50', color: '#fff', border: 'none', borderRadius: 3, padding: '8px 16px', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Save</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
