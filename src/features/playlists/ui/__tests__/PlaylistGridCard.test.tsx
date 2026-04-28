import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaylistGridCard } from '../PlaylistGridCard';
import { playlistsRepository } from '../../api/playlistsRepository';
import { tracksRepository } from '@/features/tracks/api/tracksRepository';
import type { Playlist } from '../../model/playlist';

const playContext = vi.fn();

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={typeof href === 'string' ? href : href?.pathname || '#'} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/features/player/model/playerStore', () => ({
  usePlayerStore: (selector: any) => selector({ playContext }),
}));

vi.mock('../../api/playlistsRepository', () => ({
  playlistsRepository: {
    getPlaylistById: vi.fn(),
  },
}));

vi.mock('@/features/tracks/api/tracksRepository', () => ({
  tracksRepository: {
    getTrackById: vi.fn(),
  },
}));

const playlist: Playlist = {
  _id: 'playlist-1',
  title: 'Test Playlist',
  permalink: 'test-playlist',
  creator: {
    _id: 'user-1',
    displayName: 'Mona Beats',
    permalink: 'mona-beats',
    avatarUrl: 'https://example.com/avatar.jpg',
  },
  description: '',
  releaseType: 'playlist',
  tags: [],
  genre: '',
  releaseDate: '',
  labelName: '',
  buyLink: '',
  buyTitle: '',
  upc: '',
  tracks: [],
  artworkUrl: 'https://example.com/playlist.jpg',
  isPrivate: false,
  secretToken: '',
  trackCount: 1,
  totalDuration: 0,
  playCount: 0,
  likeCount: 0,
  repostCount: 0,
  createdAt: '',
  updatedAt: '',
};

describe('PlaylistGridCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders stable test ids for playlist metadata', () => {
    render(<PlaylistGridCard playlist={playlist} />);

    expect(screen.getByTestId('playlist-grid-card')).toBeInTheDocument();
    expect(screen.getByTestId('playlist-grid-card-artwork')).toHaveAttribute('src', playlist.artworkUrl);
    expect(screen.getByTestId('playlist-grid-card-title')).toHaveTextContent('Test Playlist');
    expect(screen.getByTestId('playlist-grid-card-creator')).toHaveTextContent('Mona Beats');
    expect(screen.getByTestId('playlist-grid-card-track-count')).toHaveTextContent('1 track');
  });

  it('fetches full playlist tracks and plays the first hydrated playable track', async () => {
    const user = userEvent.setup();
    vi.mocked(playlistsRepository.getPlaylistById).mockResolvedValueOnce({
      ...playlist,
      tracks: [{ _id: 'track-1', permalink: 'night-drive', title: 'Night Drive' } as any],
    });
    vi.mocked(tracksRepository.getTrackById).mockResolvedValueOnce({
      id: 'track-1',
      permalink: 'night-drive',
      title: 'Night Drive',
      artist: 'Mona Beats',
      genre: '',
      tags: [],
      releaseDate: '',
      visibility: 'Public',
      status: 'Finished',
      audioFileName: '',
      artworkUrl: 'https://example.com/night.jpg',
      waveform: [],
      duration: '3:15',
      createdAt: '',
      hlsUrl: 'https://example.com/night.m3u8',
      streamUrl: 'https://example.com/night.m3u8',
    });

    render(<PlaylistGridCard playlist={playlist} />);
    await user.click(screen.getByTestId('playlist-grid-card-play-button'));

    expect(playlistsRepository.getPlaylistById).toHaveBeenCalledWith('playlist-1');
    expect(tracksRepository.getTrackById).toHaveBeenCalledWith('night-drive');
    expect(playContext).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          id: 'track-1',
          title: 'Night Drive',
          artworkUrl: 'https://example.com/night.jpg',
          hlsUrl: 'https://example.com/night.m3u8',
        }),
      ],
      0,
      { type: 'playlist', id: 'playlist-1', title: 'Test Playlist' },
    );
  });
});
