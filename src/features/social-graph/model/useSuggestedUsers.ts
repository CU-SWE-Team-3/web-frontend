import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FollowNode } from "./types";

export const useSuggestedUsers = () => {
  return useQuery<FollowNode[], Error>({
    queryKey: ["network", "suggested"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get(`${apiUrl}/network/suggested`);
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
