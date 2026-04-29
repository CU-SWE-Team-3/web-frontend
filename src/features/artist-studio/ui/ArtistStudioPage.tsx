"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  FileAudio,
  Heart,
  MessageCircle,
  MoreVertical,
  Play,
  Repeat2,
  Search,
  Upload,
} from "lucide-react";
import { NavBar } from "@/shared/ui";
import { ROUTES } from "@/shared/constants/routes";
import {
  useArtistStudio,
  useDownloadStudioTrack,
} from "../model/useArtistStudio";
import type { ArtistStudioTrack } from "../api/artistStudioRepository";
import s from "./ArtistStudioPage.module.scss";

const fallbackArtwork =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=160&h=160&fit=crop";

function formatCount(value?: number) {
  const count = value ?? 0;
  return new Intl.NumberFormat("en", {
    notation: count >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(count);
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(value?: string) {
  return value && value !== "0:00" ? value : "-";
}

function trackUrl(track: ArtistStudioTrack) {
  return `/tracks/${track.permalink || track.id}`;
}

export function ArtistStudioPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "Public" | "Private">(
    "all",
  );
  const studioQuery = useArtistStudio();
  const downloadMutation = useDownloadStudioTrack();

  const summary = studioQuery.data;
  const tracks = summary?.tracks ?? [];

  const filteredTracks = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tracks
      .filter((track) => {
        if (visibilityFilter !== "all" && track.visibility !== visibilityFilter) return false;
        if (!search) return true;

        return [track.title, track.artist, track.genre, track.audioFileName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [query, tracks, visibilityFilter]);

  const handleDownload = async (track: ArtistStudioTrack) => {
    const { blob, filename } = await downloadMutation.mutateAsync(track.id);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || `${track.title}.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  };

  const playTrack = (track: ArtistStudioTrack) => {
    import("@/features/player/model/playerStore").then(({ usePlayerStore }) => {
      usePlayerStore.getState().play({
        id: track.id,
        title: track.title,
        artist: track.artist || "Unknown Artist",
        artworkUrl: track.artworkUrl || fallbackArtwork,
        hlsUrl: track.streamUrl || track.hlsUrl,
      });
    });
  };

  return (
    <div className={s.page} data-testid="artist-studio-page">
      <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />

      <main className={s.shell}>
        <section className={s.uploadUsage} aria-label="Upload usage">
          <div className={s.usageMeter}>
            <Upload size={14} />
            <strong>0% of uploads used</strong>
            <span className={s.meterTrack}>
              <span className={s.meterFill} />
            </span>
            <span>1 of 120 minutes</span>
          </div>
          <button type="button" className={s.membershipButton}>
            Get unlimited uploads
          </button>
        </section>

        <section className={s.hero}>
          <div className={s.heroTitle}>
            <h1>Artist Studio</h1>
            <span>All time stats updated daily.</span>
          </div>

          <div className={s.statsGrid}>
            <div className={s.stat}>
              <strong>{formatCount(summary?.totals.plays)}</strong>
              <span>Plays</span>
            </div>
            <div className={s.stat}>
              <strong>{formatCount(summary?.totals.reposts)}</strong>
              <span>Reposts</span>
            </div>
            <div className={s.stat}>
              <strong>{formatCount(summary?.totals.downloads)}</strong>
              <span>Downloads</span>
            </div>
            <div className={s.stat}>
              <strong>{formatCount(summary?.totals.comments)}</strong>
              <span>Comments</span>
            </div>
          </div>
        </section>

        <nav className={s.tabs} aria-label="Artist Studio sections">
          <button type="button" className={s.activeTab}>
            SoundCloud Tracks
          </button>
          <button type="button">Reposts</button>
          <button type="button">Downloads</button>
          <button type="button">Comments</button>
        </nav>

        <section className={s.toolbar}>
          <button type="button" onClick={() => router.push(ROUTES.UPLOAD)}>
            <Upload size={15} />
            Upload or drop tracks
          </button>
          <button type="button">
            <Repeat2 size={15} />
            Repost insights
          </button>
          <button type="button">
            <Download size={15} />
            Downloads
          </button>
          <button type="button">
            <MessageCircle size={15} />
            Comments
          </button>
        </section>

        <section className={s.controls} aria-label="Track controls">
          <label className={s.search}>
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tracks"
              type="search"
            />
          </label>
          <div className={s.segmented}>
            <button
              type="button"
              className={visibilityFilter === "all" ? s.selected : ""}
              onClick={() => setVisibilityFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={visibilityFilter === "Public" ? s.selected : ""}
              onClick={() => setVisibilityFilter("Public")}
            >
              Public
            </button>
            <button
              type="button"
              className={visibilityFilter === "Private" ? s.selected : ""}
              onClick={() => setVisibilityFilter("Private")}
            >
              Private
            </button>
          </div>
          <span className={s.trackCount}>{formatCount(filteredTracks.length)} tracks</span>
        </section>

        <section className={s.tableWrap}>
          <div className={s.tableHeader}>
            <span>Tracks</span>
            <span>Duration</span>
            <span>Date</span>
            <span>Engagements</span>
            <span>Plays</span>
            <span>Download</span>
            <span />
          </div>

          {studioQuery.isLoading ? (
            <div className={s.empty}>Loading tracks...</div>
          ) : null}

          {!studioQuery.isLoading && filteredTracks.length === 0 ? (
            <div className={s.empty}>
              <FileAudio size={24} />
              <strong>No tracks found</strong>
              <span>Upload a track or adjust your filters.</span>
            </div>
          ) : null}

          {filteredTracks.map((track) => (
            <article key={track.id} className={s.trackRow} data-testid={`artist-track-${track.id}`}>
              <div className={s.trackCell}>
                <button
                  type="button"
                  className={s.playButton}
                  onClick={() => playTrack(track)}
                  aria-label={`Play ${track.title}`}
                >
                  <Play size={14} fill="currentColor" />
                </button>
                <img src={track.artworkUrl || fallbackArtwork} alt="" />
                <div className={s.trackText}>
                  <a href={trackUrl(track)}>{track.title}</a>
                  <span>{track.artist}</span>
                  {track.status === "Failed" ? (
                    <em>This track has been removed for copyright reasons.</em>
                  ) : null}
                </div>
              </div>

              <span>{formatDuration(track.duration)}</span>
              <span>{formatDate(track.createdAt)}</span>
              <div className={s.engagements}>
                <span title="Likes">
                  <Heart size={13} />
                  {formatCount(track.likeCount)}
                </span>
                <span title="Comments">
                  <MessageCircle size={13} />
                  {formatCount(track.commentsTotal)}
                </span>
                <span title="Reposts">
                  <Repeat2 size={13} />
                  {formatCount(track.repostsTotal)}
                </span>
              </div>
              <strong className={s.plays}>{formatCount(track.playCount)}</strong>
              <button
                type="button"
                className={s.downloadButton}
                onClick={() => handleDownload(track)}
                disabled={downloadMutation.isPending || track.status !== "Finished"}
                title={
                  track.status === "Finished"
                    ? "Download original track"
                    : "Track is not ready to download"
                }
              >
                <Download size={14} />
                {formatCount(track.downloadsTotal)}
              </button>
              <button type="button" className={s.moreButton} aria-label={`${track.title} options`}>
                <MoreVertical size={16} />
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
