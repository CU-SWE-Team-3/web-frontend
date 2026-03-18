import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FollowCounts } from "./types";

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation<FollowCounts, Error, string>({
    mutationFn: async (userId: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.post(`${apiUrl}/network/${userId}/follow`);
      return data.data as FollowCounts;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });
};
