import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stationsRepository } from '../stationsRepository';
import apiClient from '@/shared/api/client';

vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('stationsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('likeStation', () => {
    it('sends POST request with payload and returns result', async () => {
      const mockResult = { liked: true, stationId: 'genre_electronic' };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: mockResult } });

      const payload = { stationType: 'genre' as const, stationTitle: 'Electronic' };
      const result = await stationsRepository.likeStation('genre_electronic', payload);

      expect(apiClient.post).toHaveBeenCalledWith('/stations/genre_electronic/like', payload);
      expect(result).toEqual(mockResult);
    });

    it('handles "already liked" 400 error gracefully', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'You have already liked this station.' },
        },
      };
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      const payload = { stationType: 'genre' as const };
      const result = await stationsRepository.likeStation('genre_electronic', payload);

      expect(result).toEqual({ liked: true, stationId: 'genre_electronic' });
    });
  });

  describe('unlikeStation', () => {
    it('sends DELETE request and returns result', async () => {
      const mockResult = { liked: false, stationId: 'genre_electronic' };
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { data: mockResult } });

      const result = await stationsRepository.unlikeStation('genre_electronic');

      expect(apiClient.delete).toHaveBeenCalledWith('/stations/genre_electronic/like');
      expect(result).toEqual(mockResult);
    });

    it('handles "not liked" 400 error gracefully', async () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'You have not liked this station.' },
        },
      };
      vi.mocked(apiClient.delete).mockRejectedValueOnce(error);

      const result = await stationsRepository.unlikeStation('genre_electronic');

      expect(result).toEqual({ liked: false, stationId: 'genre_electronic' });
    });
  });

  describe('getLikedStations', () => {
    it('sends GET request and returns stations array', async () => {
      const mockStations = [{ stationId: 'station1' }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: { stations: mockStations } } });

      const result = await stationsRepository.getLikedStations(true);

      expect(apiClient.get).toHaveBeenCalledWith('/stations/liked', { params: { hydrate: 'true' } });
      expect(result).toEqual(mockStations);
    });
  });
});
