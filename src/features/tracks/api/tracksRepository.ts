import axios from "axios";
import apiClient, { API_TIMEOUTS } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import type { Track, UpdateTrackInput, UploadTrackInput } from "../model/track";

const makeWaveform = () =>
  Array.from({ length: 140 }, (_, i) => {
    const x = i / 140;
    const peak = Math.sin(x * Math.PI * 3) * Math.cos(x * Math.PI * 11) * Math.sin(x * Math.PI * 5);
    const noise = Math.random() * 0.15;
    const value = Math.abs(peak) * 80 + noise * 20 + 5; 
    return Math.floor(value);
  });

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

function isCurrentUserIdentifier(username: string): boolean {
  const { user } = useAuthStore.getState();
  if (!user) return username === "me";

  const identifiers = new Set(
    [
      "me",
      user.permalink,
      user.username,
      user.id,
      (user as any)?._id,
    ].filter(Boolean),
  );

  return identifiers.has(username);
}

/**
 * Map a raw API track object to the local Track interface.
 */
function getImageUrl(value: any): string {
  if (!value || value === "undefined" || value === "null") return "";
  if (typeof value === "string") return value;
  return (
    value.artworkUrl ||
    value.artwork_url ||
    value.coverUrl ||
    value.cover_url ||
    value.imageUrl ||
    value.image_url ||
    value.thumbnailUrl ||
    value.thumbnail_url ||
    value.secureUrl ||
    value.secure_url ||
    value.publicUrl ||
    value.public_url ||
    value.fileUrl ||
    value.file_url ||
    value.downloadUrl ||
    value.download_url ||
    value.url ||
    value.src ||
    ""
  );
}

function mapApiTrack(t: any, fallbackArtist?: string): Track {
  const durationValue = typeof t.duration === "number"
    ? `${Math.floor(t.duration / 60)}:${Math.floor(t.duration % 60).toString().padStart(2, "0")}`
    : t.duration || "0:00";

  let artistName = t.artist?.displayName || t.artist?.permalink || t.artist?.username || t.artist;
  if (typeof artistName === 'string' && /^[0-9a-fA-F]{24}$/.test(artistName)) {
    artistName = fallbackArtist || "Unknown Artist";
  } else if (!artistName) {
    artistName = fallbackArtist || "Unknown Artist";
  }

  // Aligned with latest YAML spec
  const hls = t.hlsUrl || t.hls_url || "";
  const stream = t.streamUrl || t.stream_url || t.audioUrl || t.audio_url || hls || "";
  const artwork = getImageUrl(t.artworkUrl || t.artwork_url || t.artwork || t.coverUrl || t.cover_url || t.imageUrl || t.image_url || t.thumbnailUrl || t.thumbnail_url);

  return {
    id: t._id || t.id,
    _id: t._id || t.id,
    permalink: t.permalink || t.id,
    title: t.title || "Untitled",
    artist: artistName,
    genre: t.genre || "",
    tags: t.tags || [],
    description: t.description || "",
    releaseDate: t.releaseDate || "",
    visibility: t.isPublic === false ? "Private" as const : "Public" as const,
    status: (t.processingState === "Finished" ? "Finished" : (t.processingState === "Failed" ? "Failed" : "Processing")) as "Finished" | "Processing" | "Failed",
    audioFileName: t.audioFileName || t.fileName || "",
    artworkUrl: artwork,
    waveform: t.waveform || makeWaveform(),
    duration: durationValue,
    createdAt: t.createdAt || t.created_at || "",
    updatedAt: t.updatedAt || t.updated_at || "",
    streamUrl: stream,
    hlsUrl: hls,
    playCount: t.playCount || t.play_count || 0,
    likeCount: t.likeCount || t.like_count || 0,
    repostCount: t.repostCount || t.repost_count || 0,
    commentCount: t.commentCount || t.comment_count || 0,
  };
}

