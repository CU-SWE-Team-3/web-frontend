import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FollowNode } from "./types";

export const useFollowers = (userId: string = "me") => {
  return useQuery<FollowNode[], Error>({
    queryKey: ["network", "followers", userId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get(`${apiUrl}/network/${userId}/followers`, {
        withCredentials: true,
      });
      return data.data ?? data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
