import { useQuery } from "@tanstack/react-query";
import apiClient from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/useAuthStore";
import { stationsRepository, type HydratedStation } from "@/features/trending/api/stationsRepository";
import { TrackNode, LikedPlaylistItem } from "./types";

export const LIKED_TRACKS_QUERY_KEY = ["liked-tracks"] as const;
export const LIKED_ITEMS_QUERY_KEY = ["liked-items"] as const;

/**
 * Map raw API liked-track response to our TrackNode interface.
 * The backend may return `_id`, nested `artist` objects, etc.
 */
function mapLikedTrack(rawItem: any): TrackNode {
  // Backend YAML: likedTracks is an array of { likeDate, target: TrackSummary, targetModel }
  const t = rawItem.target || rawItem.track || rawItem;

  return {
    id: t._id || t.id,
    title: t.title || t.name || "Untitled",
    artist:
      t.artist?.displayName ||
      t.artist?.username ||
      t.artist?.name ||
      t.artist?.permalink ||
      (typeof t.artist === "string" ? t.artist : "") ||
      "Unknown Artist",
    artworkUrl: t.artworkUrl || t.coverUrl || t.imageUrl || null,
    createdAt: t.createdAt || rawItem.likeDate || "",
    durationFormatted:
      typeof t.duration === "number"
        ? `${Math.floor(t.duration / 60)}:${Math.floor(t.duration % 60)
            .toString()
            .padStart(2, "0")}`
        : t.duration || t.durationFormatted || "0:00",
    playCount: t.playCount ?? 0,
    likeCount: t.likeCount ?? 0,
    repostCount: t.repostCount ?? 0,
    commentCount: t.commentCount ?? 0,
    isLiked: true,
    isReposted: t.isReposted ?? false,
    streamUrl: t.streamUrl || t.hlsUrl || t.audioUrl || "",
    hlsUrl: t.hlsUrl || t.streamUrl || t.audioUrl || "",
    audioFileName: t.audioFileName || "",
    duration: typeof t.duration === "number" ? t.duration : 0,
    permalink: t.permalink || t._id || t.id,
  };
}

function mapLikedPlaylist(rawItem: any): LikedPlaylistItem {
  const p = rawItem.target || rawItem.playlist || rawItem;

  return {
    _id: p._id || p.id,
    title: p.title || p.name || "Untitled Playlist",
    permalink: p.permalink || p._id || p.id,
    creator:
      p.creator?.displayName ||
      p.creator?.username ||
      p.creator?.name ||
      p.creator?.permalink ||
      (typeof p.creator === "string" ? p.creator : "") ||
      "Unknown Creator",
    description: p.description || "",
    releaseType: p.releaseType || "playlist",
    tags: p.tags || [],
    genre: p.genre || "",
    releaseDate: p.releaseDate || "",
    labelName: p.labelName || "",
    buyLink: p.buyLink || "",
    buyTitle: p.buyTitle || "",
    upc: p.upc || "",
    tracks: p.tracks || [],
    artworkUrl: p.artworkUrl || p.coverUrl || p.imageUrl || "",
    isPrivate: p.isPrivate || false,
    secretToken: p.secretToken || "",
    trackCount: p.trackCount || p.tracks?.length || 0,
    totalDuration: p.totalDuration || 0,
    playCount: p.playCount ?? 0,
    likeCount: p.likeCount ?? 0,
    repostCount: p.repostCount ?? 0,
    isLiked: true,
    isReposted: p.isReposted ?? false,
    createdAt: p.createdAt || rawItem.likeDate || "",
    updatedAt: p.updatedAt || "",
  };
}

/**
 * Map a HydratedStation (from /stations/liked) into a LikedPlaylistItem
 * so it can be rendered by PlaylistGridCard.
 */
