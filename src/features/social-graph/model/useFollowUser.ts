import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import { FollowNode } from "./types";

export interface FollowUserArgs {
  targetId: string;
  targetUser?: Partial<FollowNode>;
}

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string | FollowUserArgs>({
    mutationFn: async (args) => {
      const targetId = typeof args === 'string' ? args : args.targetId;
      await apiClient.post(`/network/${targetId}/follow`, {}, { withCredentials: true });
    },
    onMutate: async (args) => {
      const targetId = typeof args === 'string' ? args : args.targetId;
      const targetUser = typeof args === 'string' ? undefined : args.targetUser;
      
      const authUser = useAuthStore.getState().user;
      const myId = (authUser as any)?._id || authUser?.id;
      if (!myId) return { myId: null };

      const queryKey = ["network", "following", myId];
      await queryClient.cancelQueries({ queryKey });

      const previousFollowing = queryClient.getQueryData<FollowNode[]>(queryKey);

      const newNode: FollowNode = {
        id: targetId,
        username: targetUser?.username || targetId,
        displayName: targetUser?.displayName || "Newly Followed User",
        avatarUrl: targetUser?.avatarUrl || null,
        followerCount: (targetUser?.followerCount || 0) + 1,
        isFollowing: true,
      };

      if (previousFollowing) {
        if (!previousFollowing.some(u => u.id === targetId)) {
          queryClient.setQueryData<FollowNode[]>(queryKey, [...previousFollowing, newNode]);
        }
      } else {
        // No prior cache — seed it with the new user
        queryClient.setQueryData<FollowNode[]>(queryKey, [newNode]);
      }
      return { previousFollowing, myId, queryKey };
    },
    onError: (err, args, context: any) => {
      if (context?.previousFollowing && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousFollowing);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