export const tracksRepository = {
  async uploadTrack(
    payload: UploadTrackInput,
    onProgress?: (progress: number) => void,
    audioFile?: File,
    artworkFile?: File,
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

        // Try to get a reliable mime type, falling back to extension-based guessing
        let finalFormat = audioFile.type;
        if (!finalFormat) {
          const ext = audioFile.name.split('.').pop()?.toLowerCase();
          const mimeMap: Record<string, string> = {
            'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'flac': 'audio/flac', 
            'ogg': 'audio/ogg', 'aac': 'audio/aac', 'm4a': 'audio/mp4'
          };
          finalFormat = (ext && mimeMap[ext]) ? mimeMap[ext] : "audio/mpeg";
        }

        // Step 1: Request Azure SAS URL from our backend
        const initResponse = await apiClient.post("/tracks/upload", {
          title: payload.title,
          format: finalFormat,
          size: audioFile.size,
          duration: durationInSeconds
        }, { timeout: API_TIMEOUTS.uploadInit });

        const trackData = initResponse.data?.data;
        if (!trackData?.trackId || !trackData?.uploadUrl) {
          throw new Error("Invalid response from /tracks/upload");
        }
        const { trackId, uploadUrl } = trackData;

        // Step 2: PUT raw binary directly to Azure Blob
        await axios.put(uploadUrl, audioFile, {
          headers: {
            "Content-Type": finalFormat,
            "x-ms-blob-type": "BlockBlob"
          },
          timeout: API_TIMEOUTS.uploadBinary,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percent);
            }
          },
        });

        // Step 3: Confirm upload to trigger processing
        await apiClient.patch(`/tracks/${trackId}/confirm`, {}, { timeout: API_TIMEOUTS.uploadConfirm });
        console.log('[tracksRepository] Upload confirmed for trackId:', trackId, '| userId is derived from JWT on backend');

        // Step 4: Update metadata (only send valid fields so we don't trip strict API validation)
        const metadataPayload: any = { title: payload.title };
        if (payload.description) metadataPayload.description = payload.description;
        if (payload.genre && payload.genre.trim() !== "None") metadataPayload.genre = payload.genre;
        if (payload.tags && payload.tags.length > 0) metadataPayload.tags = payload.tags;
        if (payload.releaseDate) {
          metadataPayload.releaseDate = new Date(payload.releaseDate).toISOString();
        }

        await apiClient.patch(`/tracks/${trackId}/metadata`, metadataPayload, { timeout: API_TIMEOUTS.uploadMetadata });

        // Step 5: Update visibility
        await apiClient.patch(`/tracks/${trackId}/visibility`, {
          isPublic: payload.visibility === "Public"
        }, { timeout: API_TIMEOUTS.uploadMetadata });

        let uploadedArtworkUrl =
          payload.artworkUrl || "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=420&h=420&fit=crop";

        if (artworkFile) {
          const artworkData = new FormData();
          artworkData.append("artwork", artworkFile);

          const artworkResponse = await apiClient.patch(
            `/tracks/${trackId}/artwork`,
            artworkData,
            {
              timeout: API_TIMEOUTS.uploadMetadata,
              headers: {
                "Content-Type": undefined,
              },
            },
          );

          uploadedArtworkUrl =
            artworkResponse.data?.data?.artworkUrl ||
            artworkResponse.data?.artworkUrl ||
            uploadedArtworkUrl;
        }

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
          artworkUrl: uploadedArtworkUrl,
          waveform: makeWaveform(),
          duration: durationFormatted,
          createdAt: new Date().toISOString(),
          streamUrl: streamUrl,
          labelName: payload.labelName,
          isrc: payload.isrc,
          publisher: payload.publisher,
          buyLink: payload.buyLink,
          allowComments: payload.allowComments ?? true,
          playCount: 0,
          likeCount: 0,
          repostCount: 0,
          commentCount: 0,
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
   * Fetch ALL tracks owned by the authenticated user from the backend.
   * GET /tracks/my-tracks
   * v1.10 envelope: { success, count, data: Track[] }  ← array is at data.data
   * Used by the My Tracks / Track Management page.
   */
  async getTracks(): Promise<Track[]> {
    try {
      console.log('[tracksRepository] getTracks: fetching from API via /tracks/my-tracks');
      const response = await apiClient.get('/tracks/my-tracks');
      // v1.10: envelope is { success, count, data: Track[] } — array lives directly in data.data
      const apiTracks = response.data?.data || response.data?.tracks || response.data || [];

      if (Array.isArray(apiTracks)) {
        return apiTracks.map((t: any) => mapApiTrack(t));
      }
    } catch (err) {
      console.warn('[tracksRepository] /tracks/my-tracks failed, falling back:', err);
    }

    // Fallback: /profile/{userId}/tracks (v1.10 spec — replaces /users/{username}/tracks)
    try {
      const { user } = useAuthStore.getState();
      const userId = (user as any)?._id || user?.id;

      if (userId) {
        console.log('[tracksRepository] getTracks: fallback via /profile/' + userId + '/tracks');
        const response = await apiClient.get(`/profile/${userId}/tracks`);
        // v1.10 envelope: { success, data: { total, page, totalPages, tracks: Track[] } }
        const apiTracks = response.data?.data?.tracks || response.data?.data || response.data?.tracks || [];

        if (Array.isArray(apiTracks)) {
          return apiTracks.map((t: any) => mapApiTrack(t));
        }
      }
    } catch (err) {
      console.warn('[tracksRepository] getTracks profile fallback failed:', err);
    }

    return [];
  },

  /**
   * Fetch tracks for a specific artist/user.
   * Uses GET /tracks/my-tracks for the current user or GET /profile/{userId}/tracks for others.
   * v1.10: /profile/{userId}/tracks requires a MongoDB ObjectId.
   * Falls back through permalink resolution if needed.
   */
  async getTracksByArtist(username: string): Promise<Track[]> {
    const resolvedUsername = resolveUsername(username);

    try {
      // Own tracks — use the dedicated endpoint
      if (isCurrentUserIdentifier(username) || isCurrentUserIdentifier(resolvedUsername)) {
        console.log('[tracksRepository] Fetching own tracks from API:', '/tracks/my-tracks');
        const response = await apiClient.get('/tracks/my-tracks');
        // v1.10 envelope: { success, count, data: Track[] }
        const apiTracks = response.data?.data || response.data?.tracks || response.data || [];

        if (Array.isArray(apiTracks)) {
          return apiTracks.map((t: any) => mapApiTrack(t, resolvedUsername));
        }
      }

      // Other users — resolve to ObjectId first, then use /profile/{userId}/tracks
      // v1.10 spec: only /profile/{userId}/tracks exists (no /users/{username}/tracks)
      let resolvedId = resolvedUsername;
      if (resolvedUsername.length !== 24) {
        try {
          const profRes = await apiClient.get(`/profile/${resolvedUsername}`);
          resolvedId = profRes.data?.data?.user?._id || profRes.data?.data?._id || resolvedUsername;
        } catch {
          // Keep resolvedUsername as fallback
        }
      }

      const endpointsToTry = [
        `/profile/${resolvedId}/tracks?limit=100`,
        // Legacy fallback in case the backend still supports the old route
        `/profile/${resolvedUsername}/tracks?limit=100`,
      ];

      for (const endpoint of endpointsToTry) {
        try {
          console.log('[tracksRepository] Attempting to fetch tracks from API:', endpoint);
          const response = await apiClient.get(endpoint);
          // v1.10 envelope: { success, data: { total, page, totalPages, tracks: Track[] } }
          const apiTracks =
            response.data?.data?.tracks ||
            response.data?.data ||
            response.data?.tracks ||
            response.data ||
            [];
          if (Array.isArray(apiTracks) && apiTracks.length > 0) {
            console.log(`[tracksRepository] API returned ${apiTracks.length} tracks using endpoint: ${endpoint}`);
            return apiTracks.map((t: any) => mapApiTrack(t, resolvedUsername));
          }
        } catch (err: any) {
          if (err.response?.status !== 404) {
            console.warn(`[tracksRepository] API endpoint ${endpoint} failed with non-404:`, err.message);
          }
        }
      }

      return [];
    } catch (err) {
      console.warn('[tracksRepository] API fetch for user tracks entirely failed:', err);
      return [];
    }
  },

  async getTrackById(identifier: string): Promise<Track> {
    // ── Try real API first ──
    try {
      console.log('[tracksRepository] Fetching track from API by permalink:', identifier);
      const response = await apiClient.get(`/tracks/${identifier}`);
      const t = response.data?.data?.track || response.data?.data || response.data;
      if (t) {
        return mapApiTrack(t);
      }
    } catch (err: any) {
      console.warn('[tracksRepository] Primary /tracks/:permalink fetch failed:', err?.response?.status, err?.message);
    }

    // ── Fallback 1: check the logged-in user's own tracks ──
    try {
      const fallbackResponse = await apiClient.get('/tracks/my-tracks');
      const apiTracks = fallbackResponse.data?.data || fallbackResponse.data?.tracks || fallbackResponse.data || [];
      if (Array.isArray(apiTracks)) {
        const foundTrack = apiTracks.find((t: any) =>
          (t.permalink || t._id || t.id) === identifier ||
          (t._id || t.id) === identifier,
        );
        if (foundTrack) {
          console.log('[tracksRepository] Track found in my-tracks fallback');
          return mapApiTrack(foundTrack);
        }
      }
    } catch (fallbackErr) {
      console.warn('[tracksRepository] my-tracks fallback failed:', fallbackErr);
    }

    // ── Fallback 2: try alternative single-track endpoints ──
    const altEndpoints = [
      `/tracks/${identifier}/details`,
      `/tracks/track/${identifier}`,
    ];
    for (const endpoint of altEndpoints) {
      try {
        const res = await apiClient.get(endpoint);
        const t = res.data?.data?.track || res.data?.data || res.data;
        if (t && (t._id || t.id)) {
          console.log(`[tracksRepository] Track found via ${endpoint}`);
          return mapApiTrack(t);
        }
      } catch {
        // silently try next
      }
    }

    // ── Fallback 3: search all users' tracks for the given permalink/ID ──
    // This covers the case where the backend's /tracks/:permalink returns 500 for
    // valid tracks owned by other users.
    const userTrackEndpoints = [
      `/users/tracks?limit=200`,
      `/tracks?limit=200`,
    ];
    for (const endpoint of userTrackEndpoints) {
      try {
        const res = await apiClient.get(endpoint);
        const list = res.data?.data || res.data?.tracks || res.data || [];
        if (Array.isArray(list)) {
          const found = list.find((t: any) =>
            (t.permalink || t._id || t.id) === identifier ||
            (t._id || t.id) === identifier,
          );
          if (found) {
            console.log(`[tracksRepository] Track found via bulk ${endpoint}`);
            return mapApiTrack(found);
          }
        }
      } catch {
        // silently try next
      }
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
  /**
   * Upload custom artwork for a track.
   * PATCH /tracks/{id}/artwork (multipart/form-data with "artwork" field)
   * v1.10: 200 → { success, message, data: { artworkUrl: string } }
   * Requires authentication. Only the track owner may call this.
   */
  async uploadTrackArtwork(trackId: string, file: File): Promise<{ artworkUrl: string }> {
    const formData = new FormData();
    formData.append('artwork', file);

    const response = await apiClient.patch(
      `/tracks/${trackId}/artwork`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );

    return response.data?.data ?? { artworkUrl: '' };
  },
  
  async searchTracks(query: string): Promise<Track[]> {
    try {
      const response = await apiClient.get('/tracks/search', {
        params: { q: query, type: 'tracks' }
      });
      const apiTracks = response.data?.data?.tracks || [];
      return apiTracks.map((t: any) => mapApiTrack(t));
    } catch (err) {
      console.warn('[tracksRepository] searchTracks failed:', err);
      return [];
    }
  },
};
