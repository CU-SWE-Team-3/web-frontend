import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      await axios.delete(`${apiUrl}/network/${userId}/follow`, { withCredentials: true });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
    },
  });
};
