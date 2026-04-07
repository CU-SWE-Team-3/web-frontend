import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postComment } from "../api/commentsApi";
import { TRACK_COMMENTS_QUERY_KEY } from "./useTrackComments";

export const usePostComment = (trackId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ text, timestampSeconds }: { text: string; timestampSeconds: number }) =>
      postComment(trackId, text, timestampSeconds),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [...TRACK_COMMENTS_QUERY_KEY, trackId],
      });
    },
  });
};
