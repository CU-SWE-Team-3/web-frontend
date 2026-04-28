'use client';

import { type FC, useState, useMemo, useCallback } from 'react';
import { AppModal } from '@/shared/ui/AppModal';
import { tracksRepository } from '@/features/tracks/api/tracksRepository';
import type { Track } from '@/features/tracks/model/track';
import s from './TrackPickerModal.module.scss';

interface TrackPickerModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (trackIds: string[]) => void;
  /** Track IDs already in the playlist (to show as "added") */
  existingTrackIds: string[];
  maxTracks?: number;
  currentTrackCount: number;
}

export const TrackPickerModal: FC<TrackPickerModalProps> = ({
  open,
  onClose,
  onAdd,
  existingTrackIds,
  maxTracks = 500,
  currentTrackCount,
}) => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const remainingSlots = maxTracks - currentTrackCount;

  // Fetch user's tracks on open
  const fetchTracks = useCallback(async () => {
    if (hasFetched) return;
    setIsLoading(true);
    try {
      const result = await tracksRepository.getTracks();
      setTracks(result);
    } catch (err) {
      console.warn('[TrackPickerModal] Failed to fetch tracks:', err);
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [hasFetched]);

  // Fetch on open
  if (open && !hasFetched && !isLoading) {
    fetchTracks();
  }

  // Reset on close
  const handleClose = () => {
    setSelected(new Set());
    setQuery('');
    setHasFetched(false);
    setTracks([]);
    onClose();
  };

  // Filter tracks by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return tracks;
    const q = query.toLowerCase();
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q),
    );
  }, [tracks, query]);

  const toggleTrack = (trackId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        // Check limit
        if (next.size >= remainingSlots) return prev;
        next.add(trackId);
      }
      return next;
    });
  };

  const handleAdd = () => {
    if (selected.size === 0) return;
    onAdd(Array.from(selected));
    handleClose();
  };

  return (
    <AppModal
      open={open}
      onOpenChange={(v) => !v && handleClose()}
      size="lg"
      title="Add Tracks"
      description={`Select tracks to add (${remainingSlots} slots remaining)`}
    >
      <div className={s.picker}>
        {/* Search */}
        <input
          type="text"
          className={s.search}
          placeholder="Search your tracks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="track-picker-search"
          autoFocus
        />

        {/* Track List */}
        <div className={s.list}>
          {isLoading ? (
            <div className={s.loadingState}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={s.skeleton} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={s.emptyState}>
              {hasFetched ? 'No tracks found' : 'Loading...'}
            </div>
          ) : (
            filtered.map((track) => {
              const alreadyAdded = existingTrackIds.includes(track.id);
              const isSelected = selected.has(track.id);
              const isDisabled = alreadyAdded || (!isSelected && selected.size >= remainingSlots);

              return (
                <label
                  key={track.id}
                  className={`${s.trackOption} ${alreadyAdded ? s.trackOptionDisabled : ''} ${isSelected ? s.trackOptionSelected : ''}`}
                  data-testid={`track-picker-option-${track.id}`}
                >
                  <input
                    type="checkbox"
                    className={s.checkbox}
                    checked={isSelected || alreadyAdded}
                    disabled={isDisabled}
                    onChange={() => !alreadyAdded && toggleTrack(track.id)}
                  />
                  <div className={s.trackThumb}>
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} alt={track.title} />
                    ) : (
                      <div className={s.trackThumbPlaceholder} />
                    )}
                  </div>
                  <div className={s.trackDetails}>
                    <span className={s.trackName}>{track.title}</span>
                    <span className={s.trackArtist}>{track.artist}</span>
                  </div>
                  <span className={s.trackDur}>{track.duration}</span>
                  {alreadyAdded && <span className={s.addedBadge}>Added</span>}
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={s.footer}>
          <span className={s.selectedCount}>
            {selected.size} track{selected.size !== 1 ? 's' : ''} selected
          </span>
          <div className={s.footerActions}>
            <button className={s.cancelBtn} onClick={handleClose} data-testid="track-picker-cancel">
              Cancel
            </button>
            <button
              className={s.addBtn}
              onClick={handleAdd}
              disabled={selected.size === 0}
              data-testid="track-picker-add"
            >
              Add {selected.size > 0 ? `(${selected.size})` : ''}
            </button>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
