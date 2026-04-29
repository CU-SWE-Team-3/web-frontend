import { describe, it, expect, vi, beforeEach } from 'vitest';
import { feedRepository } from '../feedRepository';
import apiClient from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('feedRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches feed tracks successfully', async () => {
    const mockFeed = [
      {
        _id: 'act1',
        targetModel: 'Track',
        target: {
          _id: 'f1',
          title: 'Feed Track',
          artist: { displayName: 'Feed Artist' },
        },
      },
    ];

    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        data: {
          feed: mockFeed,
        },
      },
    });

    const result = await feedRepository.getFeed();

    expect(apiClient.get).toHaveBeenCalledWith('/feed');
    expect(result).toHaveLength(1);
    expect(result[0].target.title).toBe('Feed Track');
  });

  it('normalizes target-shaped repost activity variants', async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        activities: [
          {
            type: 'REPOST',
            target_model: 'Track',
            repostDate: '2026-01-01T00:00:00.000Z',
            user: { _id: 'user-1', displayName: 'Reposter' },
            target: {
              id: 'track-1',
              title: 'Reposted Track',
              artist: 'Track Artist',
              artwork_url: 'https://example.com/art.jpg',
              stream_url: 'https://example.com/audio.mp3',
            },
          },
        ],
      },
    });

    const result = await feedRepository.getFeed();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      activityType: 'REPOST',
      activityDate: '2026-01-01T00:00:00.000Z',
      targetModel: 'Track',
      actors: [{ _id: 'user-1', displayName: 'Reposter' }],
      target: {
        _id: 'track-1',
        title: 'Reposted Track',
        artworkUrl: 'https://example.com/art.jpg',
        hlsUrl: 'https://example.com/audio.mp3',
      },
    });
  });

  it('returns empty array if feed is missing in response', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: { data: {} } });
    const result = await feedRepository.getFeed();
    expect(result).toEqual([]);
  });
});
