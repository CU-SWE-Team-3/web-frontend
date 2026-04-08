import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  likeTrack,
  unlikeTrack,
  getTrackLikers,
  repostTrack,
  unrepostTrack,
  getTrackReposters,
  getUserReposts,
} from './engagementApi';
import apiClient from '@/shared/api/client';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('engagementApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Likes', () => {
    it('likeTrack should call the correct endpoint via POST', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true } });
      await likeTrack('track-123');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/tracks/track-123/like',
        {},
        { withCredentials: true }
      );
    });

    it('unlikeTrack should call the correct endpoint via DELETE', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });
      await unlikeTrack('track-123');
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/tracks/track-123/like',
        { withCredentials: true }
      );
    });

    it('getTrackLikers should unwrap the users array from the YAML envelope', async () => {
      const mockEnvelope = {
        data: {
          success: true,
          data: {
            users: [{ id: 'user-1' }, { id: 'user-2' }],
            pagination: { total: 2 },
          },
        },
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockEnvelope);

      const result = await getTrackLikers('track-123', 2, 10);
      expect(apiClient.get).toHaveBeenCalledWith('/tracks/track-123/likers', {
        params: { page: 2, limit: 10 },
        withCredentials: true,
      });
      expect(result).toEqual([{ id: 'user-1' }, { id: 'user-2' }]);
    });
  });

  describe('Reposts', () => {
    it('repostTrack should call POST and return mocked data', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { reposted: true } },
      });
      const result = await repostTrack('track-123');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/tracks/track-123/repost',
        {},
        { withCredentials: true }
      );
      expect(result).toEqual({ reposted: true });
    });

    it('unrepostTrack should call DELETE and return mocked data', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true, data: { reposted: false } },
      });
      const result = await unrepostTrack('track-123');
      expect(apiClient.delete).toHaveBeenCalledWith(
        '/tracks/track-123/repost',
        { withCredentials: true }
      );
      expect(result).toEqual({ reposted: false });
    });

    it('getTrackReposters should unwrap the users array', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: { users: [{ id: 'reposter-1' }] } },
      });
      const result = await getTrackReposters('track-123', 1, 20);
      expect(result).toEqual([{ id: 'reposter-1' }]);
    });

    it('getUserReposts should unwrap the repostedTracks array from /profile/:id/reposts', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: { repostedTracks: [{ track: { id: 't1' } }] } },
      });
      const result = await getUserReposts('user-123');
      expect(apiClient.get).toHaveBeenCalledWith('/profile/user-123/reposts', {
        params: { page: 1, limit: 20 },
        withCredentials: true,
      });
      expect(result).toEqual([{ track: { id: 't1' } }]);
    });
  });
});
