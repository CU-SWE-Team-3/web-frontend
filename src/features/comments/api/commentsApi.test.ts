import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTrackComments, postComment, deleteComment } from './commentsApi';
import apiClient from '@/shared/api/client';
import * as models from '../model/types';

// Mock the apiClient
vi.mock('@/shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the normalisation layer so we only test API envelope logic
vi.mock('../model/types', async () => {
  const actual = await vi.importActual<typeof import('../model/types')>('../model/types');
  return {
    ...actual,
    normaliseComment: vi.fn((raw) => ({ ...raw, isNormalised: true })),
  };
});

describe('commentsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTrackComments should unwrap comments and normalise them', async () => {
    const rawComments = [{ _id: '1', content: 'test 1' }, { _id: '2', content: 'test 2' }];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: { comments: rawComments },
      },
    });

    const result = await getTrackComments('track-123', 1, 50);

    expect(apiClient.get).toHaveBeenCalledWith('/tracks/track-123/comments', {
      params: { page: 1, limit: 50 },
      withCredentials: true,
    });
    
    // Check if normaliseComment was called for each and mapped correctly
    expect(models.normaliseComment).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { _id: '1', content: 'test 1', isNormalised: true },
      { _id: '2', content: 'test 2', isNormalised: true },
    ]);
  });

  it('postComment should send { content, timestamp } and normalise response', async () => {
    const mockReturnedComment = { _id: 'new-1', content: 'hello' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: { comment: mockReturnedComment },
      },
    });

    const result = await postComment('track-123', 'hello', 45);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/tracks/track-123/comments',
      { content: 'hello', timestamp: 45 }, // YAML mappings exactly
      { withCredentials: true }
    );
    expect(result).toEqual({ ...mockReturnedComment, isNormalised: true });
  });

  it('postComment should include parentCommentId if provided', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { data: { comment: {} } },
    });

    await postComment('track-123', 'replying', 10, 'parent-456');

    expect(apiClient.post).toHaveBeenCalledWith(
      '/tracks/track-123/comments',
      { content: 'replying', timestamp: 10, parentCommentId: 'parent-456' },
      { withCredentials: true }
    );
  });

  it('deleteComment should call the correct endpoint via DELETE', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });
    await deleteComment('comment-123');
    expect(apiClient.delete).toHaveBeenCalledWith(
      '/comments/comment-123',
      { withCredentials: true }
    );
  });
});
