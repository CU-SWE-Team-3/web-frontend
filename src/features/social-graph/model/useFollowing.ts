import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FollowNode } from "./types";

export const useFollowing = (userId: string = "me") => {
  return useQuery<FollowNode[], Error>({
    queryKey: ["network", "following", userId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get(`${apiUrl}/network/${userId}/following`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
