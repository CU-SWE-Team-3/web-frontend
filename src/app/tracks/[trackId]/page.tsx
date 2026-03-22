"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppButton } from "@/shared/ui";
import { CheckCircle2, LinkIcon } from "lucide-react";
import WaveformPlayer from "@/features/tracks/ui/WaveformPlayer";
import EditTrackModal from "@/features/tracks/ui/EditTrackModal";
import { useTrack, useUpdateTrack } from "@/features/tracks/model/trackQueries";
import type {
  Track,
  UpdateTrackInput,
  UploadTrackInput,
} from "@/features/tracks/model/track";

const TrackDetailPage: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const trackQuery = useTrack(trackId);
  const updateTrackMutation = useUpdateTrack();

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

  const statusClassMap: Record<Track["status"], string> = {
    Processing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    Finished: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  const visibilityClassMap: Record<Track["visibility"], string> = {
    Public: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Private: "bg-neutral-800 text-neutral-400 border-neutral-700",
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Header Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-sc-surface-1 border border-white/5 mb-8">
        <div className="absolute inset-0 z-0">
          <img
            src={track.artworkUrl}
            alt=""
            className="w-full h-full object-cover opacity-20 blur-2xl scale-110 saturate-150"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sc-surface-1 via-sc-surface-1/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-sc-surface-1 via-sc-surface-1/50 to-transparent" />
        </div>

        <div className="relative z-10 grid md:grid-cols-[340px_1fr] gap-6 md:gap-10 p-6 sm:p-8 lg:p-10">
          {/* Cover Art */}
          <div className="shrink-0">
            <div className="relative group w-full aspect-square rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-neutral-900">
              <img
                src={track.artworkUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2 flex-col items-start">
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${statusClassMap[track.status]}`}
                >
                  {track.status}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border backdrop-blur-md ${visibilityClassMap[track.visibility]}`}
                >
                  {track.visibility}
                </span>
              </div>
            </div>
          </div>

          {/* Core Info & Waveform */}
          <div className="flex flex-col justify-between py-2">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Link
                  href="/my-tracks"
                  className="text-xs font-bold tracking-widest text-orange-500 uppercase hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  <span aria-hidden="true">←</span> All Tracks
                </Link>
                <div className="flex gap-3">
                  {track.visibility === "Private" && track.secretToken && (
                    <button
                      onClick={handleCopySecretLink}
                      className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full text-sm font-bold transition-all shadow-lg flex content-center items-center gap-2"
                    >
                      {copiedLink ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <LinkIcon size={16} />
                      )}
                      {copiedLink ? "Copied!" : "Secret Link"}
                    </button>
                  )}
                  {!isEditing && (
                    <AppButton
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2 bg-sc-primary hover:bg-sc-primary-hover text-white border border-sc-primary rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                    >
                      Edit Track
                    </AppButton>
                  )}
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-2 leading-tight drop-shadow-lg">
                {track.title}
              </h1>
              <p className="text-xl text-neutral-300 font-medium tracking-wide">
                {track.artist} <span className="mx-3 text-white/20">•</span>{" "}
                <span className="text-orange-400">{track.genre}</span>
              </p>
            </div>

            <div className="mt-8 mb-4 xl:mb-0">
              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/5 shadow-inner">
                <WaveformPlayer waveform={track.waveform} />
              </div>
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
          <div className="bg-[#1a1a1a] p-3 rounded flex items-center gap-3 border border-[#333] mt-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 shrink-0"></div>
            <input type="text" placeholder="Write a comment" className="flex-1 bg-transparent border-none text-[13px] text-white outline-none placeholder-[#999]" />
            <button className="text-[#999] hover:text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 py-2">
            <button className="px-3 py-1.5 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[#ccc] flex items-center justify-center" aria-label="Share">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            </button>
            <button className="px-3 py-1.5 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[#ccc] flex items-center justify-center" aria-label="Repost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 2l4 4-4 4M7 22l-4-4 4-4M21 6H9a4 4 0 00-4 4M3 18h12a4 4 0 004-4"/></svg>
            </button>
            <button className="px-4 py-1.5 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[12px] text-[#ccc] flex items-center gap-2"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Copy Link</button>
            <button className="px-3 py-1.5 bg-[#151515] border border-[#333] hover:border-[#555] rounded text-[#ccc] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>

          {/* Empty Section */}
          <div className="flex mt-8">
            <div className="w-14 items-center flex flex-col gap-2 shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222]">
                 <img src={track.artworkUrl || "https://placehold.co/100x100"} alt="User" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-bold text-[#ccc] text-center w-full truncate">{track.artist}</span>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-[200px] border-l border-[#222] ml-4 pl-4">
              <h4 className="text-[22px] font-bold text-white mb-2 tracking-tight">Seems a little quiet over here</h4>
              <p className="text-[13px] text-[#999]">Be the first to comment on this track</p>
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
               <div className="h-8 w-[100px] bg-black border border-[#333] rounded flex items-center justify-center text-[10px] text-white">App Store</div>
               <div className="h-8 w-[100px] bg-black border border-[#333] rounded flex items-center justify-center text-[10px] text-white">Google Play</div>
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
    </div>
  );
};

export default TrackDetailPage;
