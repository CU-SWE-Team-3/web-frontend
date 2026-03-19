"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppButton } from "@/shared/ui";
import { CheckCircle2, LinkIcon } from "lucide-react";
import WaveformPlayer from "@/features/tracks/ui/WaveformPlayer";
import TrackForm from "@/features/tracks/ui/TrackForm";
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

      {/* Details / Edit Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isEditing ? (
            <div className="bg-sc-surface-1 p-6 rounded-2xl border border-white/5 shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h2 className="text-xl font-bold text-white">Edit Metadata</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-bold tracking-wide text-neutral-500 hover:text-white transition-colors uppercase"
                >
                  Cancel
                </button>
              </div>
              <TrackForm
                mode="edit"
                initialValues={track}
                onSubmit={handleEditSubmit}
                isSubmitting={updateTrackMutation.isPending}
              />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-sc-surface-2 p-8 rounded-2xl border border-white/5 shadow-xl">
                <h3 className="text-sm font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Description
                </h3>
                <p className="text-neutral-300 text-base leading-relaxed whitespace-pre-wrap">
                  {track.description || (
                    <span className="italic text-neutral-600">
                      No description provided for this track.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-6 bg-sc-surface-2 p-6 rounded-2xl border border-white/5 shadow-xl">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 border-2 border-[#151515] flex items-center justify-center text-white font-bold text-sm">
                    UP
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500 border-2 border-[#151515] flex items-center justify-center text-white font-bold text-sm">
                    FA
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-800 border-2 border-[#151515] flex items-center justify-center text-neutral-400 text-xs">
                    +12
                  </div>
                </div>
                <div className="text-sm font-medium text-neutral-400">
                  <strong className="text-white">14 fans</strong> have liked
                  this track
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-sc-surface-2 p-6 rounded-2xl border border-white/5 shadow-xl">
            <h3 className="text-xs font-black text-neutral-500 mb-4 uppercase tracking-widest border-b border-white/5 pb-2">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {track.tags.length > 0 ? (
                track.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/search?q=${tag}`}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs rounded-lg font-semibold transition-colors border border-white/5"
                  >
                    #{tag}
                  </Link>
                ))
              ) : (
                <span className="text-neutral-600 text-sm italic">
                  No tags added
                </span>
              )}
            </div>
          </div>

          <div className="bg-sc-surface-2 p-6 rounded-2xl border border-white/5 shadow-xl space-y-4">
            <h3 className="text-xs font-black text-neutral-500 mb-2 uppercase tracking-widest border-b border-white/5 pb-2">
              Track Info
            </h3>

            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-neutral-500 font-medium">
                Released
              </span>
              <span className="text-sm text-white font-semibold">
                {track.releaseDate
                  ? new Date(track.releaseDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-neutral-500 font-medium">
                Duration
              </span>
              <span className="text-sm text-white font-semibold">
                {track.duration}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-sm text-neutral-500 font-medium">
                Filename
              </span>
              <span
                className="text-xs text-neutral-400 font-mono bg-black/40 px-2 py-1 rounded border border-white/5 max-w-[150px] truncate"
                title={track.audioFileName}
              >
                {track.audioFileName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackDetailPage;
