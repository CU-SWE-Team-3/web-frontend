'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SharedPlaylistPreview } from '../model/types';
import { 
  usePlaylist, 
  useUpdatePlaylist, 
  useUpdatePlaylistTracks, 
  useUploadPlaylistArtwork,
  useLikePlaylist,
  useUnlikePlaylist
} from '@/features/playlists/model/playlistQueries';
import { EditPlaylistModal } from '@/features/playlists/ui/EditPlaylistModal';

interface PlaylistPreviewCardProps {
  playlist: SharedPlaylistPreview;
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

export const PlaylistPreviewCard: React.FC<PlaylistPreviewCardProps> = ({ playlist: previewPlaylist }) => {
  const { data: fullPlaylist, isLoading } = usePlaylist(previewPlaylist.playlistId);
  
  const updatePlaylist = useUpdatePlaylist();
  const updateTracks = useUpdatePlaylistTracks();
  const uploadArtwork = useUploadPlaylistArtwork();
  const likeMutation = useLikePlaylist();
  const unlikeMutation = useUnlikePlaylist();

  const [liked, setLiked] = useState(false);
  const [likeCountLocal, setLikeCountLocal] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [copyToastVisible, setCopyToastVisible] = useState(false);

  useEffect(() => {
    if (fullPlaylist) {
      setLikeCountLocal(fullPlaylist.likeCount || 0);
    }
  }, [fullPlaylist]);

  const handleLikeToggle = () => {
    if (!fullPlaylist) return;
    if (liked) {
      setLiked(false);
      setLikeCountLocal((c) => Math.max(0, c - 1));
      unlikeMutation.mutate(fullPlaylist._id);
    } else {
      setLiked(true);
      setLikeCountLocal((c) => c + 1);
      likeMutation.mutate(fullPlaylist._id);
    }
  };

  const handleSaveEdit = async (input: any) => {
    if (!fullPlaylist) return;
    await updatePlaylist.mutateAsync({ id: fullPlaylist._id, input });
    // Note: Modal handleSave also triggers onTracksChange, but we handle it via onTracksChange prop below
  };

  const handleTracksChange = async (trackIds: string[]) => {
    if (!fullPlaylist) return;
    await updateTracks.mutateAsync({ id: fullPlaylist._id, trackIds });
  };

  const handleArtworkUpload = async (file: File) => {
    if (!fullPlaylist) return;
    await uploadArtwork.mutateAsync({ id: fullPlaylist._id, file });
  };

  if (isLoading || !fullPlaylist) {
    return (
      <div style={{ padding: 12, background: '#111', borderRadius: 4, border: '1px solid #333', marginTop: 8 }}>
        <div style={{ color: '#999', fontSize: 13 }}>Loading playlist preview...</div>
      </div>
    );
  }

  const artworkUrl = fullPlaylist.artworkUrl || previewPlaylist.artworkUrl;
  const creatorName = typeof fullPlaylist.creator === 'string' 
    ? previewPlaylist.artist 
    : fullPlaylist.creator?.displayName || previewPlaylist.artist;

  return (
    <div data-testid={`playlist-preview-${fullPlaylist._id}`} style={{ background: '#181818', padding: 16, borderRadius: 8, border: '1px solid #333', marginTop: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Cover Art */}
        <div style={{ width: 120, height: 120, flexShrink: 0, background: '#222', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
          <Link href={`/playlists/${fullPlaylist._id}`} style={{ position: 'absolute', inset: 0, zIndex: 10 }} />
          {artworkUrl ? (
            <img 
              src={artworkUrl} 
              alt={fullPlaylist.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>
               <svg width="40" height="40" viewBox="0 0 24 24" fill="#666"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <button 
              style={{ width: 36, height: 36, background: '#f50', color: 'white', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              data-testid="playlist-preview-play-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#999', fontSize: 12, marginBottom: 2 }}>{creatorName}</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullPlaylist.title}</div>
              <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>Playlist • {fullPlaylist.trackCount} tracks</div>
            </div>
          </div>
          
          {/* Simple Track List Preview */}
          <div style={{ marginTop: 12, borderTop: '1px solid #333', paddingTop: 8 }}>
             {(fullPlaylist.tracks || []).slice(0, 3).map((t: any, i: number) => (
               <div key={t.id || t._id || i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11, color: '#ccc' }}>
                 <span style={{ color: '#666', width: 14 }}>{i + 1}</span>
                 <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title || 'Untitled Track'}</span>
               </div>
             ))}
             {(fullPlaylist.trackCount || 0) > 3 && (
               <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>+ {(fullPlaylist.trackCount || 0) - 3} more tracks</div>
             )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            style={btnIconOnly}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
            title="Share"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
            </svg>
          </button>

          <button
            style={btnIconOnly}
            onClick={() => {
              const url = `${window.location.origin}/playlists/${fullPlaylist._id}`;
              navigator.clipboard.writeText(url);
              setCopyToastVisible(true);
              setTimeout(() => setCopyToastVisible(false), 3000);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
            title="Copy Link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>

          <button
            style={btnIconOnly}
            onClick={() => setEditOpen(true)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
          </button>

          <button
            onClick={handleLikeToggle}
            style={{ ...btnIconOnly, color: liked ? '#ff5500' : '#ccc', borderColor: liked ? '#ff5500' : '#333' }}
            data-testid="playlist-preview-like-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? '#ff5500' : 'none'} stroke={liked ? 'none' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>

          <button
            style={btnIconOnly}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#555'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; }}
            title="More"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <circle cx="19" cy="12" r="1"/>
              <circle cx="5" cy="12" r="1"/>
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: '#999' }}>
          {likeCountLocal > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              {formatCount(likeCountLocal)}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            {formatCount(fullPlaylist.repostCount || 0)}
          </span>
        </div>
      </div>

      {editOpen && (
        <EditPlaylistModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          playlist={fullPlaylist}
          onSave={handleSaveEdit}
          onTracksChange={handleTracksChange}
          onArtworkUpload={handleArtworkUpload}
          isSaving={updatePlaylist.isPending || updateTracks.isPending}
          isUploadingArtwork={uploadArtwork.isPending}
        />
      )}

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
