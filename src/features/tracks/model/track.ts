export type TrackVisibility = "Public" | "Private";
export type ProcessingStatus = "Processing" | "Finished" | "Failed";

export interface Track {
  id: string;
  _id?: string;
  permalink?: string;
  title: string;
  artist: string;
  genre: string;
  tags: string[];
  description?: string;
  releaseDate: string;
  visibility: TrackVisibility;
  status: ProcessingStatus;
  secretToken?: string;
  audioFileName: string;
  artworkUrl: string;
  waveform: number[];
  duration: string;
  createdAt: string;
  updatedAt?: string;
  hlsUrl?: string;
  streamUrl?: string;
  // Locally retained UI metadata
  labelName?: string;
  isrc?: string;
  publisher?: string;
  buyLink?: string;
  allowComments?: boolean;
  // Engagement counts
  playCount?: number;
  likeCount?: number;
  repostCount?: number;
  commentCount?: number;
}

export interface UploadTrackInput {
  title: string;
  genre: string;
  tags: string[];
  description?: string;
  releaseDate: string;
  visibility: TrackVisibility;
  status: ProcessingStatus;
  artworkUrl?: string;
  fileName: string;
  excerptStart?: number;
  excerptEnd?: number;
  // Locally retained UI metadata
  labelName?: string;
  isrc?: string;
  publisher?: string;
  buyLink?: string;
  allowComments?: boolean;
}

export interface UpdateTrackInput {
  title?: string;
  genre?: string;
  tags?: string[];
  description?: string;
  releaseDate?: string;
  visibility?: TrackVisibility;
  status?: ProcessingStatus;
  artworkUrl?: string;
  // Locally retained UI metadata
  labelName?: string;
  isrc?: string;
  publisher?: string;
  buyLink?: string;
  allowComments?: boolean;
}
