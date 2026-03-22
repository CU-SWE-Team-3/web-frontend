import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/network/${userId}/follow`, { withCredentials: true });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });
};
