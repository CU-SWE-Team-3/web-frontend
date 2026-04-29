import apiClient from '@/shared/api/client'
import type { FeedTrack, SuggestedArtist, FeedActivity } from '../model/types'

// ─── Mappers ──────────────────────────────────────────────────────────────────

function getImageUrl(value: any): string | undefined {
  if (!value || value === 'undefined' || value === 'null') return undefined
  if (typeof value === 'string') return value
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
  )
}

function mapFeedArtist(a: any) {
  if (typeof a === 'string') {
    return {
      _id: a,
      displayName: a,
      permalink: '',
      avatarUrl: undefined,
    }
  }

  return {
    _id: a?._id || a?.id || '',
    displayName: a?.displayName || a?.username || a?.name || 'Unknown Artist',
    permalink: a?.permalink || a?.username || a?._id || a?.id || '',
    avatarUrl: getImageUrl(a?.avatarUrl || a?.avatar_url || a?.avatar),
  }
}

function mapFeedTrack(raw: any): FeedTrack {
  // The API may return the track nested as target, track, or at the top level.
  const t = raw?.target ?? raw?.track ?? raw
  const duration = Number(t?.duration)

  return {
    _id: t?._id || t?.id || raw?.targetId || '',
    title: t?.title || t?.name || 'Untitled',
    permalink: t?.permalink || t?._id || t?.id || raw?.targetId || '',
    artworkUrl: getImageUrl(t?.artworkUrl || t?.artwork_url || t?.artwork || t?.coverUrl || t?.cover_url || t?.imageUrl || t?.image_url),
    hlsUrl: t?.hlsUrl || t?.hls_url || t?.streamUrl || t?.stream_url || t?.audioUrl || t?.audio_url || undefined,
    waveform: Array.isArray(t?.waveform) ? t.waveform : (Array.isArray(t?.waveformData) ? t.waveformData : undefined),
    duration: Number.isFinite(duration) ? duration : undefined,
    genre: t?.genre || '',
    playCount: t?.playCount ?? t?.play_count ?? 0,
    likeCount: t?.likeCount ?? t?.like_count ?? 0,
    repostCount: t?.repostCount ?? t?.repost_count ?? 0,
    commentCount: t?.commentCount ?? t?.comment_count ?? 0,
    createdAt: t?.createdAt || t?.created_at || raw?.createdAt || raw?.activityDate || '',
    artist: mapFeedArtist(t?.artist || t?.user || t?.owner),
  }
}

function mapFeedActivity(act: any): FeedActivity | null {
  const target = act?.target ?? act?.track
  const targetModel = act?.targetModel ?? act?.target_model ?? (target ? 'Track' : undefined)
  if (!target || String(targetModel).toLowerCase() !== 'track') return null

  const rawActors = Array.isArray(act?.actors)
    ? act.actors
    : [act?.actor || act?.user || act?.reposter].filter(Boolean)

  return {
    activityType: act?.activityType || act?.type || 'REPOST',
    activityDate: act?.activityDate || act?.repostDate || act?.repostedAt || act?.createdAt || '',
    actors: rawActors.map(mapFeedArtist),
    target: mapFeedTrack(target),
    targetModel: 'Track',
  }
}

function mapSuggestedArtist(raw: any): SuggestedArtist {
  return {
    _id: raw._id || raw.id || '',
    displayName: raw.displayName || raw.username || 'Unknown',
    permalink: raw.permalink || raw.username || '',
    avatarUrl: raw.avatarUrl || undefined,
    followerCount: raw.followerCount ?? 0,
    followingCount: raw.followingCount ?? 0,
  }
}

// ─── Repository ───────────────────────────────────────────────────────────────
// UI components never call apiClient directly.
// They call these repository functions, which return typed domain objects.

export const feedRepository = {
  /**
   * GET /feed
   * Returns the personalized chronological activity feed.
   * Activities are grouped by BioBeats (e.g. "User X liked Track Y").
   * For the current UI, we extract the target tracks from these activities.
   */
  async getFeed(): Promise<FeedActivity[]> {
    try {
      const { data } = await apiClient.get('/feed')

      // BioBeats v1.10 returns { status: "success", data: { feed: FeedActivity[] } }
      const rawActivities: any[] =
        data?.data?.feed ??
        data?.data?.activities ??
        data?.feed ??
        data?.activities ??
        (Array.isArray(data?.data) ? data.data : [])

      if (!Array.isArray(rawActivities)) return []

      return rawActivities
        .map(mapFeedActivity)
        .filter((a): a is FeedActivity => a !== null)
    } catch (err) {
      console.warn('[feedRepository] GET /feed failed:', err)
      return []
    }
  },

  /**
   * GET /network/suggested
   * Returns mutual-follow suggestions first, then popular users.
   */
  async getSuggestedArtists(
    page = 1,
    limit = 10,
  ): Promise<SuggestedArtist[]> {
    try {
      const { data } = await apiClient.get('/network/suggested', {
        params: { page, limit },
        withCredentials: true,
      })

      const raw: any[] =
        data?.data ?? data?.users ?? (Array.isArray(data) ? data : [])

      if (!Array.isArray(raw)) return []

      return raw.map(mapSuggestedArtist)
    } catch (err) {
      console.warn('[feedRepository] GET /network/suggested failed:', err)
      return []
    }
  },
}
