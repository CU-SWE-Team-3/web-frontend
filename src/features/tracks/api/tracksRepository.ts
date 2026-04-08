import axios from "axios";
import apiClient from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import type { Track, UpdateTrackInput, UploadTrackInput } from "../model/track";

const makeWaveform = () =>
  Array.from({ length: 70 }, (_, i) => 10 + ((i * 13) % 62));

/**
 * Resolve the "me" keyword or the current user's identifier
 * to a real permalink/username the API understands.
 */
function resolveUsername(username: string): string {
  if (username === "me") {
    const { user } = useAuthStore.getState();
    return user?.permalink || user?.username || (user as any)?._id || user?.id || username;
  }
  return username;
}

/**
 * Map a raw API track object to the local Track interface.
 */
function mapApiTrack(t: any, fallbackArtist?: string): Track {
  const durationValue = typeof t.duration === "number"
    ? `${Math.floor(t.duration / 60)}:${Math.floor(t.duration % 60).toString().padStart(2, "0")}`
    : t.duration || "0:00";

  return {
    id: t._id || t.id,
    title: t.title || "Untitled",
    artist: t.artist?.displayName || t.artist?.permalink || t.artist?.username || t.artist || fallbackArtist || "",
    genre: t.genre || "",
    tags: t.tags || [],
    description: t.description || "",
    releaseDate: t.releaseDate || "",
    visibility: t.isPublic === false ? "Private" as const : "Public" as const,
    status: (t.processingState === "Finished" || t.status === "Finished" ? "Finished" : "Processing") as "Finished" | "Processing",
    audioFileName: t.audioFileName || t.fileName || "",
    artworkUrl: t.artworkUrl || "",
    waveform: t.waveform || makeWaveform(),
    duration: durationValue,
    createdAt: t.createdAt || "",
    streamUrl: t.hlsUrl || t.streamUrl || "",
    hlsUrl: t.hlsUrl || "",
    playCount: t.playCount || 0,
    likeCount: t.likeCount || 0,
    repostCount: t.repostCount || 0,
    commentCount: t.commentCount || 0,
  };
}

