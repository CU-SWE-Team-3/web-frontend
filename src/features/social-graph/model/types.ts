export interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface BlockedUsersResponse {
  success: boolean;
  message: string;
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
  isFollowing?: boolean;
}
