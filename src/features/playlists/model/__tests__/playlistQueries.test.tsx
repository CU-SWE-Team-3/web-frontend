import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserPlaylists } from '../playlistQueries';
import { playlistsRepository } from '../../api/playlistsRepository';
import { tracksRepository } from '@/features/tracks/api/tracksRepository';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import type { Playlist } from '../playlist';

vi.mock('../../api/playlistsRepository', () => ({
  playlistsRepository: {
    getPlaylists: vi.fn(),
    getPlaylistById: vi.fn(),
  },
}));

vi.mock('@/features/tracks/api/tracksRepository', () => ({
  tracksRepository: {
    getTrackById: vi.fn(),
  },
}));

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

const basePlaylist: Playlist = {
  _id: 'playlist-1',
  title: 'Deleted Track Playlist',
  permalink: 'deleted-track-playlist',
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
  artworkUrl: '',
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('playlist queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'user-1', _id: 'user-1', displayName: 'Mona Beats', permalink: 'mona-beats', avatarUrl: 'https://example.com/avatar.jpg' } as any,
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('drops deleted track references when calculating user playlist card counts', async () => {
    vi.mocked(playlistsRepository.getPlaylists).mockResolvedValueOnce([basePlaylist]);
    vi.mocked(playlistsRepository.getPlaylistById).mockResolvedValueOnce({
      ...basePlaylist,
      tracks: [{ _id: 'track-1', permalink: 'deleted-track', title: 'Deleted Track' } as any],
    });
    vi.mocked(tracksRepository.getTrackById).mockRejectedValueOnce(new Error('Track not found'));

    const { result } = renderHook(() => useUserPlaylists('user-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(tracksRepository.getTrackById).toHaveBeenCalledWith('deleted-track');
    expect(result.current.data?.[0].tracks).toHaveLength(0);
    expect(result.current.data?.[0].trackCount).toBe(0);
    expect(result.current.data?.[0].creator).toEqual(
      expect.objectContaining({
        displayName: 'Mona Beats',
        permalink: 'mona-beats',
        avatarUrl: 'https://example.com/avatar.jpg',
      }),
    );
  });
});
