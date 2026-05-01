'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NavBar } from '@/shared/ui/NavBar/NavBar';
import { AppToast } from '@/shared/ui/AppToast';
import { ROUTES } from '@/shared/constants/routes';
import apiClient from '@/shared/api/client';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { usePlayerStore, type Track } from '@/features/player/model/playerStore';
import { useEditorial, useGenreStation, useMixedForYou, useMoreOfWhatYouLike, useSuggestedArtists } from '@/features/trending/model/trendingQueries';
import { matchesStationId } from '@/features/trending/lib/stationLinks';
import { useLikeStation, useUnlikeStation, useCheckStationLiked } from '@/features/trending/model/stationQueries';
import { PlaylistShareModal } from '@/features/playlists/ui/PlaylistShareModal';
import type { Playlist } from '@/features/playlists/model/playlist';
import type { StationType } from '@/features/trending/api/stationsRepository';

function fmt(n?: number): string {
  const value = Number(n || 0);
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatDuration(seconds?: number): string {
  const total = Math.max(0, Math.floor(Number(seconds || 0)));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
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
    value.url ||
    ''
  );
}

function getTrackId(track: any): string {
  return String(track?._id || track?.id || '');
}

function getArtistName(track: any): string {
  const artist = track?.artist;
  if (typeof artist === 'string') return artist;
  return artist?.displayName || artist?.username || artist?.permalink || 'Unknown Artist';
}

function getArtistHref(track: any): string {
  const artist = track?.artist;
  const lookup = typeof artist === 'string'
    ? artist
    : artist?.permalink || artist?._id || artist?.id || getArtistName(track);
  return ROUTES.PROFILE(lookup);
}

function toPlayerTrack(track: any, streamUrl = ''): Track {
  const fallbackStream = track?.hlsUrl || track?.streamUrl || track?.audioUrl || streamUrl || '';
  return {
    id: getTrackId(track),
    title: track?.title || 'Untitled',
    artist: getArtistName(track),
    artworkUrl: getImageUrl(track?.artworkUrl || track?.artwork || track?.coverUrl || track?.imageUrl),
    duration: Number(track?.duration || 0),
    hlsUrl: fallbackStream,
    streamUrl: fallbackStream,
    permalink: track?.permalink,
    waveform: track?.waveform || [],
    genre: track?.genre,
  };
}

async function getStreamUrl(track: any): Promise<string> {
  const existing = track?.hlsUrl || track?.streamUrl || track?.audioUrl || '';
  if (existing) return existing;

  const trackId = getTrackId(track);
  if (!trackId) return '';

  try {
    const { data } = await apiClient.get(`/player/${trackId}/stream`);
    return data?.data?.streamUrl || data?.data?.hlsUrl || '';
  } catch (error) {
    console.warn('Could not fetch stream URL for station playback:', error);
    return '';
  }
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.parentNode?.removeChild(textarea);
}

function buildHeroGradient(seed: string): string {
  const palettes = [
    'linear-gradient(135deg, #8b7d8f 0%, #7e8e98 55%, #4f6570 100%)',
    'linear-gradient(135deg, #7e5871 0%, #727d90 55%, #314556 100%)',
    'linear-gradient(135deg, #6f6a85 0%, #748f88 55%, #3f625b 100%)',
    'linear-gradient(135deg, #8a6a52 0%, #7d7f87 55%, #4a5666 100%)',
  ];
  const index = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length;
  return palettes[index];
}

