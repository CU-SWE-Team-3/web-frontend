'use client';

import React from 'react';
import { useUserTracks } from '@/features/tracks/model/trackQueries';
import { CloseIcon } from '@/shared/ui/icons';

export interface AddAttachmentModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTrack: (track: any) => void;
}

export const AddAttachmentModal: React.FC<AddAttachmentModalProps> = ({
  open,
  onClose,
  onSelectTrack,
}) => {
  const { data: myTracks = [], isLoading } = useUserTracks('me');

  if (!open) return null;

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

        {/* Content */}
        <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600, color: '#999' }}>My Tracks</div>
          {isLoading ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>Loading your tracks...</div>
          ) : myTracks.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>You don't have any tracks yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTracks.map(track => (
                <div
                  key={track.id}
                  onClick={() => {
                    onSelectTrack(track);
                    onClose();
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                    background: '#111', borderRadius: 4, cursor: 'pointer',
                    border: '1px solid #333'
                  }}
                  data-testid={`attachment-track-${track.id}`}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#555')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#333')}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 2, background: '#333', flexShrink: 0, overflow: 'hidden' }}>
                    {track.artworkUrl && <img src={track.artworkUrl} alt={track.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>Track</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
