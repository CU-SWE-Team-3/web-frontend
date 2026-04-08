'use client';

import React, { FC, lazy, Suspense, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Track } from '@/features/tracks/model/track';
import { useRepostTrack } from '@/features/track-engagement/model/useRepostTrack';
import { useUnrepostTrack } from '@/features/track-engagement/model/useUnrepostTrack';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useTrackComments } from '@/features/comments/model/useTrackComments';
import { CommentInput } from '@/features/comments/ui/CommentInput';
import { RepostToast } from '@/shared/ui/RepostToast/RepostToast';
import { TrackShareModal } from '@/shared/ui/TrackShareModal/TrackShareModal';
import type { WaveformComment } from '@/features/tracks/ui/WaveformPlayer';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';

const WaveformPlayer = lazy(() => import('@/features/tracks/ui/WaveformPlayer'));

export interface ProfileTrackCardProps {
  track: Track;
  userFullName: string;
  username: string;
  userAvatarUrl?: string;
  isOwner?: boolean;
  isReposted?: boolean;
  isLiked?: boolean;
  likeCount?: number;
  repostCount?: number;
  repostedBy?: string;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/* ── Shared button style (dark rounded rect, matching SoundCloud) ── */
const btnBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  height: 28,
  padding: '0 10px',
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 500,
  color: '#ccc',
  cursor: 'pointer',
  transition: 'border-color 200ms',
  whiteSpace: 'nowrap' as const,
};

const btnIconOnly: React.CSSProperties = {
  ...btnBase,
  padding: '0 8px',
  minWidth: 28,
};

