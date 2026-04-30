'use client';

import React, { useState } from 'react';
import { useUserTracks } from '@/features/tracks/model/trackQueries';
import { useUserPlaylists } from '@/features/playlists/model/playlistQueries';
import { CloseIcon } from '@/shared/ui/icons';

export interface AddAttachmentModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTrack: (item: any, type: 'track' | 'playlist') => void;
}

export const AddAttachmentModal: React.FC<AddAttachmentModalProps> = ({
  open,
  onClose,
  onSelectTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists'>('tracks');
  const { data: myTracks = [], isLoading: loadingTracks } = useUserTracks('me');
  const { data: myPlaylists = [], isLoading: loadingPlaylists } = useUserPlaylists('me');

  if (!open) return null;

  const isLoading = activeTab === 'tracks' ? loadingTracks : loadingPlaylists;
  const items = activeTab === 'tracks' ? myTracks : myPlaylists;

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
        background: '#222', borderRadius: 8, width: '100%', maxWidth: 480, padding: 0,
        position: 'relative', color: '#fff', fontFamily: 'var(--sc-font-family)',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Add track or playlist</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
          <button
            onClick={() => setActiveTab('tracks')}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none',
              color: activeTab === 'tracks' ? '#f50' : '#999',
              borderBottom: activeTab === 'tracks' ? '2px solid #f50' : '2px solid transparent',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            Tracks
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            style={{
              flex: 1, padding: '12px', background: 'none', border: 'none',
              color: activeTab === 'playlists' ? '#f50' : '#999',
              borderBottom: activeTab === 'playlists' ? '2px solid #f50' : '2px solid transparent',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            Playlists
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          {isLoading ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
              {activeTab === 'tracks' ? "You don't have any tracks yet." : "You don't have any playlists yet."}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item: any) => {
                const id = item.id || item._id;
                const artwork = item.artworkUrl || (item as any).artwork_url;
                return (
                  <div
                    key={id}
                    onClick={() => {
                      onSelectTrack(item, activeTab === 'tracks' ? 'track' : 'playlist');
                      onClose();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                      background: '#111', borderRadius: 4, cursor: 'pointer',
                      border: '1px solid #333'
                    }}
                    data-testid={`attachment-${activeTab === 'tracks' ? 'track' : 'playlist'}-${id}`}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#555')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 2, background: '#333', flexShrink: 0, overflow: 'hidden' }}>
                      {artwork && <img src={artwork} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{activeTab === 'tracks' ? 'Track' : 'Playlist'}</div>
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
