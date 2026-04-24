'use client';

import { type FC, useCallback, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TrackSummary } from '../model/playlist';
import s from './PlaylistTrackList.module.scss';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function formatTrackDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function getTrackId(track: TrackSummary | string): string {
  return typeof track === 'string' ? track : track._id;
}

function getTrackTitle(track: TrackSummary | string): string {
  return typeof track === 'string' ? 'Loading...' : track.title;
}

function getTrackArtist(track: TrackSummary | string): string {
  if (typeof track === 'string') return '';
  return track.artist?.displayName || '';
}

function getTrackArtwork(track: TrackSummary | string): string {
  if (typeof track === 'string') return '';
  return track.artworkUrl || '';
}

function getTrackDuration(track: TrackSummary | string): number {
  if (typeof track === 'string') return 0;
  return track.duration || 0;
}

/* ─── Sortable Track Row ──────────────────────────────────────────────────── */

interface SortableTrackRowProps {
  track: TrackSummary | string;
  index: number;
  isOwner: boolean;
  onRemove: (trackId: string) => void;
}

const SortableTrackRow: FC<SortableTrackRowProps> = ({
  track,
  index,
  isOwner,
  onRemove,
}) => {
  const trackId = getTrackId(track);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trackId, disabled: !isOwner });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${s.trackRow} ${isDragging ? s.trackRowDragging : ''}`}
      data-testid={`playlist-track-${trackId}`}
    >
      {/* Drag Handle */}
      {isOwner && (
        <button
          className={s.dragHandle}
          {...attributes}
          {...listeners}
          data-testid={`playlist-track-drag-${trackId}`}
          aria-label="Drag to reorder"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 6h2v2H8zm6 0h2v2h-2zM8 11h2v2H8zm6 0h2v2h-2zM8 16h2v2H8zm6 0h2v2h-2z" />
          </svg>
        </button>
      )}

      {/* Position Number */}
      <span className={s.position}>{index + 1}</span>

      {/* Track Artwork */}
      <div className={s.trackArtwork}>
        {getTrackArtwork(track) ? (
          <img src={getTrackArtwork(track)} alt={getTrackTitle(track)} />
        ) : (
          <div className={s.trackArtworkPlaceholder}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className={s.trackInfo}>
        <span className={s.trackTitle}>{getTrackTitle(track)}</span>
        <span className={s.trackArtist}>{getTrackArtist(track)}</span>
      </div>

      {/* Duration */}
      <span className={s.trackDuration}>
        {getTrackDuration(track) > 0 ? formatTrackDuration(getTrackDuration(track)) : '--:--'}
      </span>

      {/* Remove Button */}
      {isOwner && (
        <button
          className={s.removeBtn}
          onClick={() => onRemove(trackId)}
          data-testid={`playlist-track-remove-${trackId}`}
          aria-label="Remove track"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

/* ─── PlaylistTrackList ───────────────────────────────────────────────────── */

interface PlaylistTrackListProps {
  tracks: (TrackSummary | string)[];
  isOwner: boolean;
  trackCount: number;
  onReorder: (trackIds: string[]) => void;
  onRemove: (trackId: string) => void;
  onAddTracks: () => void;
}

export const PlaylistTrackList: FC<PlaylistTrackListProps> = ({
  tracks,
  isOwner,
  trackCount,
  onReorder,
  onRemove,
  onAddTracks,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const trackIds = useMemo(() => tracks.map(getTrackId), [tracks]);
  const isAtLimit = trackCount >= 500;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = trackIds.indexOf(active.id as string);
      const newIndex = trackIds.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(trackIds, oldIndex, newIndex);
      onReorder(newOrder);
    },
    [trackIds, onReorder],
  );

  // Empty state
  if (tracks.length === 0) {
    return (
      <div className={s.emptyState} data-testid="playlist-tracks-empty">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <h3 className={s.emptyTitle}>No tracks yet</h3>
        <p className={s.emptyText}>
          {isOwner
            ? 'Add tracks to your playlist to get started.'
            : 'This playlist doesn\'t have any tracks yet.'}
        </p>
        {isOwner && (
          <button className={s.addTracksBtn} onClick={onAddTracks} data-testid="playlist-add-first-track">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add your first track
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={s.trackList} data-testid="playlist-track-list">
      {/* Header */}
      <div className={s.listHeader}>
        <h2 className={s.listTitle}>
          Tracks
          <span className={s.listCount}>{trackCount}</span>
        </h2>
        {isOwner && (
          <div className={s.listActions}>
            <span className={s.limitIndicator}>
              {trackCount}/500
            </span>
            <button
              className={s.addTracksBtn}
              onClick={onAddTracks}
              disabled={isAtLimit}
              title={isAtLimit ? 'Track limit reached (500)' : 'Add tracks'}
              data-testid="playlist-add-tracks"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add tracks
            </button>
          </div>
        )}
      </div>

      {/* Track Rows */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={trackIds} strategy={verticalListSortingStrategy}>
          {tracks.map((track, index) => (
            <SortableTrackRow
              key={getTrackId(track)}
              track={track}
              index={index}
              isOwner={isOwner}
              onRemove={onRemove}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
