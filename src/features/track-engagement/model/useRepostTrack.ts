import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repostTrack } from "../api/engagementApi";
import { USER_REPOSTS_QUERY_KEY } from "./useUserReposts";
import { FEED_QUERY_KEY } from "@/features/feed/model/feedQueries";
import type { FeedActivity, FeedArtist, FeedTrack } from "@/features/feed/model/types";
import { useAuthStore } from "@/features/auth/model/useAuthStore";

type RepostVariables = {
  trackId: string;
  track?: any;
};

function getImageUrl(value: any): string | undefined {
  if (!value || value === "undefined" || value === "null") return undefined;
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
    value.downloadUrl ||
    value.download_url ||
    value.url ||
    value.src ||
    undefined
  );
}

function toFeedArtist(value: any): FeedArtist {
  if (typeof value === "string") {
    return {
      _id: value,
      displayName: value,
      permalink: "",
    };
  }

  return {
    _id: value?._id || value?.id || "",
    displayName: value?.displayName || value?.username || value?.name || "Unknown Artist",
    permalink: value?.permalink || value?.username || value?._id || value?.id || "",
    avatarUrl: getImageUrl(value?.avatarUrl || value?.avatar_url || value?.avatar),
  };
}

function toFeedTrack(trackId: string, rawTrack: any): FeedTrack {
  const artistValue = rawTrack?.artist || rawTrack?.user || rawTrack?.owner;
  const duration = Number(rawTrack?.duration);

  return {
    _id: rawTrack?._id || rawTrack?.id || trackId,
    title: rawTrack?.title || rawTrack?.name || "Untitled",
    permalink: rawTrack?.permalink || rawTrack?._id || rawTrack?.id || trackId,
    artworkUrl: getImageUrl(rawTrack?.artworkUrl || rawTrack?.artwork_url || rawTrack?.artwork || rawTrack?.coverUrl || rawTrack?.cover_url || rawTrack?.imageUrl || rawTrack?.image_url),
    hlsUrl: rawTrack?.hlsUrl || rawTrack?.hls_url || rawTrack?.streamUrl || rawTrack?.stream_url || rawTrack?.audioUrl || rawTrack?.audio_url || undefined,
    waveform: Array.isArray(rawTrack?.waveform)
      ? rawTrack.waveform
      : Array.isArray(rawTrack?.waveformData)
        ? rawTrack.waveformData
        : undefined,
    duration: Number.isFinite(duration) ? duration : undefined,
    genre: rawTrack?.genre || "",
    playCount: rawTrack?.playCount ?? rawTrack?.play_count ?? 0,
    likeCount: rawTrack?.likeCount ?? rawTrack?.like_count ?? 0,
    repostCount: rawTrack?.repostCount ?? rawTrack?.repost_count ?? 0,
    commentCount: rawTrack?.commentCount ?? rawTrack?.comment_count ?? 0,
    createdAt: rawTrack?.createdAt || rawTrack?.created_at || new Date().toISOString(),
    artist: toFeedArtist(artistValue),
  };
}

function sameTrack(left: FeedActivity, trackId: string): boolean {
  return left.target?._id === trackId || left.target?.permalink === trackId;
}

export const useRepostTrack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ trackId, track }: RepostVariables) => {
      await repostTrack(trackId);
      return { trackId, track };
    },
    onSuccess: ({ trackId, track }) => {
      if (!track) return;

      const user = useAuthStore.getState().user;
      const actor = toFeedArtist(user);
      const feedTrack = toFeedTrack(trackId, track);
      const userId = actor._id;

      queryClient.setQueryData<FeedActivity[]>(FEED_QUERY_KEY, (current = []) => {
        const withoutDuplicate = current.filter((activity) => {
          if (activity.activityType !== "REPOST" || !sameTrack(activity, feedTrack._id)) return true;
          if (!userId) return false;
          return !activity.actors.some((item) => item._id === userId);
        });

        return [
          {
            activityType: "REPOST",
            activityDate: new Date().toISOString(),
            actors: [actor],
            target: feedTrack,
            targetModel: "Track",
          },
          ...withoutDuplicate,
        ];
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USER_REPOSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
};
