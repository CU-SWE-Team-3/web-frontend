export interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface BlockedUsersResponse {
  success: boolean;
  count: number;
  data: {
    _id: string;
    displayName: string;
    permalink: string;
    avatarUrl: string;
  }[];
}

export interface FollowNode {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface FollowCounts {
  myFollowingCount: number;
  theirFollowerCount: number;
}

export interface NetworkListResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}
