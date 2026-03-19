export type TrackVisibility = "Public" | "Private";
export type ProcessingStatus = "Processing" | "Finished";

export interface Track {
  id: string;
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
}
