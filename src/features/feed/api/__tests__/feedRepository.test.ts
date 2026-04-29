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

  it('returns empty array if feed is missing in response', async () => {
    (apiClient.get as any).mockResolvedValueOnce({ data: { data: {} } });
    const result = await feedRepository.getFeed();
    expect(result).toEqual([]);
  });
});
