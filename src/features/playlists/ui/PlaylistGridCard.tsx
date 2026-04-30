'use client';

import { type FC } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { usePlayerStore } from '@/features/player/model/playerStore';
import { playlistsRepository } from '../api/playlistsRepository';
import { tracksRepository } from '@/features/tracks/api/tracksRepository';
import type { Playlist, ReleaseType, TrackSummary } from '../model/playlist';
import s from './PlaylistGridCard.module.scss';

const RELEASE_TYPE_LABELS: Record<ReleaseType, string> = {
  playlist: 'Playlist',
  album: 'Album',
  ep: 'EP',
  single: 'Single',
};

interface PlaylistGridCardProps {
  playlist: Playlist;
  className?: string;
}

function getCreatorName(creator: Playlist['creator']): string {
  if (typeof creator === 'string') return '';
  return creator.displayName || creator.permalink || '';
}

function getImageUrl(value: any): string {
  if (!value || value === 'undefined' || value === 'null') return '';
  if (typeof value === 'string') return value;
  return (
    value.artworkUrl ||
    value.artwork_url ||
    value.coverUrl ||
    value.cover_url ||
    value.imageUrl ||
    value.image_url ||
    value.thumbnailUrl ||
    value.thumbnail_url ||
    value.secureUrl ||
    value.secure_url ||
    value.publicUrl ||
    value.public_url ||
    value.fileUrl ||
    value.file_url ||
    value.downloadUrl ||
    value.download_url ||
    value.url ||
    value.src ||
    ''
  );
}

function mapTrackForPlayer(track: any) {
  const hls = track.hlsUrl || track.hls_url || track.audioUrl || track.audio_url || '';
  const stream = track.streamUrl || track.stream_url || hls || '';
  const artwork = getImageUrl(
    track.artworkUrl ||
      track.artwork_url ||
      track.artwork ||
      track.coverUrl ||
      track.cover_url ||
      track.imageUrl ||
      track.image_url ||
      track.thumbnailUrl ||
      track.thumbnail_url,
  );
  const artist = track.artist;
  const artistName =
    typeof artist === 'string'
      ? artist
      : artist?.displayName || artist?.permalink || artist?.username || 'Unknown Artist';
  const duration =
    typeof track.duration === 'number'
      ? track.duration
      : typeof track.duration === 'string' && track.duration.includes(':')
        ? track.duration.split(':').reduce((total: number, part: string) => (total * 60) + Number(part || 0), 0)
        : 0;

  return {
    id: track._id || track.id,
    title: track.title || 'Untitled',
    artist: artistName,
    artworkUrl: artwork,
    duration,
    streamUrl: stream,
    hlsUrl: hls,
  };
}

async function resolveTrackForPlayer(track: any) {
  if (typeof track === 'string') {
    const hydratedTrack = await tracksRepository.getTrackById(track);
    return mapTrackForPlayer(hydratedTrack);
  }

  const hasAudioUrl =
    track.hlsUrl ||
    track.hls_url ||
    track.streamUrl ||
    track.stream_url ||
    track.audioUrl ||
    track.audio_url;

  if (!hasAudioUrl) {
    const trackId = track.permalink || track._id || track.id;
    if (trackId) {
      const hydratedTrack = await tracksRepository.getTrackById(trackId);
      return mapTrackForPlayer(hydratedTrack);
    }
  }

  return mapTrackForPlayer(track);
}

export const PlaylistGridCard: FC<PlaylistGridCardProps> = ({
  playlist,
  className,
}) => {
  const playContext = usePlayerStore((s) => s.playContext);
  const tracks = (playlist.tracks || []) as (TrackSummary | string)[];
  const trackCount = tracks.length || playlist.trackCount || 0;

  // Detect if this is a liked station (mapped from HydratedStation)
  const isStation = !!(playlist as any)._isStation;
  const stationId = (playlist as any)._stationId || playlist._id;
  const detailHref = isStation
    ? `/discover/sets/${encodeURIComponent(stationId)}`
    : ROUTES.PLAYLIST(playlist._id);

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (trackCount === 0) return;

    try {
      // Fetch the full playlist so tracks have populated stream URLs
      const fullPlaylist = await playlistsRepository.getPlaylistById(playlist._id);
      const fullTracks = (fullPlaylist.tracks || []) as any[];

      if (fullTracks.length === 0) return;

      const resolvedTracks = (await Promise.all(
        fullTracks.map((t: any) => resolveTrackForPlayer(t).catch(() => null)),
      )).filter((track): track is ReturnType<typeof mapTrackForPlayer> => Boolean(track));

      const firstPlayableIndex = resolvedTracks.findIndex(t => t.streamUrl || t.hlsUrl);
      if (firstPlayableIndex === -1) return;

      playContext(resolvedTracks, firstPlayableIndex, {
        type: fullPlaylist.releaseType === 'album' ? 'album' : 'playlist',
        id: fullPlaylist._id,
        title: fullPlaylist.title,
      });
    } catch (err) {
      console.error('[PlaylistGridCard] Failed to fetch playlist for playback:', err);
    }
  };

  return (
    <div
      className={[s.card, className].filter(Boolean).join(' ')}
      data-testid="playlist-grid-card"
    >
      <div className={s.cover}>
        <Link
          href={detailHref}
          className={s.artworkLink}
          data-testid={`playlist-grid-card-${playlist._id}`}
        >
          {playlist.artworkUrl ? (
            <img
              src={playlist.artworkUrl}
              alt={playlist.title}
              className={s.coverImg}
              data-testid="playlist-grid-card-artwork"
            />
          ) : (
            <div className={s.coverPlaceholder} data-testid="playlist-grid-card-artwork-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" opacity="0.2">
                <path d="M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Hover play overlay */}
        <div className={s.overlay}>
          <button
            className={s.playBtn}
            onClick={handlePlay}
            type="button"
            aria-label={`Play ${playlist.title}`}
            disabled={trackCount === 0}
            data-testid="playlist-grid-card-play-button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>

        {/* Release type badge */}
        <span className={s.typeBadge}>
          {isStation ? 'Station' : (RELEASE_TYPE_LABELS[playlist.releaseType] || 'Playlist')}
        </span>

        {/* Track count */}
        <span className={s.trackCount} data-testid="playlist-grid-card-track-count">
          {trackCount} track{trackCount !== 1 ? 's' : ''}
        </span>

        {/* Private indicator */}
        {playlist.isPrivate && (
          <span className={s.privateBadge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
            </svg>
          </span>
        )}
      </div>

      <Link href={detailHref} className={s.info}>
        <span className={s.title} data-testid="playlist-grid-card-title">{playlist.title}</span>
        <span className={s.creator} data-testid="playlist-grid-card-creator">{getCreatorName(playlist.creator)}</span>
      </Link>
    </div>
  );
};
