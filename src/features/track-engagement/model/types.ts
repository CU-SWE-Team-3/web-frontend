export interface TrackNode {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  createdAt: string; // E.g., "4 years ago"
  durationFormatted: string; // E.g., "2:00:53"
  playCount: number;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  isLiked: boolean; // Indicates if the current user likes it
  isReposted: boolean; // Indicates if the current user reposted it
  streamUrl?: string;
  hlsUrl?: string;
  audioFileName?: string;
  duration?: number;
}
