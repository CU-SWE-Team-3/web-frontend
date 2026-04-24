'use client';

import { useState } from 'react';
import { EditPlaylistModal } from '@/features/playlists/ui/EditPlaylistModal';
import { AddToPlaylistModal } from '@/features/playlists/ui/AddToPlaylistModal';
import { PlaylistStreamCard } from '@/features/playlists/ui/PlaylistStreamCard';
import type { Playlist, TrackSummary } from '@/features/playlists/model/playlist';

const MOCK_CURRENT_USER = {
  _id: 'user123',
  displayName: 'Test Artist',
  permalink: 'test-artist',
  avatarUrl: ''
};

const MOCK_TRACKS: any[] = [
  { _id: 't1', title: 'Summer Breeze', artist: MOCK_CURRENT_USER, duration: 185 },
  { _id: 't2', title: 'Midnight City', artist: MOCK_CURRENT_USER, duration: 240 },
  { _id: 't3', title: 'Ocean Waves', artist: MOCK_CURRENT_USER, duration: 156 },
  { _id: 't4', title: 'Mountain Peak', artist: MOCK_CURRENT_USER, duration: 210 },
  { _id: 't5', title: 'Starlight', artist: MOCK_CURRENT_USER, duration: 198 },
  { _id: 't6', title: 'Neon Lights', artist: MOCK_CURRENT_USER, duration: 220 },
];

const MOCK_PLAYLIST: any = {
  _id: 'p1',
  title: 'My Awesome Set',
  permalink: 'my-awesome-set',
  creator: MOCK_CURRENT_USER,
  description: 'A test playlist to show off the UI components',
  releaseType: 'playlist',
  isPrivate: false,
  tags: ['electronic', 'chill', 'ambient'],
  genre: 'Deep House',
  artworkUrl: 'https://images.unsplash.com/photo-1614613535308-f41fd70fb758?w=300&h=300&fit=crop',
  tracks: MOCK_TRACKS,
  trackCount: 6,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function TestPlaylistsPage() {
  const [editOpen, setEditOpen] = useState(false);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', color: 'white' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
        Playlist UI Components Testing Ground
      </h1>
      <p style={{ marginBottom: '32px', color: '#999' }}>
        This page lets you test the UI components without needing a backend connection or login.
      </p>

      {/* ─── Buttons to trigger Modals ─── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        <button
          onClick={() => setEditOpen(true)}
          style={{ padding: '12px 24px', background: '#ff5500', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Open Edit Playlist Modal
        </button>
        <button
          onClick={() => setAddToPlaylistOpen(true)}
          style={{ padding: '12px 24px', background: '#333', border: '1px solid #666', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Open Add to Playlist Modal
        </button>
      </div>

      {/* ─── Stream Card Preview ─── */}
      <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Profile Stream Card UI</h2>
      <div style={{ background: '#111', padding: '24px', borderRadius: '8px', border: '1px solid #333' }}>
        <PlaylistStreamCard 
          playlist={MOCK_PLAYLIST} 
          isOwner={true} 
          onEdit={() => setEditOpen(true)}
          onShare={() => alert('Share clicked!')}
        />
      </div>

      {/* ─── Modals ─── */}
      <EditPlaylistModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        playlist={MOCK_PLAYLIST}
        onSave={(data) => {
          alert('Save called with: ' + JSON.stringify(data, null, 2));
          setEditOpen(false);
        }}
        onTracksChange={(ids) => alert('Tracks reordered: ' + ids.join(', '))}
        onArtworkUpload={() => alert('Artwork upload simulated!')}
      />

      <AddToPlaylistModal
        open={addToPlaylistOpen}
        onClose={() => setAddToPlaylistOpen(false)}
        trackId="t99"
      />
    </div>
  );
}