export const tracksRepository = {
  async uploadTrack(
    payload: UploadTrackInput,
    onProgress?: (progress: number) => void,
    audioFile?: File,
  ): Promise<Track> {
    // ── Try real API first ──
    if (audioFile) {
      try {
        let durationInSeconds = 0;
        let streamUrl = URL.createObjectURL(audioFile);
        try {
          const audio = new Audio(streamUrl);
          await new Promise((resolve) => {
            audio.onloadedmetadata = resolve;
            audio.onerror = resolve;
            setTimeout(resolve, 2000);
          });
          if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            durationInSeconds = audio.duration;
          }
        } catch (e) {
          console.warn("Could not read local duration", e);
        }

        // Step 1: Request Azure SAS URL from our backend
        const initResponse = await apiClient.post("/tracks/upload", {
          title: payload.title,
          format: audioFile.type || "audio/mpeg",
          size: audioFile.size,
          duration: durationInSeconds
        });

        const trackData = initResponse.data?.data;
        if (!trackData?.trackId || !trackData?.uploadUrl) {
          throw new Error("Invalid response from /tracks/upload");
        }
        const { trackId, uploadUrl } = trackData;

        // Step 2: PUT raw binary directly to Azure Blob
        await axios.put(uploadUrl, audioFile, {
          headers: {
            "Content-Type": audioFile.type || "audio/mpeg",
            "x-ms-blob-type": "BlockBlob"
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percent);
            }
          },
        });

        // Step 3: Confirm upload to trigger processing
        await apiClient.patch(`/tracks/${trackId}/confirm`);
        console.log('[tracksRepository] Upload confirmed for trackId:', trackId, '| userId is derived from JWT on backend');

        // Step 4: Update metadata (only send valid fields so we don't trip strict API validation)
        const metadataPayload: any = { title: payload.title };
        if (payload.description) metadataPayload.description = payload.description;
        if (payload.genre && payload.genre.trim() !== "None") metadataPayload.genre = payload.genre;
        if (payload.tags && payload.tags.length > 0) metadataPayload.tags = payload.tags;
        if (payload.releaseDate) {
          metadataPayload.releaseDate = new Date(payload.releaseDate).toISOString();
        }

        await apiClient.patch(`/tracks/${trackId}/metadata`, metadataPayload);

        // Step 5: Update visibility
        await apiClient.patch(`/tracks/${trackId}/visibility`, {
          isPublic: payload.visibility === "Public"
        });

        const durationFormatted = `${Math.floor(durationInSeconds / 60)}:${Math.floor(durationInSeconds % 60).toString().padStart(2, "0")}`;

        const authState = useAuthStore.getState();
        const currentUser = authState.user;
        const uploaderName = currentUser?.permalink || currentUser?.username || currentUser?.id || "You";

        // Return a Track object for immediate UI display.
        // React Query will invalidate & refetch from the backend automatically.
        const uploadedTrack: Track = {
          id: trackId,
          title: payload.title,
          artist: uploaderName,
          genre: payload.genre,
          tags: payload.tags || [],
          description: payload.description,
          releaseDate: payload.releaseDate || new Date().toISOString(),
          visibility: payload.visibility,
          status: "Processing",
          audioFileName: payload.fileName,
          artworkUrl: payload.artworkUrl || "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=420&h=420&fit=crop",
          waveform: makeWaveform(),
          duration: durationFormatted,
          createdAt: new Date().toISOString(),
          streamUrl: streamUrl,
          labelName: payload.labelName,
          isrc: payload.isrc,
          publisher: payload.publisher,
          buyLink: payload.buyLink,
          allowComments: payload.allowComments ?? true,
        };

        return uploadedTrack;

      } catch (err) {
        console.error("Real API upload failed:", err);
        throw err; // Don't silently fall back — let the user know
      }
    }

    throw new Error("No audio file provided for upload.");
  },

  /**
   * Fetch ALL tracks visible to the current user from the backend.
   * Used by the My Tracks / Track Management page.
   */
  async getTracks(): Promise<Track[]> {
    try {
      // Try fetching the current user's tracks via their permalink
      const { user } = useAuthStore.getState();
      const username = user?.permalink || user?.username || (user as any)?._id || user?.id;

      if (username) {
        console.log('[tracksRepository] getTracks: fetching from API via /users/' + username + '/tracks');
        const response = await apiClient.get(`/users/${username}/tracks`);
        const apiTracks = response.data?.data || response.data?.tracks || response.data || [];

        if (Array.isArray(apiTracks)) {
          return apiTracks.map((t: any) => mapApiTrack(t, username));
        }
      }

      // Fallback: try generic /tracks endpoint
      console.log('[tracksRepository] getTracks: trying generic /tracks endpoint');
      const response = await apiClient.get('/tracks');
      const apiTracks = response.data?.data || response.data?.tracks || response.data || [];
      if (Array.isArray(apiTracks)) {
        return apiTracks.map((t: any) => mapApiTrack(t));
      }

      return [];
    } catch (err) {
      console.warn('[tracksRepository] getTracks API failed:', err);
      return [];
    }
  },

  async getTracksByArtist(username: string): Promise<Track[]> {
    const resolvedUsername = resolveUsername(username);

    try {
      console.log('[tracksRepository] Fetching tracks for user from API:', `/users/${resolvedUsername}/tracks`);
      const response = await apiClient.get(`/users/${resolvedUsername}/tracks`);
      const apiTracks = response.data?.data || response.data?.tracks || response.data || [];
      console.log('[tracksRepository] API returned', Array.isArray(apiTracks) ? apiTracks.length : 0, 'tracks for user:', resolvedUsername);

      if (Array.isArray(apiTracks)) {
        return apiTracks.map((t: any) => mapApiTrack(t, resolvedUsername));
      }

      return [];
    } catch (err) {
      console.warn('[tracksRepository] API fetch for user tracks failed:', err);
      return [];
    }
  },

  async getTrackById(id: string): Promise<Track> {
    // ── Try real API first ──
    try {
      console.log('[tracksRepository] Fetching track from API by id/permalink:', id);
      const response = await apiClient.get(`/tracks/${id}`);
      const t = response.data?.data?.track || response.data?.data || response.data;
      if (t) {
        return mapApiTrack(t);
      }
    } catch (err) {
      console.warn('[tracksRepository] API fetch for track failed:', err);
    }

    throw new Error("Track not found");
  },

  async updateTrack(id: string, updates: UpdateTrackInput): Promise<Track> {
    try {
      const metadataPayload: any = {};
      if (updates.title) metadataPayload.title = updates.title;
      if (updates.description) metadataPayload.description = updates.description;
      if (updates.genre) metadataPayload.genre = updates.genre;
      if (updates.tags) metadataPayload.tags = updates.tags;
      if (updates.releaseDate) metadataPayload.releaseDate = new Date(updates.releaseDate).toISOString();

      if (Object.keys(metadataPayload).length > 0) {
        await apiClient.patch(`/tracks/${id}/metadata`, metadataPayload);
      }

      if (updates.visibility !== undefined) {
        await apiClient.patch(`/tracks/${id}/visibility`, {
          isPublic: updates.visibility === "Public"
        });
      }

      // Re-fetch the updated track from the API
      return await this.getTrackById(id);
    } catch (err) {
      console.warn('[tracksRepository] API update failed:', err);
      throw err;
    }
  },

  async deleteTrack(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/tracks/${id}`);
      return { success: true };
    } catch (err) {
      console.warn('[tracksRepository] API delete failed:', err);
      throw err;
    }
  },
};
