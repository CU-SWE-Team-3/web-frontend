import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { BLOCKED_USERS_QUERY_KEY } from "./useBlockedUsers";
import { BlockedUser } from "./types";

/**
 * DELETE /network/{userId}/block
 * v1.10: 200 → { success, message, data: { status: "unblocked" } }
 * Requires authentication.
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, { previousBlockedUsers: BlockedUser[] | undefined }>({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/network/${userId}/block`, { withCredentials: true });
    },

    onMutate: async (unblockedUserId) => {
      await queryClient.cancelQueries({ queryKey: BLOCKED_USERS_QUERY_KEY });

      const previousBlockedUsers = queryClient.getQueryData<BlockedUser[]>(BLOCKED_USERS_QUERY_KEY);

      if (previousBlockedUsers) {
        queryClient.setQueryData<BlockedUser[]>(
          BLOCKED_USERS_QUERY_KEY,
          previousBlockedUsers.filter((user) => user.id !== unblockedUserId)
        );
      }

      return { previousBlockedUsers };
    },

    onError: (_err, _unblockedUserId, context) => {
      if (context?.previousBlockedUsers) {
        queryClient.setQueryData(BLOCKED_USERS_QUERY_KEY, context.previousBlockedUsers);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BLOCKED_USERS_QUERY_KEY });
    },
  });
};
