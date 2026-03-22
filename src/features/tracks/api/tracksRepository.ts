import apiClient from "@/shared/api/client";
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
        const formData = new FormData();
        formData.append("audioFile", audioFile);
        formData.append("title", payload.title);
        formData.append("genre", payload.genre || "");
        formData.append("tags", (payload.tags || []).join(","));
        formData.append("description", payload.description || "");
        formData.append("visibility", payload.visibility || "Public");
        if (payload.artworkUrl) formData.append("artworkUrl", payload.artworkUrl);

        const response = await apiClient.post("/tracks/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(percent);
            }
          },
        });

        const track = response.data?.data || response.data;
        return {
          id: track._id || track.id || String(Date.now()),
          title: track.title || payload.title,
          artist: track.artist?.displayName || track.artist || CURRENT_ARTIST,
          genre: track.genre || payload.genre,
          tags: track.tags || payload.tags,
          description: track.description || payload.description,
          releaseDate: track.releaseDate || payload.releaseDate || "",
          visibility: track.visibility || payload.visibility,
          status: track.status || "Processing",
          audioFileName: track.audioFileName || payload.fileName,
          artworkUrl: track.artworkUrl || payload.artworkUrl || "",
          waveform: track.waveform || makeWaveform(),
          duration: track.duration || "0:00",
          createdAt: track.createdAt || new Date().toISOString(),
        };
      } catch (err) {
        console.warn("Real API upload failed, falling back to mock:", err);
      }
    }

    // ── Mock fallback ──
    if (onProgress) {
      for (let progress = 0; progress <= 100; progress += 20) {
        onProgress(progress);
        // eslint-disable-next-line no-await-in-loop
        await wait(120);
      }
    }

    await wait(WAIT);

    const newTrack: Track = {
      id: String(Date.now()),
      title: payload.title,
      artist: CURRENT_ARTIST,
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
      duration: "3:20",
      createdAt: new Date().toISOString(),
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
    await wait(WAIT);
    return tracks.filter((track) => track.artist === username || track.artist === CURRENT_ARTIST);
  },

  async getTrackById(id: string): Promise<Track> {
    await wait(WAIT);
    const found = tracks.find((track) => track.id === id);
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
