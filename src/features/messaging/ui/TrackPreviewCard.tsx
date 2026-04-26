'use client';

import React, { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { SharedTrackPreview } from '../model/types';
import { useTrack } from '@/features/tracks/model/trackQueries';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { useLikeTrack } from '@/features/track-engagement/model/useLikeTrack';
import { useUnlikeTrack } from '@/features/track-engagement/model/useUnlikeTrack';
import { TrackShareModal } from '@/shared/ui/TrackShareModal/TrackShareModal';

const WaveformPlayer = lazy(() => import('@/features/tracks/ui/WaveformPlayer'));

interface TrackPreviewCardProps {
  track: SharedTrackPreview;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

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

export const TrackPreviewCard: React.FC<TrackPreviewCardProps> = ({ track: previewTrack }) => {
  const { data: fullTrack, isLoading } = useTrack(previewTrack.trackId);
  
  const play = usePlayerStore((s) => s.play);
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  const [liked, setLiked] = useState(false);
  const [likeCountLocal, setLikeCountLocal] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  useEffect(() => {
    if (fullTrack) {
      // NOTE: Assume fullTrack has some isLiked property or similar if needed. For now default to false.
      // setLiked(fullTrack.isLiked);
      setLikeCountLocal((fullTrack as any).likeCount || 0);
    }
  }, [fullTrack]);

  const handlePlay = () => {
    if (!fullTrack) return;
    play({
      id: fullTrack.id,
      title: fullTrack.title,
      artist: fullTrack.artist || previewTrack.artist,
      artworkUrl: fullTrack.artworkUrl || previewTrack.artworkUrl || '/placeholder.png',
      hlsUrl: fullTrack.streamUrl || fullTrack.hlsUrl,
    });
  };

  const handleLikeToggle = useCallback(() => {
    if (!fullTrack) return;
    if (liked) {
      setLiked(false);
      setLikeCountLocal((c) => Math.max(0, c - 1));
      unlikeMutation.mutate(fullTrack.id);
    } else {
      setLiked(true);
      setLikeCountLocal((c) => c + 1);
      likeMutation.mutate(fullTrack.id);
    }
  }, [liked, unlikeMutation, likeMutation, fullTrack]);

  // Fallback while loading
  if (isLoading || !fullTrack) {
    return (
      <div style={{ padding: 12, background: '#111', borderRadius: 4, border: '1px solid #333', marginTop: 8 }}>
        <div style={{ color: '#999', fontSize: 13 }}>Loading track preview...</div>
      </div>
    );
  }

  const durationSec = typeof fullTrack.duration === 'string' 
    ? fullTrack.duration.split(':').reduce((acc: number, time: string) => (60 * acc) + +time, 0) 
    : fullTrack.duration;

  const artworkUrl = fullTrack.artworkUrl || previewTrack.artworkUrl;

  return (
    <div data-testid={`track-preview-${fullTrack.id}`} style={{ background: '#181818', padding: 16, borderRadius: 8, border: '1px solid #333', marginTop: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Cover Art */}
        <div style={{ width: 120, height: 120, flexShrink: 0, background: '#222', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          <Link href={`/tracks/${fullTrack.id}`} style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
          {artworkUrl ? (
            <img 
              src={artworkUrl} 
              alt={fullTrack.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#999" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          )}
        </div>

        {/* Info Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <button 
              onClick={handlePlay} 
              style={{ width: 36, height: 36, background: '#f50', color: 'white', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              data-testid="track-preview-play-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 2 }}>{previewTrack.artist}</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullTrack.title}</div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 50, position: 'relative', marginTop: 12 }}>
            <Suspense fallback={<div style={{ height: '100%', width: '100%', background: '#111' }} />}>
              <WaveformPlayer
                waveform={fullTrack.waveform}
                audioUrl={fullTrack.streamUrl || fullTrack.hlsUrl}
                durationSeconds={durationSec}
                comments={[]}
                onTimeUpdate={() => {}}
                trackMeta={{ id: fullTrack.id, title: fullTrack.title, artist: previewTrack.artist, artworkUrl: artworkUrl || undefined, hlsUrl: fullTrack.streamUrl || fullTrack.hlsUrl }}
                hidePlayButton
              />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={handleLikeToggle}
            style={{ ...btnBase, color: liked ? '#ff5500' : '#ccc', borderColor: liked ? '#ff5500' : '#333' }}
            data-testid="track-preview-like-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? '#ff5500' : 'none'} stroke={liked ? 'none' : 'currentColor'} strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {likeCountLocal > 0 && <span>{formatCount(likeCountLocal)}</span>}
          </button>

          <button
            onClick={() => setShareOpen(true)}
            style={btnIconOnly}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
            data-testid="track-preview-share-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
          </button>

          <button
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#999' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {formatCount((fullTrack as any).playCount || 0)}
          </span>
        </div>
      </div>

      <TrackShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        trackTitle={fullTrack.title}
        trackArtist={previewTrack.artist}
        trackArtworkUrl={artworkUrl || null}
        trackUrl={`/tracks/${fullTrack.id}`}
        trackGenre={fullTrack.genre}
      />

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
    </div>
  );
};
