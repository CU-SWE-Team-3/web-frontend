'use client';

import { type FC, useState, useEffect, useCallback } from 'react';
import { AppModal } from '@/shared/ui/AppModal';
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
import type {
  Playlist,
  UpdatePlaylistInput,
  TrackSummary,
  ReleaseType,
} from '../model/playlist';
import s from './EditPlaylistModal.module.scss';

type EditTab = 'basic' | 'tracks' | 'metadata';

const GENRE_OPTIONS = [
  'None', 'Alternative Rock', 'Ambient', 'Classical', 'Country', 'Dance & EDM',
  'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic',
  'Folk & Singer-Songwriter', 'Hip-hop & Rap', 'House', 'Indie', 'Jazz & Blues',
  'Latin', 'Metal', 'Piano', 'Pop', 'R&B & Soul', 'Reggae', 'Reggaeton',
  'Rock', 'Soundtrack', 'Techno', 'Trance', 'Trap', 'Triphop', 'World',
];

const PLAYLIST_TYPES: { value: ReleaseType; label: string }[] = [
  { value: 'playlist', label: 'Playlist' },
  { value: 'album', label: 'Album' },
  { value: 'ep', label: 'EP' },
  { value: 'single', label: 'Single' },
];

/* ─── Sortable Track Row (for Tracks tab) ─── */
interface SortableEditTrackProps {
  track: TrackSummary | string;
  onRemove: (id: string) => void;
}

function getTrackId(t: TrackSummary | string): string {
  return typeof t === 'string' ? t : t._id;
}

const SortableEditTrack: FC<SortableEditTrackProps> = ({ track, onRemove }) => {
  const id = getTrackId(track);
  const title = typeof track === 'string' ? 'Loading...' : track.title;
  const artist = typeof track === 'string' ? '' : (track.artist as any)?.displayName || '';
  const artwork = typeof track === 'string' ? '' : track.artworkUrl || '';
  const duration = typeof track === 'string' ? 0 : track.duration || 0;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  const durationStr = duration > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : '--:--';

  return (
    <div ref={setNodeRef} style={style} className={s.trackRow} {...attributes} {...listeners}>
      <div className={s.trackThumb}>
        {artwork ? <img src={artwork} alt={title} /> : <div className={s.trackThumbEmpty} />}
      </div>
      <div className={s.trackLabel}>
        {artist && <span className={s.trackArtist}>{artist}</span>}
        {artist && <span className={s.trackSep}> — </span>}
        <span className={s.trackName}>{title}</span>
      </div>
      <span className={s.trackDuration}>{durationStr}</span>
      <button
        className={s.trackRemove}
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        aria-label="Remove"
        data-testid={`edit-track-remove-${id}`}
      >
        ✕
      </button>
    </div>
  );
};

/* ─── Main Component ─── */
interface EditPlaylistModalProps {
  open: boolean;
  onClose: () => void;
  playlist: Playlist;
  onSave: (input: UpdatePlaylistInput) => void;
  onTracksChange: (trackIds: string[]) => void;
  onArtworkUpload: (file: File) => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isUploadingArtwork?: boolean;
}

