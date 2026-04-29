import React from "react";
import Link from "next/link";
import { AppButton } from "@/shared/ui";
import { CheckCircle2, Edit2, LinkIcon, Play, Trash2 } from "lucide-react";
import type { Track } from "../model/track";
import WaveformPlayer from "./WaveformPlayer";

interface TrackCardProps {
  track: Track;
  onEdit: (track: Track) => void;
  onDelete: (id: string) => void;
}

const statusClassMap: Record<Track["status"], string> = {
  Processing: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Finished: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

const visibilityClassMap: Record<Track["visibility"], string> = {
  Public: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Private: "bg-neutral-800 text-neutral-400 border-neutral-700",
};

const TrackCard: React.FC<TrackCardProps> = ({ track, onEdit, onDelete }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopySecretLink = () => {
    if (!track.secretToken) return;
    const url = `${window.location.origin}/tracks/${track.id}?secret=${track.secretToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article data-testid={`track-card-${track.id}`} className="rounded-xl border border-white/5 bg-[#181818] shadow-lg hover:shadow-2xl hover:bg-[#202020] transition-all duration-300 overflow-hidden group/card relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover/card:from-orange-500/5 transition-all duration-700 pointer-events-none" />
      <div className="p-5 flex flex-col md:flex-row gap-5 relative z-10">
        {/* Play Button & Art */}
        <div className="shrink-0 relative group w-[140px] h-[140px] rounded-lg overflow-hidden bg-neutral-900 shadow-xl border border-white/10">
          <img
            src={track.artworkUrl}
            alt={track.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
            <AppButton 
              className="h-14 w-14 rounded-full bg-orange-500 text-white grid place-items-center hover:bg-orange-400 hover:scale-110 transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)]"
              onClick={(e) => {
                e.preventDefault();
                // Dynamically load to avoid circular deps with tracks model vs player model
                import('@/features/player/model/playerStore').then(({ usePlayerStore }) => {
                  usePlayerStore.getState().play({
                    id: track.id,
                    title: track.title,
                    artist: track.artist || 'Unknown Artist',
                    artworkUrl: track.artworkUrl || '/placeholder.png',
                    hlsUrl: track.streamUrl || track.hlsUrl,
                  });
                });
              }}
            >
              <Play size={24} fill="currentColor" className="ml-1" />
            </AppButton>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link
                data-testid="track-card-title-link"
                href={`/tracks/${track.id}`}
                className="text-xl font-bold text-white hover:text-orange-500 transition-colors truncate block"
                title={track.title}
              >
                {track.title}
              </Link>
              <p className="mt-1 text-sm font-medium text-neutral-400">
                {track.artist} <span className="mx-2 text-neutral-700">•</span>{" "}
                {track.genre}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                data-testid="track-card-status"
                className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${statusClassMap[track.status]}`}
              >
                {track.status}
              </span>
              <span
                data-testid="track-card-visibility"
                className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${visibilityClassMap[track.visibility]}`}
              >
                {track.visibility}
              </span>
            </div>
          </div>

          {/* Waveform Area */}
          <div className="mt-4 pointer-events-none opacity-80 mix-blend-screen px-1 group-hover/card:opacity-100 transition-opacity duration-500">
            <WaveformPlayer audioUrl={track.streamUrl || track.hlsUrl} waveform={track.waveform} trackMeta={{ id: track.id, title: track.title, artist: track.artist, artworkUrl: track.artworkUrl, hlsUrl: track.streamUrl || track.hlsUrl }} hidePlayButton />
          </div>

          {/* Footer Metadata & Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-4">
            <div className="text-xs text-neutral-500 flex flex-wrap gap-4 font-medium uppercase tracking-wider">
              <span>
                Added:{" "}
                <span className="text-neutral-300">
                  {new Date(track.createdAt).toLocaleDateString()}
                </span>
              </span>
              <span>
                Duration:{" "}
                <span className="text-neutral-300">{track.duration}</span>
              </span>
              {track.tags.length > 0 && (
                <span className="truncate max-w-[200px]">
                  Tags:{" "}
                  <span className="text-neutral-300">
                    {track.tags.join(", ")}
                  </span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              {track.visibility === "Private" && track.secretToken && (
                <AppButton
                  data-testid="track-card-copy-link-btn"
                  type="button"
                  onClick={handleCopySecretLink}
                  className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors border border-white/5 group relative"
                  title="Copy Secret Link"
                >
                  {copied ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <LinkIcon size={14} />
                  )}
                  <span className="hidden sm:inline">
                    {copied ? "Copied!" : "Secret Link"}
                  </span>
                </AppButton>
              )}
              <AppButton
                data-testid="track-card-edit-btn"
                type="button"
                onClick={() => onEdit(track)}
                className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Edit2 size={14} />
                Edit
              </AppButton>
              <AppButton
                data-testid="track-card-delete-btn"
                type="button"
                onClick={() => onDelete(track.id)}
                className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TrackCard;
