import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trendingRepository } from '../trendingRepository';
import apiClient from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('trendingRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTrending', () => {
    it('fetches and maps trending tracks correctly', async () => {
      const mockTracks = [
        {
          _id: '1',
          title: 'Test Track',
          artist: { displayName: 'Test Artist' },
          playCount: 100,
        },
      ];

      (apiClient.get as any).mockResolvedValueOnce({
        data: {
          data: {
            trending: mockTracks,
          },
        },
      });

      const result = await trendingRepository.getTrending('all');

      expect(apiClient.get).toHaveBeenCalledWith('/discovery/trending', expect.objectContaining({
        params: expect.objectContaining({ limit: 50 }),
      }));
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Track');
      expect(result[0].artist.displayName).toBe('Test Artist');
    });

    it('returns empty array on API error', async () => {
      (apiClient.get as any).mockRejectedValueOnce(new Error('API Error'));
      const result = await trendingRepository.getTrending();
      expect(result).toEqual([]);
    });
  });

  describe('getEditorialBuckets', () => {
    it('fetches editorial buckets successfully', async () => {
      const mockBuckets = [{ id: 'b1', title: 'Fresh Finds', tracks: [] }];
      
      (apiClient.get as any).mockResolvedValueOnce({
        data: {
          data: {
            curated: mockBuckets,
          },
        },
      });

      const result = await trendingRepository.getEditorialBuckets();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Fresh Finds');
    });
  });
});
