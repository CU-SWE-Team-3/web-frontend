'use client';

import { type FC, useState, useEffect, useMemo, useCallback } from 'react';
import { AppModal } from '@/shared/ui/AppModal';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import {
  useUserPlaylists,
  useCreatePlaylist,
  useUpdatePlaylistTracks,
} from '../model/playlistQueries';
import { playlistsRepository } from '../api/playlistsRepository';
import type { Playlist, CreatePlaylistInput, TrackSummary } from '../model/playlist';
import { AppToast } from '@/shared/ui/AppToast';
import s from './AddToPlaylistModal.module.scss';

type ModalTab = 'add' | 'create';

interface AddToPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  /** The track ID to add to a playlist */
  trackId: string;
  trackTitle?: string;
}

/**
 * SoundCloud-style "Add to playlist / Create a playlist" dual-tab modal.
 * Matches the real SoundCloud UI exactly:
 *  - Tab 1: "Add to playlist" — filter + list of existing playlists with "Add to Playlist" button
 *  - Tab 2: "Create a playlist" — title + privacy + Save
 */
export const AddToPlaylistModal: FC<AddToPlaylistModalProps> = ({
  open,
  onClose,
  trackId,
  trackTitle,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('add');
  const [filter, setFilter] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const userId = (user as any)?._id || user?.id || '';

  // 1. Fetch ALL user playlists/collections just in case older playlists 
  // were created without the 'releaseType' parameter.
  const { data: playlists, isLoading } = useUserPlaylists(userId);

  const createPlaylist = useCreatePlaylist();
  const updateTracks = useUpdatePlaylistTracks();

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Pre-fill create title
  useEffect(() => {
    if (open && trackTitle) {
      setNewTitle(`Related tracks: ${trackTitle}`);
    }
  }, [open, trackTitle]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setActiveTab('add');
      setFilter('');
      setNewTitle('');
      setIsPrivate(false);
      setSelectedPlaylistId(null);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!playlists) return [];
    if (!filter.trim()) return playlists;
    const q = filter.toLowerCase();
    return playlists.filter((p: Playlist) => p.title.toLowerCase().includes(q));
  }, [playlists, filter]);

  // Check if track is already in a playlist
  const isTrackInPlaylist = useCallback(
    (playlist: Playlist): boolean => {
      return (playlist.tracks || []).some((t: TrackSummary | string) => {
        const id = typeof t === 'string' ? t : t._id;
        return id === trackId;
      });
    },
    [trackId],
  );

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId) return;
    const playlistSummary = (playlists || []).find((p: Playlist) => p._id === selectedPlaylistId);
    if (!playlistSummary) return;

    try {
      // 1. Fetch the FULL playlist to get all tracks, since the List API truncates
      const fullPlaylist = await playlistsRepository.getPlaylistById(selectedPlaylistId);

      const existingIds = (fullPlaylist.tracks || []).map((t: TrackSummary | string) =>
        typeof t === 'string' ? t : t._id,
      );
      
      if (existingIds.includes(trackId)) return;
      
      const newIds = [...existingIds, trackId];

      updateTracks.mutate(
        { id: selectedPlaylistId, trackIds: newIds },
        { 
          onSuccess: () => {
            setToastMessage(`Added to ${playlistSummary.title}`);
            setToastOpen(true);
            setTimeout(() => onClose(), 2000);
          }
        },
      );
    } catch (err) {
      console.error('Failed to add track to playlist:', err);
    }
  };

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createPlaylist.mutate(
      { title: newTitle.trim(), isPrivate, releaseType: 'playlist' } as CreatePlaylistInput,
      {
        onSuccess: (newPlaylist) => {
          // Add the track to the newly created playlist
          updateTracks.mutate(
            { id: newPlaylist._id, trackIds: [trackId] },
            { 
              onSuccess: () => {
                setToastMessage(`Created and added to ${newPlaylist.title}`);
                setToastOpen(true);
                setTimeout(() => onClose(), 2000);
              } 
            },
          );
        },
      },
    );
  };

  return (
    <AppModal open={open} onOpenChange={(v) => !v && onClose()} size="md">
      <div className={s.modal}>
        {/* ─── Tab Switcher ─── */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${activeTab === 'add' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('add')}
            data-testid="add-to-playlist-tab-add"
          >
            Add to playlist
          </button>
          <button
            className={`${s.tab} ${activeTab === 'create' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('create')}
            data-testid="add-to-playlist-tab-create"
          >
            Create a playlist
          </button>
        </div>

        {/* ─── "Add to playlist" tab ─── */}
        {activeTab === 'add' && (
          <div className={s.tabBody}>
            <input
              type="text"
              className={s.filterInput}
              placeholder="Filter playlists"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              data-testid="add-to-playlist-filter"
            />

            <div className={s.playlistList}>
              {isLoading || !user ? (
                <div className={s.loadingState}>
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--sc-gray-400)' }}>
                    Loading playlists...
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className={s.emptyState} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                  <span>{filter ? 'No matching playlists' : 'No playlists yet'}</span>
                  {!filter && (
                    <button 
                      onClick={() => setActiveTab('create')}
                      style={{
                        background: 'var(--sc-primary, #ff5500)',
                        color: '#fff', border: 'none', borderRadius: 4,
                        padding: '8px 16px', fontSize: 13, cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Create new playlist
                    </button>
                  )}
                </div>
              ) : (
                filtered.map((pl: Playlist) => {
                  const alreadyAdded = isTrackInPlaylist(pl);
                  const isSelected = selectedPlaylistId === pl._id;
                  const displayTrackCount = Array.isArray(pl.tracks)
                    ? pl.tracks.length
                    : pl.trackCount || 0;

                  return (
                    <div
                      key={pl._id}
                      className={`${s.playlistRow} ${isSelected ? s.playlistRowSelected : ''} ${alreadyAdded ? s.playlistRowAdded : ''}`}
                      onClick={() => !alreadyAdded && setSelectedPlaylistId(pl._id)}
                      data-testid={`add-to-playlist-row-${pl._id}`}
                    >
                      {/* Checkmark for already added */}
                      <div className={s.checkCol}>
                        {alreadyAdded && (
                          <span className={s.checkmark}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="11" fill="#0a0" />
                              <polyline points="7,12 10,15 17,8" stroke="#fff" strokeWidth="2" fill="none" />
                            </svg>
                          </span>
                        )}
                      </div>

                      {/* Artwork */}
                      <div className={s.rowArtwork}>
                        {pl.artworkUrl ? (
                          <img src={pl.artworkUrl} alt={pl.title} />
                        ) : (
                          <div className={s.rowArtworkPlaceholder} />
                        )}
                      </div>

                      {/* Info */}
                      <div className={s.rowInfo}>
                        <span className={s.rowTitle}>{pl.title}</span>
                        <span className={s.rowCount}>{displayTrackCount}</span>
                      </div>

                      {/* Add button */}
                      {!alreadyAdded && isSelected && (
                        <button
                          className={s.addToPlaylistBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToPlaylist();
                          }}
                          disabled={updateTracks.isPending}
                          data-testid="add-to-playlist-confirm"
                        >
                          {updateTracks.isPending ? 'Adding...' : 'Add to Playlist'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── "Create a playlist" tab ─── */}
        {activeTab === 'create' && (
          <div className={s.tabBody}>
            <div className={s.createForm}>
              <label className={s.fieldLabel}>
                Playlist title <span className={s.required}>*</span>
              </label>
              <input
                type="text"
                className={s.titleInput}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder=""
                autoFocus
                data-testid="create-playlist-title"
              />

              <div className={s.privacyRow}>
                <span className={s.privacyLabel}>Privacy:</span>
                <label className={s.radioLabel}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className={s.radio}
                  />
                  Public
                </label>
                <label className={s.radioLabel}>
                  <input
                    type="radio"
                    name="privacy"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className={s.radio}
                  />
                  Private
                </label>

                <button
                  className={s.saveBtn}
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || createPlaylist.isPending}
                  data-testid="create-playlist-save"
                >
                  {createPlaylist.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AppToast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        variant="success"
        duration={2000}
      />
    </AppModal>
  );
};
