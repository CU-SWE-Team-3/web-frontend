"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppButton, NavBar } from "@/shared/ui";
import { ROUTES } from "@/shared/constants/routes";
import { CheckCircle2, LinkIcon } from "lucide-react";
import WaveformPlayer from "@/features/tracks/ui/WaveformPlayer";
import EditTrackModal from "@/features/tracks/ui/EditTrackModal";
import { AddToPlaylistModal } from "@/features/playlists/ui/AddToPlaylistModal";
import { usePlayerStore } from "@/features/player/model/playerStore";
import { useTrack, useUpdateTrack } from "@/features/tracks/model/trackQueries";
import type {
  Track,
  UpdateTrackInput,
  UploadTrackInput,
} from "@/features/tracks/model/track";
import { useTrackComments } from "@/features/comments/model/useTrackComments";
import { CommentInput } from "@/features/comments/ui/CommentInput";

import { useLikedTracks } from "@/features/track-engagement/model/useLikedTracks";
import { useLikeTrack } from "@/features/track-engagement/model/useLikeTrack";
import { useUnlikeTrack } from "@/features/track-engagement/model/useUnlikeTrack";
import { useRepostTrack } from "@/features/track-engagement/model/useRepostTrack";
import { useUnrepostTrack } from "@/features/track-engagement/model/useUnrepostTrack";
import { EngagementListModal } from "@/features/track-engagement/ui/EngagementListModal";

const TrackDetailPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addToPlaylistOpen, setAddToPlaylistOpen] = useState(false);
  
  const trackQuery = useTrack(trackId);
  const updateTrackMutation = useUpdateTrack();
  const { data: comments = [] } = useTrackComments(trackId);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [commentSort, setCommentSort] = useState<'Newest' | 'Oldest' | 'Top'>('Newest');
  const isCurrentTrackPlaying = usePlayerStore(state => state.currentTrack?.id === trackId && state.isPlaying);

  // Engagement State
  const { data: likedTracks } = useLikedTracks();
  // Assume useUserReposts exists, but since we don't have it explicitly imported here, we might just rely on checking if it was toggled locally.
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();
  const repostMutation = useRepostTrack();
  const unrepostMutation = useUnrepostTrack();

  const [localLikeCount, setLocalLikeCount] = useState<number | null>(null);
  const [localRepostCount, setLocalRepostCount] = useState<number | null>(null);
  const [localIsLiked, setLocalIsLiked] = useState<boolean | null>(null);
  const [localIsReposted, setLocalIsReposted] = useState<boolean | null>(null); // defaults to false if not provided by track
  const [engagementModal, setEngagementModal] = useState<{ isOpen: boolean; type: 'likes' | 'reposts' }>({ isOpen: false, type: 'likes' });

  React.useEffect(() => {
    if (trackQuery.data) {
      if (localLikeCount === null) setLocalLikeCount(Number(trackQuery.data.likeCount) || 0);
      if (localRepostCount === null) setLocalRepostCount(Number(trackQuery.data.repostCount) || 0);
      // We don't have isReposted in track yet, assume false unless set
      if (localIsReposted === null) setLocalIsReposted(false);
    }
  }, [trackQuery.data]);

  React.useEffect(() => {
    if (trackQuery.data && Array.isArray(likedTracks) && localIsLiked === null) {
      setLocalIsLiked(likedTracks.some(t => t.id === trackQuery.data?.id));
    }
  }, [trackQuery.data, likedTracks]);

  const track = trackQuery.data ?? null;
  const loading = trackQuery.isLoading;

  const handleEditSubmit = async (
    payload: UploadTrackInput | Partial<UploadTrackInput>,
  ) => {
    if (!track) return;

    await updateTrackMutation.mutateAsync({
      id: track.id,
      updates: payload as UpdateTrackInput,
    });
    setIsEditing(false);
  };

  const handleCopySecretLink = () => {
    if (!track?.secretToken) return;
    const url = `${window.location.origin}/tracks/${track.id}?secret=${track.secretToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
          <p className="text-neutral-400 text-sm font-medium tracking-wide animate-pulse">
            LOADING TRACK...
          </p>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center mt-20">
        <h2 className="text-3xl font-black text-white tracking-tight">
          Track not found
        </h2>
        <p className="text-neutral-500 mt-2 mb-8">
          The track you're looking for doesn't exist or is private.
        </p>
        <Link
          href="/my-tracks"
          className="inline-flex items-center justify-center px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full text-sm font-bold text-white transition-all duration-300 backdrop-blur-sm border border-white/5 shadow-lg"
        >
          Return to My Tracks
        </Link>
      </div>
    );
  }

  // BUILD_BREAK: Ensuring latest changes are picked up
  const statusClassMap: Record<Track["status"], string> = {
    Processing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Finished: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    Failed: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const visibilityClassMap: Record<Track["visibility"], string> = {
    Public: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Private: "bg-neutral-800 text-neutral-400 border-neutral-700",
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />
      
      {/* Remove previous gap & set to SoundCloud body background #f2f2f2 */}
      <div className="bg-[#111] flex-1 pb-12">
        <div data-testid="track-page" className="max-w-[1240px] mx-auto pt-6 px-4">
          {/* Hero Header Section */}
          <div className="relative mb-6 w-full" style={{ background: 'linear-gradient(135deg, #e4e4e4 0%, #b5b5b5 100%)' }}>
            <div className="flex flex-col md:flex-row md:h-[380px]">
            {/* Left Content Area (Info + Waveform) */}
            <div className="flex flex-col justify-between flex-1 p-4 md:p-6 z-10 relative min-h-[200px]">
              {/* Top Row: Play button & Information */}
              <div className="flex flex-wrap justify-between w-full gap-2">
                <div className="flex items-start gap-4">
                  {/* Play Button */}
                  <button 
                    onClick={() => {
                      const playerStore = usePlayerStore.getState();
                      if (playerStore.currentTrack?.id === track.id) {
                        playerStore.isPlaying ? playerStore.pause() : playerStore.play(undefined, 'inline');
                        window.dispatchEvent(new CustomEvent('playerbar-playpause'));
                      } else {
                        // Map local track model to player store track model
                        playerStore.play({
                          id: track.id,
                          title: track.title,
                          artist: track.artist,
                          artworkUrl: track.artworkUrl,
                          duration: typeof track.duration === 'string'
                            ? track.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0)
                            : track.duration,
                          hlsUrl: track.hlsUrl,
                          streamUrl: track.streamUrl,
                          genre: track.genre,
                        }, 'inline');
                        setTimeout(() => window.dispatchEvent(new CustomEvent('playerbar-playpause')), 50);
                      }
                    }}
                    className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] rounded-full bg-[#ff5500] flex items-center justify-center shrink-0 shadow-lg hover:scale-105 transition-transform mt-1"
                  >
                     {isCurrentTrackPlaying ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-0"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                     ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
                     )}
                  </button>
                  
                  {/* Text Info */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="bg-black/80 px-2 py-1 text-[16px] md:text-[22px] font-black tracking-tight text-white inline-flex">
                      {track.title}
                    </div>
                    <div className="bg-black/80 px-2 py-1 text-[12px] md:text-[13px] text-[#ccc] inline-flex">
                      {track.artist}
                    </div>
                  </div>
                </div>

                {/* Right Top Info */}
                <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:pr-6">
                  <span className="text-[11px] text-black/60 font-medium">1 month ago</span>
                  <span className="px-2 py-1 bg-black/40 rounded-full text-[11px] md:text-[12px] text-white font-bold backdrop-blur-md">
                    # {track.genre || "Music"}
                  </span>
                  <span className="px-2 py-1 bg-black/40 rounded-full text-[11px] md:text-[12px] text-white font-bold backdrop-blur-md">
                    {track.duration}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Waveform */}
              <div className="w-full mt-4 md:mt-auto md:mr-[20px]" data-testid="track-waveform">
                <WaveformPlayer 
                  waveform={track.waveform} 
                  onTimeUpdate={setCurrentPlaybackTime}
                  audioUrl={track.streamUrl || track.hlsUrl}
                  durationSeconds={typeof track.duration === 'string' ? track.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0) : track.duration}
                  comments={comments.map(c => ({
                    id: c.id,
                    timestampSeconds: c.timestampSeconds,
                    text: c.text,
                    username: c.displayName || c.username,
                    avatarUrl: c.avatarUrl,
                  }))}
                  trackMeta={{
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    artworkUrl: track.artworkUrl,
                    hlsUrl: track.hlsUrl,
                  }}
                  hidePlayButton
                />
              </div>
            </div>

            {/* Right Content Area: Artwork */}
            <div className="w-full md:w-[340px] md:h-[340px] aspect-square md:aspect-auto shrink-0 md:m-5 relative z-20 bg-white" style={{ maxWidth: '100%' }}>
              <img
                data-testid="track-artwork"
                src={track.artworkUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-1 flex-col items-start z-10">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border backdrop-blur-md ${statusClassMap[track.status]}`}>
                  {track.status}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border backdrop-blur-md ${visibilityClassMap[track.visibility]}`}>
                  {track.visibility}
                </span>
              </div>
            </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 mt-6">
        {/* Left Column: Banners & Comments */}
        <div className="space-y-4">
          {/* Analyzing Banner */}
          <div className="bg-[#242424] p-5 rounded flex justify-between items-center border border-[#333]">
            <div className="max-w-[80%]">
              <h3 className="text-[15px] font-bold text-white mb-2">We're analyzing your track for recommendation</h3>
              <p className="text-[13px] text-[#ccc] leading-snug">We're making sure this track is eligible to be recommended to the right audience. Analysis takes between 30 minutes and 2 hours, check back soon to see if your track is eligible.</p>
              <button className="text-[12px] text-[#ccc] mt-4 hover:text-white flex items-center gap-1">See how it works <span className="text-[10px]">›</span></button>
            </div>
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
          </div>

          {/* Showcase Banner */}
          <div className="bg-[#1a1a1a] p-4 rounded flex justify-between items-center border border-[#333] relative">
            <button className="absolute top-2 right-2 text-[#666] hover:text-white text-xs">✕</button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-lg border border-[#333] flex items-center justify-center">
                <span className="text-xl">💿</span>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">Showcase your products</h3>
                <p className="text-[13px] text-[#999]">Link merch, event tickets, music and more to your track page</p>
              </div>
            </div>
            <button className="px-4 py-1.5 bg-white text-black text-[11px] font-bold rounded-full uppercase tracking-wider hover:bg-gray-200 transition-colors">Get Started</button>
          </div>

          {/* Comment Input */}
          {track.allowComments !== false ? (
            <div className="mt-6">
              <CommentInput
                trackId={trackId}
                currentTime={currentPlaybackTime}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 bg-[#222] border border-white/10 rounded-lg p-3 mt-4 shadow-sm text-neutral-500 text-sm italic">
              Comments have been disabled for this track.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 py-2">
            <button 
              data-testid="track-like-button" 
              onClick={() => {
                if (localIsLiked) {
                  setLocalIsLiked(false);
                  setLocalLikeCount((c) => (c || 0) - 1);
                  unlikeMutation.mutate(track.id);
                } else {
                  setLocalIsLiked(true);
                  setLocalLikeCount((c) => (c || 0) + 1);
                  likeMutation.mutate(track.id);
                }
              }}
              className={`px-3 py-1.5 bg-[#151515] border rounded flex items-center justify-center gap-2 transition-colors ${localIsLiked ? 'border-[#ff5500] text-[#ff5500]' : 'border-[#333] hover:border-[#555] text-[#ccc]'}`} 
              aria-label="Like"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={localIsLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={localIsLiked ? '0' : '2'}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            {localLikeCount !== null && localLikeCount > 0 && (
              <button onClick={() => setEngagementModal({ isOpen: true, type: 'likes' })} className="text-[12px] font-medium text-[#ccc] hover:text-white px-1">
                {localLikeCount} {localLikeCount === 1 ? 'like' : 'likes'}
              </button>
            )}

            <button 
              data-testid="track-repost-button" 
              onClick={() => {
                if (localIsReposted) {
                  setLocalIsReposted(false);
                  setLocalRepostCount((c) => (c || 0) - 1);
                  unrepostMutation.mutate(track.id);
                } else {
                  setLocalIsReposted(true);
                  setLocalRepostCount((c) => (c || 0) + 1);
                  repostMutation.mutate({ trackId: track.id });
                }
              }}
              className={`px-3 py-1.5 ml-2 bg-[#151515] border rounded flex items-center justify-center gap-2 transition-colors ${localIsReposted ? 'border-[#ff5500] text-[#ff5500]' : 'border-[#333] hover:border-[#555] text-[#ccc]'}`} 
              aria-label="Repost"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 00-4 4M3 18h12a4 4 0 004-4"/></svg>
            </button>
            {localRepostCount !== null && localRepostCount > 0 && (
              <button onClick={() => setEngagementModal({ isOpen: true, type: 'reposts' })} className="text-[12px] font-medium text-[#ccc] hover:text-white px-1">
                {localRepostCount} {localRepostCount === 1 ? 'repost' : 'reposts'}
              </button>
            )}
            
            <button data-testid="track-share-button" className="px-3 py-1.5 ml-2 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[#ccc] flex items-center justify-center gap-2" aria-label="Share">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> Share
            </button>
            <button 
              onClick={() => setAddToPlaylistOpen(true)}
              className="px-3 py-1.5 ml-2 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[#ccc] flex items-center justify-center gap-2" 
              aria-label="Add to Playlist"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg> Add to Playlist
            </button>
            <button className="px-4 py-1.5 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[12px] text-[#ccc] flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Copy Link</button>
            <button data-testid="track-more-button" className="px-3 py-1.5 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[#ccc] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>

          {/* ── Comments Section (SoundCloud style) ── */}
          <div data-testid="track-comments-list" className="flex mt-8">
            {/* Left: Artist avatar + name */}
            <div className="w-14 items-center flex flex-col gap-2 shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222]">
                 <img src={track.artworkUrl || "https://placehold.co/100x100"} alt="User" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-bold text-[#ccc] text-center w-full truncate">{track.artist}</span>
            </div>
            
            {/* Right: Comment list or empty state */}
            <div className="flex-1 border-l border-[#222] ml-4 pl-4">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                  <h4 className="text-[22px] font-bold text-white mb-2 tracking-tight">Seems a little quiet over here</h4>
                  <p className="text-[13px] text-[#999]">Be the first to comment on this track</p>
                </div>
              ) : (
                <>
                  {/* Comment count + sort */}
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[15px] font-bold text-white">
                      {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#999]">Sorted by:</span>
                      <select
                        value={commentSort}
                        onChange={(e) => setCommentSort(e.target.value as any)}
                        className="bg-[#111] border border-[#333] text-[#fff] text-[12px] rounded px-2 py-1 outline-none cursor-pointer"
                      >
                        <option value="Newest">Newest</option>
                        <option value="Oldest">Oldest</option>
                        <option value="Top">Top</option>
                      </select>
                    </div>
                  </div>

                  {/* Comment items */}
                  <div className="flex flex-col gap-0">
                    {(Array.isArray(comments) ? comments : [])
                      .sort((a, b) => {
                        if (commentSort === 'Oldest') return a.timestampSeconds - b.timestampSeconds;
                        if (commentSort === 'Top') return 0; // Keep original order for Top
                        // Newest: by createdAt descending
                        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                      })
                      .map((comment) => {
                        const tsMin = Math.floor(comment.timestampSeconds / 60);
                        const tsSec = Math.floor(comment.timestampSeconds % 60);
                        const formattedTs = `${tsMin}:${tsSec.toString().padStart(2, '0')}`;
                        // Relative time
                        const now = Date.now();
                        const created = comment.createdAt ? new Date(comment.createdAt).getTime() : now;
                        const diffMs = now - created;
                        const diffMins = Math.floor(diffMs / 60000);
                        const diffHours = Math.floor(diffMs / 3600000);
                        const diffDays = Math.floor(diffMs / 86400000);
                        let relTime = 'just now';
                        if (diffDays > 0) relTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                        else if (diffHours > 0) relTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                        else if (diffMins > 0) relTime = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

                        return (
                          <div key={comment.id} className="flex gap-3 py-3 border-b border-[#1a1a1a] group">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#333] shrink-0">
                              {comment.avatarUrl ? (
                                <img src={comment.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-purple-500" />
                              )}
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 text-[12px] text-[#999]">
                                <span className="font-bold text-[#ccc] hover:text-white cursor-pointer">
                                  {comment.displayName || comment.username}
                                </span>
                                <span>at</span>
                                <span className="text-[#ff5500] font-semibold cursor-pointer hover:underline">{formattedTs}</span>
                                <span className="mx-1">-</span>
                                <span>{relTime}</span>
                              </div>
                              <p className="text-[13px] text-[#eee] mt-1 leading-snug">{comment.text}</p>
                              <button className="text-[11px] text-[#999] hover:text-white mt-1 font-medium">Reply</button>
                            </div>
                            {/* Like */}
                            <div className="flex items-start pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="flex items-center gap-1 text-[#999] hover:text-[#ff5500]">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                <span className="text-[11px]">0</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Fame */}
        <div className="space-y-6">
          {/* Ad Placeholder */}
          <div className="bg-[#1a1a1a] p-4 rounded border border-[#333] relative">
            <button className="absolute top-2 right-2 text-[#666] hover:text-white text-xs">✕</button>
            <div className="flex gap-4">
              <div className="flex-1">
                <h3 className="text-[13px] font-bold text-white mb-1">Make your record</h3>
                <p className="text-[11px] text-[#999] leading-tight mb-3">Release this track on vinyl, on-demand, with no upfront cost.</p>
                <button className="px-3 py-1 bg-white text-black text-[11px] font-bold rounded-full">Try it out</button>
              </div>
              <div className="w-16 h-16 bg-[#222] rounded flex items-center justify-center">
                <span className="text-2xl">💿</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[12px] font-bold text-[#999] tracking-wider flex items-center gap-1">INSIGHTS <span>ⓘ</span></h3>
              <span className="text-[11px] text-[#666]">Only visible to you</span>
            </div>
            <div className="bg-[#1a1a1a] p-4 rounded border border-[#333] text-center">
              <div className="mb-2 text-[#666]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></div>
              <p className="text-[12px] text-white font-bold mb-1">We're working on your insights.</p>
              <p className="text-[11px] text-[#999] mb-4">Check back tomorrow.</p>
              <button className="w-full py-1.5 border border-[#444] rounded text-[12px] font-bold text-white hover:border-[#666] transition-colors">View track insights</button>
            </div>
          </div>

          {/* Fame */}
          <div>
            <h3 className="text-[12px] font-bold text-[#999] tracking-wider mb-2 flex items-center gap-1">FAME <span>ⓘ</span></h3>
            <div className="text-[11px] text-[#999] uppercase tracking-wider mb-3">FANS WHO PLAYED THIS TRACK IN THE PAST 7 DAYS</div>
            <div className="text-[13px] text-[#999] italic border-t border-[#222] pt-3">
              No fans yet...
            </div>
          </div>

          {/* Related Tracks */}
          <div>
            <div className="flex justify-between items-center border-b border-[#222] pb-2 mb-3">
              <h3 className="text-[12px] font-bold text-[#999] tracking-wider">RELATED TRACKS</h3>
              <button className="text-[11px] text-[#999] hover:text-white">View all</button>
            </div>
            {/* Example Related Track Card */}
            <div className="flex gap-3 mb-3 group cursor-pointer">
               <div className="w-12 h-12 bg-[#222] rounded flex-shrink-0 bg-gradient-to-br from-green-500 to-blue-500"></div>
               <div className="min-w-0 flex-1">
                 <div className="text-[11px] text-[#999] truncate">Travis Scott</div>
                 <div className="text-[13px] text-white font-bold truncate group-hover:text-[#3bc96b]">Green & Purple (Playboi Carti)</div>
                 <div className="text-[11px] text-[#666] flex items-center gap-2 mt-0.5">
                   <span className="flex items-center gap-1">▶ 87M</span>
                   <span className="flex items-center gap-1">♥ 1.04M</span>
                   <span>🔁 69.5K</span>
                   <span>💬 2,222</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Go Mobile & Legal */}
          <div className="pt-4 border-t border-[#222]">
             <h3 className="text-[12px] font-bold text-[#999] tracking-wider mb-3">GO MOBILE</h3>
             <div className="flex gap-2 mb-4">
               <a href="#" className="inline-block hover:opacity-80 transition-opacity">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-[34px]" />
               </a>
               <a href="#" className="inline-block hover:opacity-80 transition-opacity">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-[34px]" />
               </a>
             </div>
             <p className="text-[10px] text-[#666] leading-relaxed">
               Legal ⁃ Privacy ⁃ Cookie Policy ⁃ Cookie Manager ⁃ Imprint ⁃ Artist Resources ⁃ Newsroom ⁃ Charts ⁃ Transparency Reports
             </p>
             <p className="text-[10px] text-blue-500 mt-2 hover:underline cursor-pointer">Language: English (US)</p>
          </div>
        </div>
      </div>

        <EditTrackModal
          track={track}
          open={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleEditSubmit}
          isSaving={updateTrackMutation.isPending}
        />
        <EngagementListModal
          isOpen={engagementModal.isOpen}
          onClose={() => setEngagementModal({ ...engagementModal, isOpen: false })}
          trackId={track.id}
          type={engagementModal.type}
        />
        <AddToPlaylistModal
          open={addToPlaylistOpen}
          onClose={() => setAddToPlaylistOpen(false)}
          trackId={track.id}
          trackTitle={track.title}
        />
      </div>
    </div>
  </div>
  );
};

export default TrackDetailPage;
