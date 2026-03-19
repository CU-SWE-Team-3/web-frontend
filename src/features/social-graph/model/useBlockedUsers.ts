import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BlockedUser, BlockedUsersResponse } from "./types";

export const BLOCKED_USERS_QUERY_KEY = ["blocked-users"] as const;

export const useBlockedUsers = () => {
  return useQuery<BlockedUser[], Error>({
    queryKey: BLOCKED_USERS_QUERY_KEY,
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get<BlockedUsersResponse>(
        `${apiUrl}/network/blocked-users`,
        { withCredentials: true }
      );

      return data.data.map((user) => ({
        id: user._id,
        username: user.permalink,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      }));
    },
  });
};
