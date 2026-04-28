// ─── Playlist Types ──────────────────────────────────────────────────────────

export type ReleaseType = 'playlist' | 'album' | 'ep' | 'single';

export interface PlaylistCreator {
  _id: string;
  displayName: string;
  permalink: string;
  avatarUrl: string | null;
  isPremium?: boolean;
}

export interface TrackArtist {
  _id: string;
  displayName: string;
  permalink: string;
  avatarUrl: string | null;
  isPremium?: boolean;
}

export interface TrackSummary {
  _id: string;
  title: string;
  permalink: string;
  artworkUrl: string;
  duration: number; // seconds
  playCount: number;
  likeCount: number;
  repostCount: number;
  commentCount: number;
  isPublic: boolean;
  hlsUrl?: string;
  streamUrl?: string;
  artist: TrackArtist | string;
}

export interface Playlist {
  _id: string;
  title: string;
  permalink: string;
  creator: PlaylistCreator | string;
  description: string;
  releaseType: ReleaseType;
  tags: string[];
  genre: string;
  releaseDate: string;
  labelName: string;
  buyLink: string;
  buyTitle: string;
  upc: string;
  tracks: (TrackSummary | string)[];
  artworkUrl: string;
  isPrivate: boolean;
  secretToken: string;
  trackCount: number;
  totalDuration: number; // seconds
  playCount: number;
  likeCount: number;
  repostCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistSummary {
  _id: string;
  title: string;
  permalink: string;
  artworkUrl: string;
  trackCount: number;
  releaseType: ReleaseType;
  creator: PlaylistCreator;
}

export interface CreatePlaylistInput {
  title: string;
  description?: string;
  releaseType?: ReleaseType;
  tags?: string[];
  genre?: string;
  releaseDate?: string;
  labelName?: string;
  buyLink?: string;
  buyTitle?: string;
  upc?: string;
  isPrivate?: boolean;
}

export interface UpdatePlaylistInput {
  title?: string;
  description?: string;
  releaseType?: ReleaseType;
  tags?: string[];
  genre?: string;
  releaseDate?: string;
  labelName?: string;
  buyLink?: string;
  buyTitle?: string;
  upc?: string;
  isPrivate?: boolean;
}