export const EditPlaylistModal: FC<EditPlaylistModalProps> = ({
  open,
  onClose,
  playlist,
  onSave,
  onTracksChange,
  onArtworkUpload,
  onDelete,
  isSaving,
  isUploadingArtwork,
}) => {
  const [activeTab, setActiveTab] = useState<EditTab>('basic');

  // Basic info fields
  const [title, setTitle] = useState('');
  const [permalink, setPermalink] = useState('');
  const [releaseType, setReleaseType] = useState<ReleaseType>('playlist');
  const [releaseDate, setReleaseDate] = useState('');
  const [genre, setGenre] = useState('None');
  const [tagsInput, setTagsInput] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  // Metadata fields
  const [labelName, setLabelName] = useState('');
  const [buyLink, setBuyLink] = useState('');
  const [buyTitle, setBuyTitle] = useState('');
  const [upc, setUpc] = useState('');

  // Tracks
  const [localTracks, setLocalTracks] = useState<(TrackSummary | string)[]>([]);

  // Pre-fill
  useEffect(() => {
    if (playlist && open) {
      setTitle(playlist.title || '');
      setPermalink(playlist.permalink || '');
      setReleaseType(playlist.releaseType || 'playlist');
      setReleaseDate(playlist.releaseDate ? playlist.releaseDate.slice(0, 10) : '');
      setGenre(playlist.genre || 'None');
      setTagsInput((playlist.tags || []).join(', '));
      setDescription(playlist.description || '');
      setIsPrivate(playlist.isPrivate || false);
      setLabelName(playlist.labelName || '');
      setBuyLink(playlist.buyLink || '');
      setBuyTitle(playlist.buyTitle || '');
      setUpc(playlist.upc || '');
      setLocalTracks([...(playlist.tracks || [])]);
      setActiveTab('basic');
    }
  }, [playlist, open]);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const trackIds = localTracks.map(getTrackId);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = trackIds.indexOf(active.id as string);
      const newIdx = trackIds.indexOf(over.id as string);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(localTracks, oldIdx, newIdx);
      setLocalTracks(reordered);
    },
    [localTracks, trackIds],
  );

  const handleRemoveTrack = (trackId: string) => {
    setLocalTracks((prev) => prev.filter((t) => getTrackId(t) !== trackId));
  };

  const handleSave = () => {
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    const input: UpdatePlaylistInput = {
      title: title.trim(),
      ...(description && { description }),
      releaseType,
      ...(tags.length > 0 && { tags }),
      ...(genre !== 'None' && { genre }),
      ...(releaseDate && { releaseDate: new Date(releaseDate).toISOString() }),
      ...(labelName && { labelName }),
      ...(buyLink && { buyLink }),
      ...(buyTitle && { buyTitle }),
      ...(upc && { upc }),
      isPrivate,
    };

    onSave(input);

    // Also update tracks if changed
    const originalIds = (playlist.tracks || []).map(getTrackId);
    const newIds = localTracks.map(getTrackId);
    if (JSON.stringify(originalIds) !== JSON.stringify(newIds)) {
      onTracksChange(newIds);
    }
  };

  const handleArtworkClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png';
    input.onchange = () => {
      if (input.files?.[0]) onArtworkUpload(input.files[0]);
    };
    input.click();
  };

  return (
    <AppModal open={open} onOpenChange={(v) => !v && onClose()} size="lg">
      <div className={s.modal}>
        {/* ─── Tabs ─── */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${activeTab === 'basic' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic info
          </button>
          <button
            className={`${s.tab} ${activeTab === 'tracks' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('tracks')}
          >
            Tracks
          </button>
          <button
            className={`${s.tab} ${activeTab === 'metadata' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('metadata')}
          >
            Metadata
          </button>
        </div>

        {/* ─── Basic Info Tab ─── */}
        {activeTab === 'basic' && (
          <div className={s.basicTab}>
            {/* Left: Artwork */}
            <div className={s.artworkCol}>
              <div className={s.artworkBox} onClick={handleArtworkClick}>
                {playlist.artworkUrl ? (
                  <img src={playlist.artworkUrl} alt={playlist.title} className={s.artworkImg} />
                ) : (
                  <div className={s.artworkPlaceholder}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </div>
                )}
                {isUploadingArtwork && (
                  <div className={s.artworkUploading}>
                    <span className={s.spinner} />
                  </div>
                )}
              </div>
              
              {/* Zoom Slider (Visual match only) */}
              <div className={s.zoomSliderContainer}>
                <button className={s.zoomBtn} aria-label="Zoom out">−</button>
                <div className={s.sliderTrack}>
                  <div className={s.sliderHandle} />
                </div>
                <button className={s.zoomBtn} aria-label="Zoom in">+</button>
              </div>

              <button className={s.replaceImageBtn} onClick={handleArtworkClick}>
                {isUploadingArtwork ? 'Uploading...' : 'Replace image'}
              </button>
            </div>

            {/* Right: Fields */}
            <div className={s.fieldsCol}>
              {/* Title */}
              <div className={s.field}>
                <label className={s.label}>Title <span className={s.req}>*</span></label>
                <input
                  className={s.input}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="edit-playlist-title"
                />
              </div>

              {/* Permalink */}
              <div className={s.field}>
                <label className={s.label}>Permalink</label>
                <div className={s.permalinkRow}>
                  <span className={s.permalinkPrefix}>biobeats.com/sets/</span>
                  <input
                    className={s.input}
                    type="text"
                    value={permalink}
                    onChange={(e) => setPermalink(e.target.value)}
                  />
                </div>
              </div>

              {/* Playlist type + Release date */}
              <div className={s.inlineRow}>
                <div className={s.field} style={{ flex: 1 }}>
                  <label className={s.label}>Playlist type</label>
                  <select
                    className={s.select}
                    value={releaseType}
                    onChange={(e) => setReleaseType(e.target.value as ReleaseType)}
                  >
                    {PLAYLIST_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                </div>
                <div className={s.field} style={{ flex: 1 }}>
                  <label className={s.label}>Release date</label>
                  <input
                    className={s.input}
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div>

              {/* Genre */}
              <div className={s.field}>
                <label className={s.label}>Genre</label>
                <select
                  className={s.select}
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                >
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className={s.field}>
                <label className={s.label}>Additional tags</label>
                <input
                  className={s.input}
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Add tags to describe the genre and mood of your playlist"
                />
              </div>

              {/* Description */}
              <div className={s.field}>
                <label className={s.label}>Description</label>
                <textarea
                  className={s.textarea}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your playlist"
                  rows={3}
                />
              </div>

              {/* Privacy */}
              <div className={s.privacySection}>
                <span className={s.privacySectionLabel}>Privacy:</span>
                <label className={s.radioOption}>
                  <input
                    type="radio"
                    name="edit-privacy"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className={s.radio}
                  />
                  <div>
                    <span className={s.radioMain}>Public</span>
                    <span className={s.radioDesc}>Anyone will be able to listen to this playlist.</span>
                  </div>
                </label>
                <label className={s.radioOption}>
                  <input
                    type="radio"
                    name="edit-privacy"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className={s.radio}
                  />
                  <div>
                    <span className={s.radioMain}>Private</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tracks Tab ─── */}
        {activeTab === 'tracks' && (
          <div className={s.tracksTab}>
            {localTracks.length === 0 ? (
              <div className={s.tracksEmpty}>No tracks in this playlist.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={trackIds} strategy={verticalListSortingStrategy}>
                  {localTracks.map((track) => (
                    <SortableEditTrack
                      key={getTrackId(track)}
                      track={track}
                      onRemove={handleRemoveTrack}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        )}

        {/* ─── Metadata Tab ─── */}
        {activeTab === 'metadata' && (
          <div className={s.metadataTab}>
            <div className={s.field}>
              <label className={s.label}>Label name</label>
              <input className={s.input} type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} />
            </div>
            <div className={s.inlineRow}>
              <div className={s.field} style={{ flex: 2 }}>
                <label className={s.label}>Buy link</label>
                <input className={s.input} type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} placeholder="https://..." />
              </div>
              <div className={s.field} style={{ flex: 1 }}>
                <label className={s.label}>Buy title</label>
                <input className={s.input} type="text" value={buyTitle} onChange={(e) => setBuyTitle(e.target.value)} placeholder="Buy" />
              </div>
            </div>
            <div className={s.field}>
              <label className={s.label}>UPC / EAN</label>
              <input className={s.input} type="text" value={upc} onChange={(e) => setUpc(e.target.value)} />
            </div>
          </div>
        )}

        {/* ─── Footer ─── */}
        <div className={s.footer}>
          <span className={s.requiredNote}>
            <span className={s.req}>*</span> Required fields
            {onDelete && (
              <button
                className={s.deleteLink}
                onClick={(e) => {
                  e.preventDefault();
                  onDelete();
                }}
                data-testid="edit-modal-delete-btn"
              >
                Delete playlist
              </button>
            )}
          </span>
          <div className={s.footerActions}>
            <button className={s.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              className={s.saveBtn}
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              data-testid="edit-playlist-save"
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
