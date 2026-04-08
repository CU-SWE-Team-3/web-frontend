import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postComment } from "../api/commentsApi";
import { TRACK_COMMENTS_QUERY_KEY } from "./useTrackComments";
import type { TrackComment } from "./types";
import { useAuthStore } from "@/features/auth/model/useAuthStore";

export const usePostComment = (trackId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ text, timestampSeconds }: { text: string; timestampSeconds: number }) =>
      postComment(trackId, text, timestampSeconds),
    onMutate: async ({ text, timestampSeconds }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: [...TRACK_COMMENTS_QUERY_KEY, trackId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<TrackComment[]>([...TRACK_COMMENTS_QUERY_KEY, trackId]);

      // Optimistically add the new comment
      const currentUser = useAuthStore.getState().user;
      
      const fakeId = `optimistic-${Date.now()}`;
      
      const newComment: TrackComment = {
        id: fakeId,
        _id: fakeId,
        text,
        content: text,
        timestampSeconds,
        timestamp: timestampSeconds,
        displayName: currentUser?.displayName || "You",
        username: currentUser?.permalink || "anonymous",
        avatarUrl: currentUser?.avatarUrl || null,
        createdAt: new Date().toISOString(),
        userId: currentUser?.id || "me",
        user: {
          _id: currentUser?.id || "me",
          displayName: currentUser?.displayName || "You",
          permalink: currentUser?.permalink || "anonymous",
          avatarUrl: currentUser?.avatarUrl || "",
        }
      };

      queryClient.setQueryData<TrackComment[]>([...TRACK_COMMENTS_QUERY_KEY, trackId], (old = []) => [
        newComment,
        ...old,
      ]);

      return { previousComments };
    },
    onSuccess: () => {
      // Only refetch on actual success. If offline/mocking, we keep the optimistic update forever!
      queryClient.invalidateQueries({
        queryKey: [...TRACK_COMMENTS_QUERY_KEY, trackId],
      });
    },
    onError: (err) => {
      console.warn("Backend rejected the comment, but preserving locally for dev mode.", err);
      // Dev bypass: We intentionally DO NOT roll back to previousComments here so the UI keeps it
    }
  });
};
