import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FollowNode, NetworkListResponse } from "./types";

// The API returns User objects — we map them to our FollowNode shape
interface ApiUser {
  _id: string;
  displayName: string;
  permalink: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
}

const mapUserToFollowNode = (user: ApiUser): FollowNode => ({
  id: user._id,
  username: user.permalink,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  followerCount: user.followerCount,
  followingCount: user.followingCount,
});

export const useFollowers = (userId: string = "me") => {
  return useQuery<FollowNode[], Error>({
    queryKey: ["network", "followers", userId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get<NetworkListResponse<ApiUser>>(
        `${apiUrl}/network/${userId}/followers`
      );
      return data.data.map(mapUserToFollowNode);
    },
    staleTime: 5 * 60 * 1000,
  });
};
