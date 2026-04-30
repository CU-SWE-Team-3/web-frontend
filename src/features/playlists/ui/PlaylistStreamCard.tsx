'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { playlistsRepository } from '../api/playlistsRepository';
import { useTrack } from '@/features/tracks/model/trackQueries';
import { AppToast } from '@/shared/ui/AppToast';
import type { Playlist, TrackSummary } from '../model/playlist';
import s from './PlaylistStreamCard.module.scss';
import { useLikePlaylist, useUnlikePlaylist } from '../model/playlistQueries';

const MAX_VISIBLE_TRACKS = 5;

type TrackOrId = TrackSummary | string;

function getTrackId(track: TrackOrId): string {
  if (typeof track === 'string') return track;
  return (track as any)._id || (track as any).id;
}

function getCreatorName(creator: Playlist['creator']): string {
  if (typeof creator === 'string') return '';
  return creator.displayName || creator.permalink || '';
}

function getCreatorPermalink(creator: Playlist['creator']): string {
  if (typeof creator === 'string') return '';
  return creator.permalink || '';
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

interface PlaylistStreamCardProps {
  playlist: Playlist;
  isOwner?: boolean;
  onShare?: () => void;
  onEdit?: () => void;
  className?: string;
}

/* ─── Track Item with Dynamic Loading ─── */
interface StreamTrackItemProps {
  track: TrackOrId;
  index: number;
}

const StreamTrackItem: FC<StreamTrackItemProps> = ({ track: incomingTrack, index }) => {
  const isStringId = typeof incomingTrack === 'string';
  const { data: fetchedTrack } = useTrack(isStringId ? incomingTrack : undefined);
  const track = isStringId ? fetchedTrack || incomingTrack : incomingTrack;
  
  const id = getTrackId(track as any);
  const title = typeof track === 'string' ? 'Loading...' : track.title;
  
  // user only wants the name, no index or artist ID
  return (
    <div key={id} className={s.trackItem}>
      <span className={s.trackTitle}>{title}</span>
    </div>
  );
};

/**
 * Full-width SoundCloud-style playlist card as seen on the Profile > Playlists tab.
 */
export const PlaylistStreamCard: FC<PlaylistStreamCardProps> = ({
  playlist,
  isOwner,
  onShare,
  onEdit,
  className,
}) => {
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const playContext = usePlayerStore(s => s.playContext);

  const tracks = (playlist.tracks || []) as TrackOrId[];
  const visibleTracks = showAllTracks ? tracks : tracks.slice(0, MAX_VISIBLE_TRACKS);
  const hasMoreTracks = tracks.length > MAX_VISIBLE_TRACKS;
  const creatorName = getCreatorName(playlist.creator);
  const creatorPermalink = getCreatorPermalink(playlist.creator);

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (tracks.length === 0) return;

    try {
      // Fetch the full playlist so tracks have populated stream URLs
      const fullPlaylist = await playlistsRepository.getPlaylistById(playlist._id);
      const fullTracks = (fullPlaylist.tracks || []) as any[];

      if (fullTracks.length === 0) return;

      const resolvedTracks = fullTracks.map((t: any) => {
        if (typeof t === 'string') {
          return {
            id: t,
            title: 'Loading...',
            artist: '',
            artworkUrl: '',
            duration: 0,
            streamUrl: '',
            hlsUrl: '',
          };
        }
        const hls = t.hlsUrl || t.hls_url || t.audioUrl || t.audio_url || '';
        const stream = t.streamUrl || t.stream_url || hls || '';
        const artwork = t.artworkUrl || t.artwork_url || t.artwork || '';
        const artistObj = t.artist;
        let artistName = 'Unknown Artist';
        if (typeof artistObj === 'string') {
          artistName = artistObj;
        } else if (artistObj) {
          artistName = artistObj.displayName || artistObj.permalink || artistObj.username || 'Unknown Artist';
        }

        const trackId = t._id || t.id || (typeof t === 'string' ? t : '');

        return {
          id: trackId,
          title: t.title || 'Untitled',
          artist: artistName,
          artworkUrl: artwork,
          duration: t.duration || 0,
          streamUrl: stream,
          hlsUrl: hls,
        };
      });

      const firstPlayableIndex = resolvedTracks.findIndex(t => t.streamUrl || t.hlsUrl);
      const startIndex = firstPlayableIndex === -1 ? 0 : firstPlayableIndex;

      playContext(resolvedTracks, startIndex, {
        type: fullPlaylist.releaseType === 'album' ? 'album' : 'playlist',
        id: fullPlaylist._id,
        title: fullPlaylist.title,
      });
    } catch (err) {
      console.error('[PlaylistStreamCard] Failed to fetch playlist for playback:', err);
    }
  };

  const likeMutation = useLikePlaylist();
  const unlikeMutation = useUnlikePlaylist();
  const isLikePending = likeMutation.isPending || unlikeMutation.isPending;

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLikePending) return;
    if (playlist.isLiked) {
      unlikeMutation.mutate(playlist._id, {
        onSuccess: () => setToastMessage('Playlist unliked'),
      });
    } else {
      likeMutation.mutate(playlist._id, {
        onSuccess: () => setToastMessage('Playlist liked'),
      });
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/playlist/${playlist._id}${playlist.isPrivate && playlist.secretToken ? `?secretToken=${playlist.secretToken}` : ''}`
      : '';
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setToastMessage('Link copied');
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  return (
    <div className={[s.card, className].filter(Boolean).join(' ')} data-testid={"playlist-stream-" + playlist._id}>
      <div className={s.top}>
        <div className={s.artworkContainer}>
          <Link href={ROUTES.PLAYLIST(playlist._id)} className={s.artworkLink}>
            <div className={s.artwork}>
              {playlist.artworkUrl ? (
                <img src={playlist.artworkUrl} alt={playlist.title} className={s.artworkImg} />
              ) : (
                <div className={s.artworkPlaceholder}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                    <path d="M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
              )}

              {playlist.isPrivate && (
                <span className={s.privateBadge}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </span>
              )}
            </div>
          </Link>
          <button className={s.playBtn} onClick={handlePlay} data-testid="stream-play-btn" type="button">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </button>
        </div>

        <div className={s.headerContent}>
          <div className={s.headerMeta}>
            <Link href={`/profile/${creatorPermalink}`} className={s.creatorName}>
              {creatorName}
            </Link>
            <span className={s.timestamp}>{timeAgo(playlist.createdAt)}</span>
          </div>
          <Link href={ROUTES.PLAYLIST(playlist._id)} className={s.titleLink}>
            {playlist.title}
          </Link>

          <div className={s.waveform}>
            <div className={s.waveformBars}>
              {Array.from({ length: 60 }).map((_, i) => (
                <div
                  key={i}
                  className={s.waveformBar}
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {tracks.length > 0 && (
        <div className={s.trackList}>
          {visibleTracks.map((track, idx) => (
            <StreamTrackItem 
              key={getTrackId(track)} 
              track={track} 
              index={idx} 
            />
          ))}

          {hasMoreTracks && !showAllTracks && (
            <button
              className={s.viewMoreBtn}
              onClick={() => setShowAllTracks(true)}
              data-testid="playlist-stream-view-more"
            >
              View {tracks.length} tracks
            </button>
          )}
        </div>
      )}

      <div className={s.actions}>
        {onShare && (
          <button className={s.actionBtn} onClick={onShare} aria-label="Share">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        )}
        <button
          className={s.actionBtn}
          aria-label="Copy link"
          onClick={handleCopyLink}
          style={linkCopied ? { color: '#ff5500' } : {}}
        >
          {linkCopied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
        {isOwner && onEdit && (
          <button className={s.actionBtn} onClick={onEdit} aria-label="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        <button 
          className={`${s.actionBtn} ${playlist.isLiked ? s.actionBtnActive : ''}`} 
          onClick={handleLike} 
          aria-label={playlist.isLiked ? 'Unlike playlist' : 'Like playlist'}
          aria-pressed={Boolean(playlist.isLiked)}
          disabled={isLikePending}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={playlist.isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <button className={s.actionBtn} aria-label="More">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>
      <AppToast
        message={toastMessage}
        variant="success"
        open={Boolean(toastMessage)}
        duration={1800}
        onClose={() => setToastMessage('')}
      />
    </div>
  );
};
