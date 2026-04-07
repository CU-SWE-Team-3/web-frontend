import apiClient from '@/shared/api/client';
import { normaliseComment, type TrackComment } from '../model/types';

/**
 * GET /tracks/{trackId}/comments
 * YAML: 200 → { success, count, total, data: { comments: Comment[] } }
 */
export const getTrackComments = async (trackId: string, page = 1, limit = 50): Promise<TrackComment[]> => {
  const { data } = await apiClient.get(`/tracks/${trackId}/comments`, {
    params: { page, limit },
    withCredentials: true,
  });
  // YAML envelope: data.data.comments is the array
  const raw: any[] = data.data?.comments ?? data.data ?? [];
  return raw.map(normaliseComment);
};

/**
 * POST /tracks/{trackId}/comments
 * YAML expects body: { content, timestamp, parentCommentId? }
 * YAML: 201 → { success, data: { comment: Comment } }
 *
 * ⚠ PREVIOUSLY sent { text, timestampSeconds } — corrected to { content, timestamp }
 */
export const postComment = async (
  trackId: string,
  text: string,
  timestampSeconds: number,
  parentCommentId?: string
): Promise<TrackComment> => {
  const { data } = await apiClient.post(
    `/tracks/${trackId}/comments`,
    {
      content: text,
      timestamp: timestampSeconds,
      ...(parentCommentId ? { parentCommentId } : {}),
    },
    { withCredentials: true }
  );
  // YAML envelope: data.data.comment is the created comment
  const raw = data.data?.comment ?? data.data ?? data;
  return normaliseComment(raw);
};

/**
 * DELETE /comments/{commentId}
 * YAML: 200 → SuccessMessage
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  await apiClient.delete(`/comments/${commentId}`, { withCredentials: true });
};