function mapHydratedStation(station: HydratedStation): LikedPlaylistItem {
  const firstTrack = station.tracks?.[0];
  return {
    _id: station.stationId,
    title: station.stationTitle || "Untitled Station",
    permalink: station.stationId,
    creator: "BioBeats",
    description: station.stationDescription || "",
    releaseType: "playlist",
    tags: [],
    genre: station.genre || "",
    releaseDate: "",
    labelName: "",
    buyLink: "",
    buyTitle: "",
    upc: "",
    tracks: station.tracks || [],
    artworkUrl: firstTrack?.artworkUrl || "",
    isPrivate: false,
    secretToken: "",
    trackCount: station.tracks?.length || 0,
    totalDuration: (station.tracks || []).reduce(
      (sum: number, t: any) => sum + (typeof t?.duration === "number" ? t.duration : 0),
      0
    ),
    playCount: 0,
    likeCount: 0,
    repostCount: 0,
    isLiked: true,
    isReposted: false,
    createdAt: station.likedAt || "",
    updatedAt: "",
    // Custom marker so UI can route to /discover/sets/ instead of /playlist/
    _isStation: true,
    _stationId: station.stationId,
  } as LikedPlaylistItem;
}

/**
 * Fetch the user's liked track and playlist items.
 */
export const useLikedItems = (userId: string = "me") => {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const actualUserId = userId === "me" ? (user?.id || (user as any)?._id || "me") : userId;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(actualUserId);

  return useQuery<{ tracks: TrackNode[]; playlists: LikedPlaylistItem[] }, Error>({
    queryKey: [...LIKED_ITEMS_QUERY_KEY, actualUserId],
    queryFn: async () => {
      let resolvedId = actualUserId;

      if (!isObjectId && actualUserId !== "me") {
        try {
          const profileRes = await apiClient.get(`/profile/${actualUserId}`, {
            withCredentials: true,
          });
          const profileData = profileRes.data?.data?.user || profileRes.data?.data;
          if (profileData?._id || profileData?.id) {
            resolvedId = profileData._id || profileData.id;
          }
        } catch (profileErr) {
          console.warn("[useLikedItems] Could not resolve permalink to ID:", profileErr);
        }
      }

      try {
        const [likesResult, stationsResult] = await Promise.allSettled([
          apiClient.get(`/profile/${resolvedId}/likes`, { withCredentials: true }),
          stationsRepository.getLikedStations(true),
        ]);

        const tracks: TrackNode[] = [];
        const playlists: LikedPlaylistItem[] = [];

        // ── Process profile likes (tracks + playlists) ──
        if (likesResult.status === 'fulfilled') {
          const data = likesResult.value.data;
          const rawLikes =
            data?.data?.likes ||
            data?.data?.likedTracks ||
            data?.data ||
            data?.likes ||
            data ||
            [];

          if (Array.isArray(rawLikes)) {
            for (const item of rawLikes) {
              if ((item?.targetModel || item?.model) === 'Playlist') {
                playlists.push(mapLikedPlaylist(item));
              } else {
                tracks.push(mapLikedTrack(item));
              }
            }
          }
        } else {
          console.warn("[useLikedItems] Failed to fetch profile likes:", likesResult.reason);
        }

        // ── Process liked stations ──
        if (stationsResult.status === 'fulfilled') {
          const stations = stationsResult.value;
          if (Array.isArray(stations)) {
            for (const station of stations) {
              playlists.push(mapHydratedStation(station));
            }
          }
        } else {
          console.warn("[useLikedItems] Failed to fetch liked stations:", stationsResult.reason);
        }

        return { tracks, playlists };
      } catch (likesErr) {
        console.warn("[useLikedItems] Failed to fetch likes for", resolvedId, likesErr);
        return { tracks: [], playlists: [] };
      }
    },
    enabled: isInitialized && isAuthenticated && !!actualUserId && actualUserId !== "",
    staleTime: 0,
    refetchOnMount: "always" as const,
  });
};

/**
 * Fetch the user's liked track list. (Backward compatibility)
 */
export const useLikedTracks = (userId: string = "me") => {
  const query = useLikedItems(userId);
  return {
    ...query,
    data: query.data?.tracks,
  };
};
