'use client';

import React, { useState } from 'react';
import { useUserTracks } from '@/features/tracks/model/trackQueries';
import { useUserPlaylists } from '@/features/playlists/model/playlistQueries';

export interface AddAttachmentModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTrack: (item: any, type: 'track' | 'playlist') => void;
}

// Icons for the right side of the list items
const PlaylistIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="16" height="16" rx="2" ry="2"></rect>
  </svg>
);

const TrackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="9" width="3" height="6" rx="1"></rect>
    <rect x="10" y="4" width="3" height="16" rx="1"></rect>
    <rect x="16" y="7" width="3" height="10" rx="1"></rect>
  </svg>
);

export const AddAttachmentModal: React.FC<AddAttachmentModalProps> = ({
  open,
  onClose,
  onSelectTrack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: myTracks = [], isLoading: loadingTracks } = useUserTracks('me');
  const { data: myPlaylists = [], isLoading: loadingPlaylists } = useUserPlaylists('me');

  if (!open) return null;

  const isLoading = loadingTracks || loadingPlaylists;
  
  // Combine tracks and playlists
  const allItems = [
    ...myPlaylists.map((p: any) => ({ ...p, _type: 'playlist' as const })),
    ...myTracks.map((t: any) => ({ ...t, _type: 'track' as const }))
  ];

  const filteredItems = allItems.filter(item => 
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      data-testid="add-attachment-modal"
      style={{
        position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'rgba(0,0,0,0.7)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#111', width: '100%', maxWidth: 600, padding: '24px',
        position: 'relative', color: '#fff', fontFamily: 'var(--sc-font-family)',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column'
      }}>
        
        <label style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, display: 'block' }}>
          Write your message and add tracks or playlists<span style={{ color: '#ff5500' }}>*</span>
        </label>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Select a track or playlist from your profile"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#222',
            border: '1px solid #333',
            color: '#fff',
            fontSize: 14,
            outline: 'none',
          }}
        />

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1, border: '1px solid #333', borderTop: 'none', background: '#1a1a1a' }}>
          {isLoading ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
              No items found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredItems.map((item: any) => {
                const id = item.id || item._id;
                const artwork = item.artworkUrl || item.artwork_url;
                return (
                  <div
                    key={`${item._type}-${id}`}
                    onClick={() => {
                      onSelectTrack(item, item._type);
                      onClose();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
                      cursor: 'pointer', borderBottom: '1px solid #222', transition: 'background 0.2s'
                    }}
                    data-testid={`attachment-${item._type}-${id}`}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a2a')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ width: 32, height: 32, background: '#333', flexShrink: 0, overflow: 'hidden' }}>
                      {artwork && <img src={artwork} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                    </div>
                    <div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item._type === 'playlist' ? <PlaylistIcon /> : <TrackIcon />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
