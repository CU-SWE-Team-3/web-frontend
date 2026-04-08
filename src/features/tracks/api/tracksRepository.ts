import axios from "axios";
import apiClient from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import type { Track, UpdateTrackInput, UploadTrackInput } from "../model/track";

const WAIT = 450;
const CURRENT_ARTIST = "You";

const makeWaveform = () =>
  Array.from({ length: 70 }, (_, i) => 10 + ((i * 13) % 62));

let tracks: Track[] = [
  {
    id: "1",
    title: "City Lights",
    artist: CURRENT_ARTIST,
    genre: "Electronic",
    description: "A driving synth wave track inspired by the neon lights of the city.",
    tags: ["night", "synth", "driving"],
    releaseDate: "2026-03-01",
    visibility: "Public",
    status: "Finished",
    audioFileName: "city-lights.mp3",
    artworkUrl:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=420&h=420&fit=crop",
    waveform: makeWaveform(),
    duration: "3:46",
    createdAt: "2026-03-01T10:20:00.000Z",
  },
  {
    id: "2",
    title: "Unreleased Draft",
    artist: CURRENT_ARTIST,
    genre: "House",
    description: "Early concept mix for a club banger. Needs more bass.",
    tags: ["draft", "club"],
    releaseDate: "2026-03-15",
    visibility: "Private",
    status: "Processing",
    audioFileName: "draft-mix.wav",
    artworkUrl:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=420&h=420&fit=crop",
    waveform: makeWaveform(),
    duration: "4:02",
    createdAt: "2026-03-05T08:00:00.000Z",
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep axios usage through a repository boundary while serving local mock data.
void apiClient;

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
        const uploaderName = currentUser?.permalink || currentUser?.username || currentUser?.id || CURRENT_ARTIST;

        const fakeTrack: Track = {
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
          streamUrl: streamUrl, // Keep local reference for immediate playback while backend processes
          labelName: payload.labelName,
          isrc: payload.isrc,
          publisher: payload.publisher,
          buyLink: payload.buyLink,
          allowComments: payload.allowComments ?? true,
        };

        // Replace the tracks state locally so it shows up in getTracks right away
        tracks = [fakeTrack, ...tracks];
        return fakeTrack;

      } catch (err) {
        console.warn("Real API upload failed, falling back to mock:", err);
      }
    }

    // ── Mock fallback ──
    if (onProgress) {
      for (let progress = 0; progress <= 100; progress += 20) {
        onProgress(progress);
        await wait(120);
      }
    }

    await wait(WAIT);

    let streamUrl = "";
    let durationFormatted = "0:00";

    if (audioFile) {
      try {
        streamUrl = URL.createObjectURL(audioFile);
        const audio = new Audio(streamUrl);
        await new Promise((resolve) => {
          audio.onloadedmetadata = resolve;
          audio.onerror = resolve; // fallback if error
          // Set a timeout just in case
          setTimeout(resolve, 2000);
        });
        if (audio.duration && audio.duration !== Infinity) {
          const m = Math.floor(audio.duration / 60);
          const s = Math.floor(audio.duration % 60);
          durationFormatted = `${m}:${s.toString().padStart(2, "0")}`;
        }
      } catch (err) {
        console.warn("Failed to read audio file duration", err);
      }
    }

    const authState = useAuthStore.getState();
    const currentUser = authState.user;
    const uploaderName = currentUser?.permalink || currentUser?.username || currentUser?.id || CURRENT_ARTIST;

    const newTrack: Track = {
      id: String(Date.now()),
      title: payload.title,
      artist: uploaderName,
      genre: payload.genre,
      tags: payload.tags,
      description: payload.description,
      releaseDate: payload.releaseDate,
      visibility: payload.visibility,
      status: payload.status || "Processing",
      secretToken:
        payload.visibility === "Private"
          ? Math.random().toString(36).substring(2, 15)
          : undefined,
      audioFileName: payload.fileName,
      artworkUrl:
        payload.artworkUrl ||
        "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=420&h=420&fit=crop",
      waveform: makeWaveform(),
      duration: durationFormatted,
      streamUrl,
      createdAt: new Date().toISOString(),
      labelName: payload.labelName,
      isrc: payload.isrc,
      publisher: payload.publisher,
      buyLink: payload.buyLink,
      allowComments: payload.allowComments ?? true,
    };

    tracks = [newTrack, ...tracks];
    console.log("Track saved (mock):", newTrack);

    if (newTrack.status !== "Finished") {
      setTimeout(() => {
        tracks = tracks.map((track) =>
          track.id === newTrack.id ? { ...track, status: "Finished" } : track,
        );
      }, 2800);
    }

    return newTrack;
  },

  async getTracks(): Promise<Track[]> {
    await wait(WAIT);
    return [...tracks];
  },

  async getTracksByArtist(username: string): Promise<Track[]> {
    // ── Try real API first: fetch tracks for this specific user ──
    try {
      console.log('[tracksRepository] Fetching tracks for user from API:', `/users/${username}/tracks`);
      const response = await apiClient.get(`/users/${username}/tracks`);
      const apiTracks = response.data?.data || response.data?.tracks || response.data || [];
      console.log('[tracksRepository] API returned', Array.isArray(apiTracks) ? apiTracks.length : 0, 'tracks for user:', username);
      
      let realTracks: Track[] = [];
      if (Array.isArray(apiTracks)) {
        // Map API response to our Track interface
        realTracks = apiTracks.map((t: any) => ({
          id: t._id || t.id,
          title: t.title || 'Untitled',
          artist: t.artist?.displayName || t.artist?.username || t.artist || username,
          genre: t.genre || '',
          tags: t.tags || [],
          description: t.description || '',
          releaseDate: t.releaseDate || '',
          visibility: t.isPublic === false ? 'Private' as const : 'Public' as const,
          status: (t.status === 'Finished' ? 'Finished' : 'Processing') as 'Finished' | 'Processing',
          audioFileName: t.audioFileName || t.fileName || '',
          artworkUrl: t.artworkUrl || '',
          waveform: t.waveform || makeWaveform(),
          duration: t.duration || '0:00',
          createdAt: t.createdAt || '',
          streamUrl: t.streamUrl || t.hlsUrl || '',
          hlsUrl: t.hlsUrl || '',
        }));
      }

      // Merge real tracks with mock tracks uploaded in this session to prevent them from disappearing
      const localMockTracks = tracks.filter((track) => track.artist === username || (track.artist === CURRENT_ARTIST && username === "me"));
      const realIds = new Set(realTracks.map(t => t.id));
      const uniqueMockTracks = localMockTracks.filter(t => !realIds.has(t.id));

      return [...uniqueMockTracks, ...realTracks];

    } catch (err) {
      console.warn('[tracksRepository] API fetch for user tracks failed, falling back to mock:', err);
    }

    // ── Mock fallback ──
    await wait(WAIT);
    return tracks.filter((track) => track.artist === username || track.artist === CURRENT_ARTIST && username === "me");
  },

  async getTrackById(id: string): Promise<Track> {
    // ── Try real API first ──
    try {
      console.log('[tracksRepository] Fetching track from API by id/permalink:', id);
      const response = await apiClient.get(`/tracks/${id}`);
      const t = response.data?.data?.track || response.data?.data || response.data;
      if (t) {
        return {
          id: t._id || t.id,
          title: t.title || 'Untitled',
          artist: t.artist?.displayName || t.artist?.permalink || t.artist?.username || t.artist || '',
          genre: t.genre || '',
          tags: t.tags || [],
          description: t.description || '',
          releaseDate: t.releaseDate || '',
          visibility: t.isPublic === false ? 'Private' as const : 'Public' as const,
          status: (t.processingState === 'Finished' || t.status === 'Finished' ? 'Finished' : 'Processing') as 'Finished' | 'Processing',
          audioFileName: t.audioFileName || t.fileName || '',
          artworkUrl: t.artworkUrl || '',
          waveform: t.waveform || makeWaveform(),
          duration: typeof t.duration === 'number' ? `${Math.floor(t.duration / 60)}:${Math.floor(t.duration % 60).toString().padStart(2, "0")}` : t.duration || '0:00',
          createdAt: t.createdAt || '',
          streamUrl: t.hlsUrl || t.streamUrl || '',
          hlsUrl: t.hlsUrl || '',
          playCount: t.playCount || 0,
          likeCount: t.likeCount || 0,
          repostCount: t.repostCount || 0,
          commentCount: t.commentCount || 0,
        };
      }
    } catch (err) {
      console.warn('[tracksRepository] API fetch for track failed, falling back to mock:', err);
    }

    // ── Mock fallback ──
    await wait(WAIT);
    const found = tracks.find((track) => track.id === id || (track as any).permalink === id);
    if (!found) {
      throw new Error("Track not found");
    }
    return found;
  },

  async updateTrack(id: string, updates: UpdateTrackInput): Promise<Track> {
    await wait(WAIT);
    tracks = tracks.map((track) => (track.id === id ? { ...track, ...updates } : track));
    const updated = tracks.find((track) => track.id === id);
    if (!updated) {
      throw new Error("Track not found");
    }
    return updated;
  },

  async deleteTrack(id: string): Promise<{ success: boolean }> {
    await wait(WAIT);
    tracks = tracks.filter((track) => track.id !== id);
    return { success: true };
  },
};
