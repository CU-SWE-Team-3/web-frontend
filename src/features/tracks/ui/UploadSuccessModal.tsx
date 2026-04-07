"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants/routes";

interface UploadSuccessModalProps {
  open: boolean;
  onClose: () => void;
  trackTitle: string;
  username: string;
  trackId?: string;
}

// ─── Icon Components ──────────────────────────────────────────────────────────

function BioBeatsIcon() {
  return (
    <div className="w-[72px] h-[72px] rounded-full border-2 border-white/30 flex items-center justify-center bg-black/40">
      <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
        <rect x="0" y="8" width="4" height="12" rx="2" fill="white" />
        <rect x="6" y="4" width="4" height="16" rx="2" fill="white" />
        <rect x="12" y="0" width="4" height="20" rx="2" fill="white" />
        <rect x="18" y="6" width="4" height="14" rx="2" fill="white" />
        <rect x="24" y="2" width="4" height="18" rx="2" fill="white" />
        <rect x="30" y="7" width="4" height="13" rx="2" fill="white" />
      </svg>
    </div>
  );
}

function SpotifyIcon() {
  return (
    <div className="w-[56px] h-[56px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    </div>
  );
}

function AppleMusicIcon() {
  return (
    <div className="w-[56px] h-[56px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043a5.022 5.022 0 00-1.877-.726 10.496 10.496 0 00-1.564-.15c-.04-.003-.083-.01-.124-.013H5.986c-.152.01-.303.017-.455.026-.747.043-1.49.123-2.193.4-1.336.53-2.3 1.452-2.865 2.78-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81a5.046 5.046 0 001.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76.962-1.388 1.14-.35.1-.706.154-1.07.172-.95.046-1.773-.6-1.943-1.536a1.88 1.88 0 011.038-2.022c.323-.16.67-.25 1.018-.324.378-.082.758-.153 1.134-.238.274-.06.467-.22.528-.52.01-.06.018-.12.018-.18V9.547c0-.148-.043-.282-.194-.358a.69.69 0 00-.32-.08c-.28-.003-.56.03-.84.076l-3.92.7c-.076.013-.15.03-.224.05-.168.046-.28.157-.313.332-.01.056-.018.113-.018.17l-.002 6.397v.637c0 .42-.052.835-.232 1.22-.29.622-.78 1.004-1.44 1.18-.35.09-.706.14-1.067.155-.94.035-1.753-.6-1.922-1.53a1.895 1.895 0 011.064-2.05c.314-.15.65-.24.99-.316.407-.093.816-.176 1.22-.28.193-.048.357-.147.456-.33.067-.12.1-.255.1-.393V7.63c0-.36.076-.7.323-.99.2-.24.462-.36.76-.42.252-.05.51-.082.764-.122l3.48-.606c.37-.062.74-.132 1.114-.18.254-.033.51-.04.76.016.47.112.728.462.728.96v3.852z" />
      </svg>
    </div>
  );
}

function YouTubeIcon() {
  return (
    <div className="w-[56px] h-[56px] rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    </div>
  );
}

function DashedLine() {
  return (
    <div className="w-px h-8 border-l-2 border-dashed border-white/20 ml-[35px] md:ml-[35px]" />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UploadSuccessModal({
  open,
  onClose,
  trackTitle,
  username,
  trackId,
}: UploadSuccessModalProps) {
  const router = useRouter();

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleViewTrack = () => {
    onClose();
    const target = trackId ? ROUTES.TRACK(trackId) : ROUTES.PROFILE(username);
    console.log('[UploadSuccessModal] "View Track" navigating to:', target, '| trackId:', trackId);
    router.push(target);
  };

  return (
    <div
      data-testid="upload-success-modal"
      className="fixed inset-0 z-[1000] bg-[#111] overflow-y-auto"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
            <rect x="0" y="6" width="3" height="8" rx="1" fill="#fff" />
            <rect x="5" y="3" width="3" height="11" rx="1" fill="#fff" />
            <rect x="10" y="0" width="3" height="14" rx="1" fill="#fff" />
            <rect x="15" y="4" width="3" height="10" rx="1" fill="#fff" />
            <rect x="20" y="2" width="3" height="12" rx="1" fill="#fff" />
            <rect x="25" y="5" width="3" height="9" rx="1" fill="#fff" />
          </svg>
          <span className="text-xs font-semibold text-white/60">BioBeats</span>
        </div>
        <button
          data-testid="upload-success-close-button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors text-lg"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-6 py-12 md:py-16">
        {/* ── Section 1: Saved to BioBeats ── */}
        <div className="flex gap-6 md:gap-10 items-start">
          {/* Timeline left */}
          <div className="flex flex-col items-center shrink-0">
            <BioBeatsIcon />
            <DashedLine />
          </div>

          {/* Content right */}
          <div className="pt-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              Saved to BioBeats.
            </h1>
            <p className="text-sm text-white/60 mb-1">
              Congratulations! Your tracks are now on BioBeats.
            </p>
            {trackTitle && (
              <p className="text-xs text-white/40 mb-4 truncate max-w-[400px]">
                &quot;{trackTitle}&quot;
              </p>
            )}
            <button
              data-testid="upload-success-view-track-button"
              onClick={handleViewTrack}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-transparent border border-white rounded-full hover:bg-white hover:text-black transition-all"
            >
              View track
            </button>
          </div>
        </div>

        {/* ── Timeline icons ── */}
        <div className="flex flex-col items-start mt-0">
          {/* Spotify */}
          <div className="flex flex-col items-center">
            <DashedLine />
            <SpotifyIcon />
          </div>

          {/* ── Section 2: Distribute ── */}
          <div className="flex gap-6 md:gap-10 items-start mt-0">
            <div className="flex flex-col items-center shrink-0">
              <DashedLine />
              <AppleMusicIcon />
              <DashedLine />
              <YouTubeIcon />
            </div>

            <div className="pt-4 md:pt-6">
              <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3">
                Distribute to more streaming services?
              </h2>
              <p className="text-sm text-white/60 mb-1 max-w-[500px]">
                Easily send your BioBeats tracks to Spotify, Apple Music,
                TikTok, Instagram and more with a Artist Pro subscription.
              </p>
              <a
                href="#"
                className="text-sm text-white/60 underline hover:text-white transition-colors"
              >
                Learn more.
              </a>

              <div className="mt-6">
                <button className="px-6 py-2.5 text-sm font-semibold text-white bg-transparent border border-white rounded-full hover:bg-white hover:text-black transition-all">
                  Unlock with Artist Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-4 px-6">
        <div className="max-w-[800px] mx-auto flex flex-wrap items-center justify-center gap-4 text-xs text-white/30">
          {["Legal", "Privacy", "Cookie Policy", "Cookie Manager", "Imprint", "About us", "Copyright", "Feedback"].map(
            (item) => (
              <a
                key={item}
                href="#"
                className="hover:text-white/60 transition-colors"
              >
                {item}
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
}