export const ProfileTrackCard: FC<ProfileTrackCardProps> = ({
  track,
  userFullName,
  username,
  userAvatarUrl,
  isOwner,
  isReposted: initialReposted = false,
  isLiked: initialLiked = false,
  likeCount: initialLikeCount = 0,
  repostCount: initialRepostCount = 0,
  repostedBy,
}) => {
  const { isAuthenticated } = useAuthStore();
  const play = usePlayerStore((s) => s.play);
  const [liked, setLiked] = useState(initialLiked);
  const [likeCountLocal, setLikeCountLocal] = useState(initialLiked ? Math.max(1, initialLikeCount) : initialLikeCount);
  const [reposted, setReposted] = useState(initialReposted);
  const [repostCountLocal, setRepostCountLocal] = useState(initialReposted ? Math.max(1, initialRepostCount) : initialRepostCount);

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCountLocal(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  useEffect(() => {
    setReposted(initialReposted);
    setRepostCountLocal(initialRepostCount);
  }, [initialReposted, initialRepostCount]);
  const [toastVisible, setToastVisible] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);
  const [nextUpToastVisible, setNextUpToastVisible] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

  const repostMutation = useRepostTrack();
  const unrepostMutation = useUnrepostTrack();
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  // Fetch comments for this track
  const { data: comments = [] } = useTrackComments(track.id);

  // Map comments to waveform markers (shown as avatar circles on waveform)
  const waveformComments: WaveformComment[] = comments.map((c) => ({
    id: c.id,
    timestampSeconds: c.timestampSeconds,
    text: c.text,
    username: c.displayName || c.username,
    avatarUrl: c.avatarUrl,
  }));

  const handleLikeToggle = useCallback(() => {
    if (liked) {
      setLiked(false);
      setLikeCountLocal((c) => Math.max(0, c - 1));
      unlikeMutation.mutate(track.id);
    } else {
      setLiked(true);
      setLikeCountLocal((c) => c + 1);
      likeMutation.mutate(track.id);
    }
  }, [liked, unlikeMutation, likeMutation, track.id]);

  const handleRepostToggle = useCallback(() => {
    // Dev bypass: removed 'if (isOwner) return;' so local dev testing works
    if (reposted) {
      setReposted(false);
      setRepostCountLocal((c) => Math.max(0, c - 1));
      unrepostMutation.mutate(track.id);
    } else {
      setReposted(true);
      setRepostCountLocal((c) => c + 1);
      repostMutation.mutate({ trackId: track.id, track });
      setToastVisible(true);
    }
  }, [reposted, isAuthenticated, track, repostMutation, unrepostMutation]);

  const handlePlay = () => {
    play({
      id: track.id,
      title: track.title,
      artist: userFullName || username,
      artworkUrl: track.artworkUrl || '/placeholder.png',
      hlsUrl: track.streamUrl || track.hlsUrl,
    });
  };

  return (
    <div data-testid="track-card" className="mb-8 font-inter">
      {/* Track Header */}
      <div className="flex gap-4">
        {/* Cover Art */}
        <div className="w-[160px] h-[160px] shrink-0 bg-[#222] rounded overflow-hidden relative group cursor-pointer">
          <Link href={`/tracks/${track.permalink || track.id}`} className="absolute inset-0 z-10" aria-label={`Go to ${track.title}`} />
          {track.artworkUrl ? (
            <img data-testid="track-card-artwork" src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : null}
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <button data-testid="track-card-play-button" onClick={handlePlay} className="w-9 h-9 bg-[#f50] text-white rounded-full flex items-center justify-center shrink-0 hover:bg-[#d44000] focus:outline-none transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <div className="min-w-0">
                {/* Artist name — with repost indicator inline if reposted */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {repostedBy && (
                    <span data-testid="repost-label" style={{ color: '#999', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 00-4 4M3 18h12a4 4 0 004-4"/>
                      </svg>
                    </span>
                  )}
                  <Link href={`/${username}`} className="text-[#999] text-[12px] hover:text-[#ccc] truncate">
                    {userFullName}
                  </Link>
                </div>
                <Link data-testid="track-card-title" href={`/tracks/${track.permalink || track.id}`} className="text-white text-[15px] hover:text-white block truncate leading-tight">
                  {track.title}
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[#999] text-[11px] hover:text-[#ccc] cursor-pointer">1 hour ago</span>
              <span className="px-2 py-0.5 bg-[#151515] text-[#ccc] text-[11px] rounded-full border border-[#333] cursor-pointer hover:border-[#666]">
                # {track.genre || 'Hip-hop & Rap'}
              </span>
            </div>
          </div>

          <div data-testid="track-card-waveform" className="flex-1 min-h-[60px] relative mt-1">
             <Suspense fallback={<div className="h-full w-full bg-[#111]" />}>
               <WaveformPlayer
                 waveform={track.waveform}
                 audioUrl={track.streamUrl || track.hlsUrl}
                 durationSeconds={typeof track.duration === 'string' ? track.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0) : track.duration}
                 comments={waveformComments}
                 onTimeUpdate={setCurrentPlaybackTime}
                 trackMeta={{ id: track.id, title: track.title, artist: userFullName || username, artworkUrl: track.artworkUrl, hlsUrl: track.streamUrl || track.hlsUrl }}
                 hidePlayButton
               />
             </Suspense>
          </div>

          {/* Comment Input — captures current playback timestamp */}
          <div className="mt-2">
            <CommentInput
              trackId={track.id}
              currentTime={currentPlaybackTime}
              userAvatarUrl={userAvatarUrl}
            />
          </div>
        </div>
      </div>

      {/* ── Action Bar (SoundCloud style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        {/* Left: interactive buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Like button */}
          <button
            data-testid="track-card-like-button"
            onClick={handleLikeToggle}
            style={{
              ...btnBase,
              color: liked ? '#ff5500' : '#ccc',
              borderColor: liked ? '#ff5500' : '#333',
            }}
            onMouseEnter={(e) => { if (!liked) e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { if (!liked) e.currentTarget.style.borderColor = '#333'; }}
          >
            {/* Heart icon: outline when inactive, filled when active */}
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={liked ? '#ff5500' : 'none'}
              stroke={liked ? 'none' : 'currentColor'}
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{formatCount(likeCountLocal)}</span>
          </button>

          {/* Repost button — same toggle pattern as like */}
          <button
            data-testid="track-card-repost-button"
            onClick={handleRepostToggle}
            style={{
              ...btnBase,
              color: reposted ? '#ff5500' : '#ccc',
              borderColor: reposted ? '#ff5500' : '#333',
            }}
            onMouseEnter={(e) => { if (!reposted) e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { if (!reposted) e.currentTarget.style.borderColor = '#333'; }}
            title={reposted ? 'Unrepost' : 'Repost'}
          >
            {/* Repost icon: changes color on active */}
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 00-4 4M3 18h12a4 4 0 004-4"/>
            </svg>
            <span>{formatCount(repostCountLocal)}</span>
          </button>

          {/* Share (icon only) */}
          <button
            data-testid="track-card-share-button"
            onClick={() => setShareOpen(true)}
            style={btnIconOnly}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
          </button>

          {/* Copy Link (icon only) */}
          <button
            data-testid="track-card-copy-button"
            style={btnIconOnly}
            onClick={() => {
              setCopyToastVisible(true);
              setTimeout(() => setCopyToastVisible(false), 3000);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>

          {/* More (icon only) & Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              data-testid="track-card-more-button"
              style={btnIconOnly}
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
              onMouseLeave={(e) => { (!isMoreMenuOpen) && (e.currentTarget.style.borderColor = '#333'); }}
            >
              {isMoreMenuOpen ? <span style={{ color: '#f50' }}>...</span> : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
              </svg>}
            </button>
            {isMoreMenuOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} onClick={() => setIsMoreMenuOpen(false)} />
                <div style={{ 
                  position: 'absolute', top: '100%', left: 0, marginTop: 4, 
                  background: '#111', border: '1px solid #333', borderRadius: 4, 
                  minWidth: 160, zIndex: 1001, display: 'flex', flexDirection: 'column',
                  padding: '4px 0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                  <button 
                    onClick={() => { 
                      setIsMoreMenuOpen(false); 
                      setNextUpToastVisible(true); 
                      setTimeout(() => setNextUpToastVisible(false), 3000); 
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'transparent', color: '#fff', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 004 4h12"/><line x1="12" y1="19" x2="12" y2="19"/></svg>
                    Add to Next up
                  </button>
                  <button 
                    onClick={() => { setIsMoreMenuOpen(false); setIsPlaylistModalOpen(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'transparent', color: '#fff', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/><path d="M12 15h6v6h-6z" fill="currentColor" stroke="none"/></svg>
                    Add to Playlist
                  </button>
                  <Link 
                    href={`/stations/track/${track.id}`}
                    onClick={() => setIsMoreMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'transparent', color: '#fff', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#333'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
                    Station
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#999' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {formatCount((track as any).plays || (track as any).playCount || 0)}
          </span>
          <a href={`/tracks/${track.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#999', textDecoration: 'none' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#999'; }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {formatCount(comments.length || (track as any).commentCount || 0)}
          </a>
        </div>
      </div>

      {/* Repost Toast */}
      <RepostToast
        trackTitle={track.title}
        artworkUrl={track.artworkUrl}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      {/* Track Share Modal */}
      <TrackShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        trackTitle={track.title}
        trackArtist={userFullName}
        trackArtworkUrl={track.artworkUrl}
        trackUrl={`/tracks/${track.id}`}
        trackGenre={track.genre}
      />

      {/* Copy Link Toast */}
      {copyToastVisible && (
        <div style={{
          position: 'fixed', top: 60, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12,
          background: '#333', borderRadius: 4, padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxWidth: 360, color: '#fff', fontSize: 13, fontWeight: 500, animation: 'fadeIn 0.2s ease-out'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#009A55"><circle cx="12" cy="12" r="12"/><path d="M10 15.5l-3.5-3.5 1.5-1.5L10 12.5 16 6.5 17.5 8z" fill="#fff"/></svg>
          Link has been copied to the clipboard!
        </div>
      )}

      {/* Next Up Toast */}
      {nextUpToastVisible && (
        <div style={{
          position: 'fixed', top: 60, right: 20, zIndex: 9999, display: 'flex', alignItems: 'center', gap: 12,
          background: '#333', borderRadius: 4, padding: '10px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxWidth: 360, animation: 'fadeIn 0.2s ease-out'
        }}>
          {track.artworkUrl && (
            <img src={track.artworkUrl} alt="" style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{track.title}</span>
            <span style={{ color: '#999', fontSize: 13 }}>
              was added to <span style={{ color: '#fff' }}>Next up</span>.
            </span>
          </div>
        </div>
      )}

      {/* Playlist Modal */}
      {isPlaylistModalOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)' }} onClick={() => setIsPlaylistModalOpen(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999,
            background: '#111', width: '100%', maxWidth: 440, borderRadius: 4, display: 'flex', flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)', overflow: 'hidden'
          }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
              <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 16px 0', borderBottom: '1px solid #333', paddingBottom: 16 }}>Create a playlist</h2>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#fff', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Playlist title <span style={{ color: '#f50' }}>*</span></label>
                <input type="text" autoFocus style={{
                  width: '100%', background: '#222', border: '1px solid #444', borderRadius: 4, padding: '8px 12px', color: '#fff', fontSize: 14, outline: 'none'
                }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#fff', fontSize: 14, fontWeight: 700 }}>
                  Privacy:
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="privacy" defaultChecked style={{ accentColor: '#f50' }} /> Public
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                    <input type="radio" name="privacy" style={{ accentColor: '#f50' }} /> Private
                  </label>
                </div>
                <button 
                  onClick={() => setIsPlaylistModalOpen(false)}
                  style={{
                  background: '#fff', color: '#000', border: 'none', borderRadius: 4, padding: '6px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>Save</button>
              </div>
            </div>
            
            <div style={{ background: '#222', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {track.artworkUrl && <img src={track.artworkUrl} alt="" style={{ width: 30, height: 30, objectFit: 'cover' }} />}
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{track.title}</span>
              </div>
              <button onClick={() => setIsPlaylistModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>
                ✕
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