export default function DiscoverSetPage() {
  const router = useRouter();
  const params = useParams<{ setId: string }>();
  const setId = params?.setId || '';
  const user = useAuthStore((state) => state.user);
  const playContext = usePlayerStore((state) => state.playContext);
  const addToQueue = usePlayerStore((state) => state.addToQueue);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'info' | 'error' } | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const likeMutation = useLikeStation();
  const unlikeMutation = useUnlikeStation();
  const { data: likedCheck } = useCheckStationLiked(setId);
  const isLiked = likedCheck?.liked ?? false;

  const { data: mixedData, isLoading: isMixedLoading } = useMixedForYou();
  const { data: curatedBuckets, isLoading: isCuratedLoading } = useEditorial();
  const { data: moreOfWhatYouLike, isLoading: isMoreLoading } = useMoreOfWhatYouLike();
  const { data: trendingElectronic, isLoading: isElectronicLoading } = useGenreStation('Electronic');
  const { data: trendingHiphop, isLoading: isHiphopLoading } = useGenreStation('Hiphop & rap');
  const { data: trendingPop, isLoading: isPopLoading } = useGenreStation('Pop');
  const { data: suggestedArtists } = useSuggestedArtists();

  const stationEntry = useMemo(() => {
    const moreLike = moreOfWhatYouLike?.length ? [{
      station: {
        id: 'more-of-what-you-like',
        title: 'More of what you like',
        description: 'A station based on tracks you already like',
        artworkUrl: moreOfWhatYouLike[0]?.artworkUrl,
        tracks: moreOfWhatYouLike,
      },
      index: 0,
      prefix: 'station',
      source: 'station',
    }] : [];
    const genres = [
      {
        station: {
          id: 'genre-electronic',
          title: 'Electronic',
          description: 'Trending Music',
          artworkUrl: trendingElectronic?.[0]?.artworkUrl,
          tracks: trendingElectronic || [],
          genre: 'Electronic',
        },
        index: 0,
        prefix: 'station',
        source: 'station',
      },
      {
        station: {
          id: 'genre-hiphop-rap',
          title: 'Hip-hop & Rap',
          description: 'Trending Music',
          artworkUrl: trendingHiphop?.[0]?.artworkUrl,
          tracks: trendingHiphop || [],
          genre: 'Hip-hop & Rap',
        },
        index: 1,
        prefix: 'station',
        source: 'station',
      },
      {
        station: {
          id: 'genre-pop',
          title: 'Pop',
          description: 'Trending Music',
          artworkUrl: trendingPop?.[0]?.artworkUrl,
          tracks: trendingPop || [],
          genre: 'Pop',
        },
        index: 2,
        prefix: 'station',
        source: 'station',
      },
    ].filter((entry) => entry.station.tracks.length > 0);
    const mixed = (mixedData || []).map((station: any, index: number) => ({
      station,
      index,
      prefix: 'mix',
      source: 'mix',
    }));
    const curated = (curatedBuckets || []).map((station: any, index: number) => ({
      station,
      index,
      prefix: 'set',
      source: 'set',
    }));
    return [...moreLike, ...genres, ...mixed, ...curated].find((entry) =>
      matchesStationId(entry.station, entry.index, setId, entry.prefix),
    );
  }, [curatedBuckets, mixedData, moreOfWhatYouLike, setId, trendingElectronic, trendingHiphop, trendingPop]);

  const isLoading = isMixedLoading || isCuratedLoading || isMoreLoading || isElectronicLoading || isHiphopLoading || isPopLoading;
  const station = stationEntry?.station;
  const tracks = Array.isArray(station?.tracks) ? station.tracks : [];
  const title = station?.title || 'Your Mix';
  const coverArt = getImageUrl(station?.artworkUrl || station?.artwork || station?.coverUrl) || getImageUrl(tracks[0]?.artworkUrl);
  const totalDuration = tracks.reduce((sum: number, track: any) => sum + Number(track?.duration || 0), 0);
  const stationShareItem = useMemo<Playlist>(() => ({
    _id: setId,
    title,
    permalink: setId,
    creator: {
      _id: 'biobeats',
      displayName: 'BioBeats',
      permalink: 'biobeats',
      avatarUrl: null,
    },
    description: station?.description || '',
    releaseType: 'playlist',
    tags: [],
    genre: station?.genre || '',
    releaseDate: '',
    labelName: '',
    buyLink: '',
    buyTitle: '',
    upc: '',
    tracks: [],
    artworkUrl: coverArt,
    isPrivate: false,
    secretToken: '',
    trackCount: tracks.length,
    totalDuration,
    playCount: 0,
    likeCount: 0,
    repostCount: 0,
    createdAt: '',
    updatedAt: '',
  }), [coverArt, setId, station?.description, station?.genre, title, totalDuration, tracks.length]);

  const featuredArtists = useMemo(() => {
    const seen = new Set<string>();
    const fromTracks = tracks
      .map((track: any) => track?.artist)
      .filter(Boolean)
      .map((artist: any) => ({
        id: typeof artist === 'string' ? artist : artist?._id || artist?.id || artist?.permalink,
        displayName: typeof artist === 'string' ? artist : artist?.displayName || artist?.username || artist?.permalink,
        avatarUrl: typeof artist === 'string' ? '' : artist?.avatarUrl || artist?.avatar,
        permalink: typeof artist === 'string' ? artist : artist?.permalink || artist?._id || artist?.id,
      }))
      .filter((artist: any) => {
        if (!artist.displayName || seen.has(artist.displayName)) return false;
        seen.add(artist.displayName);
        return true;
      });

    return fromTracks.length ? fromTracks.slice(0, 3) : (suggestedArtists || []).slice(0, 3);
  }, [suggestedArtists, tracks]);

  const handlePlayTrack = async (track: any, index: number) => {
    if (!tracks.length) return;
    const streamUrl = await getStreamUrl(track);
    const queue = tracks.map((item: any, itemIndex: number) =>
      toPlayerTrack(item, itemIndex === index ? streamUrl : ''),
    );
    playContext(queue, index, {
      type: 'playlist',
      id: setId,
      title,
    });
  };

  const showToast = (message: string, variant: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, variant });
  };

  const getStationUrl = () => {
    if (typeof window === 'undefined') return `/discover/sets/${encodeURIComponent(setId)}`;
    return `${window.location.origin}/discover/sets/${encodeURIComponent(setId)}`;
  };

  const handleStationLike = () => {
    if (likeMutation.isPending || unlikeMutation.isPending) return;

    if (isLiked) {
      unlikeMutation.mutate(setId, {
        onSuccess: () => showToast('Removed from your Likes', 'info'),
        onError: () => showToast('Could not unlike station', 'error')
      });
    } else {
      // Determine stationType from the station entry context
      const source = stationEntry?.source;
      let stationType: StationType = 'curated';
      if (source === 'station' && station?.genre) stationType = 'genre';
      else if (source === 'mix') stationType = 'recommended';
      else if (source === 'set') stationType = 'curated';

      likeMutation.mutate({
        stationId: setId,
        payload: {
          stationType,
          stationTitle: title,
          stationDescription: station?.description || '',
          genre: station?.genre || undefined,
        },
      }, {
        onSuccess: () => showToast('Added to your Likes', 'success'),
        onError: () => showToast('Could not like station', 'error')
      });
    }
  };

  const handleShareStation = () => {
    setShareOpen(true);
  };

  const handleCopyStationLink = async () => {
    try {
      await copyTextToClipboard(getStationUrl());
      showToast('Link copied');
    } catch {
      showToast('Could not copy link', 'error');
    }
    setMoreOpen(false);
  };

  const handleAddStationToNextUp = async () => {
    if (!tracks.length) {
      showToast('This station has no tracks to add', 'info');
      return;
    }

    const playerTracks = await Promise.all(
      tracks.map(async (track: any) => toPlayerTrack(track, await getStreamUrl(track))),
    );
    playerTracks.forEach(addToQueue);
    showToast(`Added ${playerTracks.length} track${playerTracks.length > 1 ? 's' : ''} to Next up`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />
        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6 sm:py-8">
          <div className="h-[300px] bg-[#191919] animate-pulse mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-10 bg-[#181818] animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />
        <main className="mx-auto w-full max-w-[900px] px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="text-2xl font-bold mb-3">This mix could not be found</h1>
          <p className="text-[#aaa] mb-6">The station is no longer available or the link is invalid.</p>
          <Link href={ROUTES.DASHBOARD} className="inline-flex h-9 items-center rounded-sm bg-[#ff5500] px-4 text-sm font-bold text-white">
            Back to Home
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-[var(--sc-font-family)]">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-28 sm:px-6 lg:pb-16">
        <section
          className="flex min-h-[520px] flex-col justify-between gap-6 overflow-hidden p-5 sm:min-h-[420px] sm:p-6 lg:h-[340px] lg:min-h-0 lg:flex-row lg:items-start lg:p-8"
          style={{ background: buildHeroGradient(title) }}
        >
          <div className="flex min-w-0 w-full lg:w-auto lg:flex-1 flex-col justify-between gap-6 lg:h-full">
            <div className="flex items-start gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => handlePlayTrack(tracks[0], 0)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff5500] hover:bg-[#ff6a1a] sm:h-[58px] sm:w-[58px]"
                aria-label={`Play ${title}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" className="ml-1"><polygon points="6,4 20,12 6,20" /></svg>
              </button>

              <div className="min-w-0">
                <div className="inline-flex max-w-full items-center gap-2 bg-black px-2 py-1 text-[20px] font-bold leading-tight sm:text-[26px]">
                  <span className="truncate">{title}</span>
                  {stationEntry?.source === 'mix' && (
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#bbb]">
                      Private
                    </span>
                  )}
                </div>
                <div className="mt-2 inline-block bg-black px-2 py-1 text-[13px] font-bold text-[#d6d6d6]">
                  Made for {user?.displayName || 'you'}
                </div>
              </div>
            </div>

            <div className="flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full bg-black/90 sm:h-[112px] sm:w-[112px]">
              <span className="text-[24px] font-bold leading-none">{tracks.length}</span>
              <span className="text-[10px] font-black tracking-widest text-[#ccc] mt-1">TRACKS</span>
              <span className="text-[10px] text-[#888] mt-1">{formatDuration(totalDuration)}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:gap-6 lg:flex-row">
            <div className="pt-0 text-left sm:pt-2 sm:text-right">
              <p className="text-[13px] text-white/80 mb-3">Updated today</p>
              <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[12px]">
                #{station?.genre || 'Mix'}
              </span>
            </div>
            <div className="aspect-square w-full max-w-[284px] overflow-hidden bg-[#222] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              {coverArt ? (
                <img src={coverArt} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#666] text-sm">No artwork</div>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2 border-b border-[#242424] py-4">
          <button
            type="button"
            onClick={handleStationLike}
            className={`h-8 w-8 rounded-sm border flex items-center justify-center transition-colors ${
              isLiked 
                ? 'border-[#ff5500] text-[#ff5500] hover:border-[#ff5500]' 
                : 'border-white/15 text-[#d7d7d7] hover:border-white/35'
            }`}
            aria-label={isLiked ? "Unlike station" : "Like station"}
            title={isLiked ? "Unlike" : "Like"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </button>
          <button
            type="button"
            onClick={handleShareStation}
            className="h-8 w-8 rounded-sm border border-white/15 text-[#d7d7d7] hover:border-white/35 flex items-center justify-center"
            aria-label="Share station"
            title="Share"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>
          </button>
          <button
            type="button"
            onClick={handleAddStationToNextUp}
            className="h-8 w-8 rounded-sm border border-white/15 text-[#d7d7d7] hover:border-white/35 flex items-center justify-center"
            aria-label="Add station to Next up"
            title="Add to Next up"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M3 12h12" /><path d="M3 18h18" /></svg>
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className="h-8 w-8 rounded-sm border border-white/15 text-[#d7d7d7] hover:border-white/35 flex items-center justify-center"
              aria-label="More station actions"
              aria-expanded={moreOpen}
              title="More"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
            </button>
            {moreOpen && (
              <div className="absolute left-0 top-10 z-20 min-w-[150px] rounded-sm border border-white/10 bg-[#191919] py-1 shadow-xl">
                <button
                  type="button"
                  onClick={handleCopyStationLink}
                  className="block w-full px-3 py-2 text-left text-[12px] font-semibold text-[#d7d7d7] hover:bg-white/10"
                >
                  Copy link
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-8 pt-6 lg:flex-row lg:gap-10">
          <section className="min-w-0 w-full lg:w-auto lg:flex-1">
            {tracks.length ? (
              <div className="flex flex-col">
                {tracks.map((track: any, index: number) => (
                  <TrackRow
                    key={getTrackId(track) || index}
                    track={track}
                    index={index}
                    onPlay={() => handlePlayTrack(track, index)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-[#777]">No tracks are available for this mix yet.</div>
            )}
          </section>

          <aside className="w-full shrink-0 lg:w-[300px]">
            <div className="mb-7">
              {coverArt && <img src={coverArt} alt={title} className="mb-4 aspect-square w-full max-w-[220px] object-cover" />}
              <h2 className="text-[15px] font-bold text-white leading-snug mb-2">{title}</h2>
              <p className="text-[12px] text-[#aaa] leading-relaxed">
                {station?.description || `A personalized set of ${tracks.length} tracks selected from your listening activity.`}
              </p>
            </div>

            <div>
              <h3 className="text-[12px] font-black uppercase tracking-wider text-[#aaa] border-b border-[#2a2a2a] pb-2 mb-4">
                Artists featured
              </h3>
              <div className="flex flex-col gap-4">
                {featuredArtists.map((artist: any) => (
                  <Link
                    key={artist.id || artist.displayName}
                    href={ROUTES.PROFILE(artist.permalink || artist.id || artist.displayName)}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-[46px] h-[46px] rounded-full bg-[#333] overflow-hidden">
                      {artist.avatarUrl ? (
                        <img src={artist.avatarUrl} alt={artist.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[18px] text-[#aaa]">
                          {String(artist.displayName || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-white truncate group-hover:underline">{artist.displayName}</p>
                      <p className="text-[11px] text-[#888]">Artist</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      {toast && (
        <AppToast
          message={toast.message}
          variant={toast.variant}
          open={true}
          duration={2400}
          onClose={() => setToast(null)}
        />
      )}
      <PlaylistShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        playlist={stationShareItem}
        shareUrl={getStationUrl()}
        entityLabel="Station"
        embedEnabled={false}
      />
    </div>
  );
}

function TrackRow({ track, index, onPlay }: { track: any, index: number, onPlay: () => void }) {
  const artwork = getImageUrl(track?.artworkUrl || track?.artwork || track?.coverUrl || track?.imageUrl);
  const trackId = getTrackId(track);

  return (
    <div className="group flex min-h-[50px] items-center gap-3 px-1 py-2 hover:bg-white/[0.04] sm:min-h-[42px] sm:py-1">
      <button
        type="button"
        onClick={onPlay}
        className="w-7 text-right text-[13px] text-[#777] group-hover:text-[#ff5500]"
        aria-label={`Play ${track?.title || `track ${index + 1}`}`}
      >
        <span className="group-hover:hidden">{index + 1}</span>
        <span className="hidden group-hover:inline-flex justify-end">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>
        </span>
      </button>
      <div className="w-[34px] h-[34px] bg-[#2a2a2a] overflow-hidden shrink-0">
        {artwork && <img src={artwork} alt={track?.title || 'Track artwork'} className="w-full h-full object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <Link href={getArtistHref(track)} className="max-w-full truncate text-[12px] text-[#999] hover:underline sm:max-w-[220px] sm:text-[13px]">
          {getArtistName(track)}
        </Link>
        <span className="hidden text-[#555] sm:inline">-</span>
        <Link href={ROUTES.TRACK(track?.permalink || trackId)} className="truncate text-[13px] font-bold text-white hover:text-[#ff5500]">
          {track?.title || 'Untitled'}
        </Link>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#777] shrink-0">
        <span className="inline-flex items-center gap-1">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20" /></svg>
          {fmt(track?.playCount)}
        </span>
        <span className="inline-flex items-center gap-1">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          {fmt(track?.likeCount)}
        </span>
        <span>{formatDuration(track?.duration)}</span>
      </div>
    </div>
  );
}
