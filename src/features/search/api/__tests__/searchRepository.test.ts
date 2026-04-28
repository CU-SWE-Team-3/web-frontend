import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchRepository } from '../searchRepository';
import apiClient from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('searchRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches tracks and maps results correctly', async () => {
    const mockResults = [
      {
        _id: 's1',
        title: 'Search Result',
        artist: { username: 'search_artist' },
      },
    ];

    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        data: {
          tracks: mockResults,
          users: [],
          playlists: [],
        },
      },
    });

    // Correct method name is search, not searchTracks
    const result = await searchRepository.search('query');

    expect(apiClient.get).toHaveBeenCalledWith('/tracks/search', expect.objectContaining({
      params: expect.objectContaining({ q: 'query' }),
    }));
    expect(result.tracks).toHaveLength(1);
    expect(result.tracks[0].title).toBe('Search Result');
  });

  it('handles empty response gracefully', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: { data: {} } });
    const result = await searchRepository.search('nothing');
    expect(result.tracks).toEqual([]);
    expect(result.users).toEqual([]);
  });
});
