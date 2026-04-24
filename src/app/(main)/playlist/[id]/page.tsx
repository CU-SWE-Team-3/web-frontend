'use client';

import { type FC, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { AppToast } from '@/shared/ui/AppToast';
import { ROUTES } from '@/shared/constants/routes';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import {
  usePlaylist,
  useUpdatePlaylist,
  useDeletePlaylist,
  useUpdatePlaylistTracks,
  useUploadPlaylistArtwork,
} from '@/features/playlists/model/playlistQueries';
import { PlaylistDetailHeader } from '@/features/playlists/ui/PlaylistDetailHeader';
import { PlaylistTrackList } from '@/features/playlists/ui/PlaylistTrackList';
import { EditPlaylistModal } from '@/features/playlists/ui/EditPlaylistModal';
import { PlaylistShareModal } from '@/features/playlists/ui/PlaylistShareModal';
import { DeletePlaylistDialog } from '@/features/playlists/ui/DeletePlaylistDialog';
import { TrackPickerModal } from '@/features/playlists/ui/TrackPickerModal';
import type { Playlist, TrackSummary, UpdatePlaylistInput } from '@/features/playlists/model/playlist';
import s from './PlaylistPage.module.scss';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getTrackId(track: TrackSummary | string): string {
  return typeof track === 'string' ? track : track._id;
}

function isOwnerOfPlaylist(playlist: Playlist, userId?: string): boolean {
  if (!userId) return false;
  const creatorId = typeof playlist.creator === 'string'
    ? playlist.creator
    : playlist.creator._id;
  return creatorId === userId;
}

/* ─── Page Content ────────────────────────────────────────────────────────── */

function PlaylistPageContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const secretToken = searchParams.get('secretToken') || undefined;
  const playlistId = params.id;

  // Auth
  const user = useAuthStore((s) => s.user);
  const userId = (user as any)?._id || user?.id || '';

  // Data
  const {
    data: playlist,
    isLoading,
    error,
  } = usePlaylist(playlistId, secretToken);

  // Mutations
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const updateTracks = useUpdatePlaylistTracks();
  const uploadArtwork = useUploadPlaylistArtwork();

  // Modal state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    variant: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = (message: string, variant: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, variant });
  };

  const isOwner = playlist ? isOwnerOfPlaylist(playlist, userId) : false;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleEdit = useCallback(
    (input: UpdatePlaylistInput) => {
      if (!playlist) return;
      updatePlaylist.mutate(
        { id: playlist._id, input },
        {
          onSuccess: () => {
            setEditOpen(false);
            showToast('Playlist updated');
          },
          onError: () => showToast('Failed to update playlist', 'error'),
        },
      );
    },
    [playlist, updatePlaylist],
  );

  const handleDelete = useCallback(() => {
    if (!playlist) return;
    deletePlaylist.mutate(playlist._id, {
      onSuccess: () => {
        showToast('Playlist deleted');
        router.push(ROUTES.LIBRARY);
      },
      onError: () => showToast('Failed to delete playlist', 'error'),
    });
  }, [playlist, deletePlaylist, router]);

  const handleReorder = useCallback(
    (newTrackIds: string[]) => {
      if (!playlist) return;
      updateTracks.mutate(
        { id: playlist._id, trackIds: newTrackIds },
        {
          onError: () => showToast('Failed to reorder tracks', 'error'),
        },
      );
    },
    [playlist, updateTracks],
  );

  const handleRemoveTrack = useCallback(
    (trackId: string) => {
      if (!playlist) return;
      const currentIds = playlist.tracks.map(getTrackId);
      const newIds = currentIds.filter((id) => id !== trackId);
      updateTracks.mutate(
        { id: playlist._id, trackIds: newIds },
        {
          onSuccess: () => showToast('Track removed'),
          onError: () => showToast('Failed to remove track', 'error'),
        },
      );
    },
    [playlist, updateTracks],
  );

  const handleAddTracks = useCallback(
    (trackIds: string[]) => {
      if (!playlist) return;
      const currentIds = playlist.tracks.map(getTrackId);
      const newIds = [...currentIds, ...trackIds];
      updateTracks.mutate(
        { id: playlist._id, trackIds: newIds },
        {
          onSuccess: () =>
            showToast(`Added ${trackIds.length} track${trackIds.length > 1 ? 's' : ''}`),
          onError: () => showToast('Failed to add tracks', 'error'),
        },
      );
    },
    [playlist, updateTracks],
  );

  const handleArtworkUpload = useCallback(
    (file: File) => {
      if (!playlist) return;
      uploadArtwork.mutate(
        { id: playlist._id, file },
        {
          onSuccess: () => showToast('Artwork updated'),
          onError: () => showToast('Failed to upload artwork', 'error'),
        },
      );
    },
    [playlist, uploadArtwork],
  );

  // ─── Loading State ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={s.page}>
        <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />
        <div className={s.container}>
          <div className={s.loadingState}>
            <div className={s.skeletonArtwork} />
            <div className={s.skeletonInfo}>
              <div className={s.skeletonLine} style={{ width: '30%' }} />
              <div className={s.skeletonLine} style={{ width: '60%', height: 32 }} />
              <div className={s.skeletonLine} style={{ width: '40%' }} />
              <div className={s.skeletonLine} style={{ width: '50%' }} />
            </div>
          </div>
          <div className={s.skeletonTracks}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={s.skeletonTrackRow} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error / Not Found / Private ─────────────────────────────────────────

  if (error || !playlist) {
    const isPrivateError =
      (error as any)?.response?.status === 403 ||
      (error as any)?.response?.status === 404;

    return (
      <div className={s.page}>
        <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />
        <div className={s.container}>
          <div className={s.errorState} data-testid="playlist-error-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
            </svg>
            <h2 className={s.errorTitle}>
              {isPrivateError ? 'This playlist is private' : 'Playlist not found'}
            </h2>
            <p className={s.errorText}>
              {isPrivateError
                ? 'You need permission to access this playlist, or a valid secret link.'
                : 'The playlist you\'re looking for doesn\'t exist or has been deleted.'}
            </p>
            <button className={s.backBtn} onClick={() => router.push(ROUTES.LIBRARY)}>
              Go to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const existingTrackIds = playlist.tracks.map(getTrackId);

  return (
    <div className={s.page}>
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <div className={s.container}>
        <PlaylistDetailHeader
          playlist={playlist}
          isOwner={isOwner}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onShare={() => setShareOpen(true)}
          onArtworkUpload={handleArtworkUpload}
          isUploadingArtwork={uploadArtwork.isPending}
        />

        <PlaylistTrackList
          tracks={playlist.tracks}
          isOwner={isOwner}
          trackCount={playlist.trackCount}
          onReorder={handleReorder}
          onRemove={handleRemoveTrack}
          onAddTracks={() => setPickerOpen(true)}
        />
      </div>

      {/* ─── Modals ─── */}
      {isOwner && (
        <>
          <EditPlaylistModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            playlist={playlist}
            onSave={handleEdit}
            onTracksChange={handleReorder}
            onArtworkUpload={handleArtworkUpload}
            isSaving={updatePlaylist.isPending}
            isUploadingArtwork={uploadArtwork.isPending}
          />

          <DeletePlaylistDialog
            open={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDelete}
            playlistTitle={playlist.title}
            isLoading={deletePlaylist.isPending}
          />

          <TrackPickerModal
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onAdd={handleAddTracks}
            existingTrackIds={existingTrackIds}
            currentTrackCount={playlist.trackCount}
          />
        </>
      )}

      <PlaylistShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        playlist={playlist}
      />

      {/* Toast */}
      {toast && (
        <AppToast
          message={toast.message}
          variant={toast.variant}
          open={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

/* ─── Page Component ──────────────────────────────────────────────────────── */

const PlaylistPage: FC<{ params: { id: string } }> = ({ params }) => {
  return (
    <Suspense
      fallback={
        <div className={s.page}>
          <div className={s.container}>
            <div className={s.loadingState}>
              <div className={s.skeletonArtwork} />
              <div className={s.skeletonInfo}>
                <div className={s.skeletonLine} style={{ width: '40%' }} />
                <div className={s.skeletonLine} style={{ width: '60%', height: 32 }} />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PlaylistPageContent params={params} />
    </Suspense>
  );
};

export default PlaylistPage;
