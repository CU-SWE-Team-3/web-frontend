"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
// @ts-ignore — types exist at regions.d.ts but moduleResolution:'node' can't resolve .esm.js → .d.ts
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js";

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionsTab = "metadata" | "permissions" | "advanced";

export interface UploadOptionsData {
  // Metadata
  containsMusic: string;
  artist: string;
  publisher: string;
  isrc: string;
  composer: string;
  releaseTitle: string;
  buyLinkType: "buy-link" | "storefront";
  buyLink: string;
  albumTitle: string;
  recordLabel: string;
  releaseDate: string;
  barcode: string;
  iswc: string;
  pLine: string;
  explicitContent: string;
  licenseType: "all-rights-reserved" | "creative-commons";
  // Permissions
  allowComments: boolean;
  displayStats: boolean;
  enableDownloads: boolean;
  enableContentId: boolean;
  includeInRss: boolean;
  copyrightConfirmed: boolean;
  // Advanced
  excerptStart: number;
  excerptEnd: number;
}

interface UploadOptionsPanelProps {
  audioFile: File | null;
  artistName?: string;
  onChange?: (data: UploadOptionsData) => void;
}

// ─── Default State ────────────────────────────────────────────────────────────

const defaultOptions: UploadOptionsData = {
  containsMusic: "Yes",
  artist: "",
  publisher: "",
  isrc: "",
  composer: "",
  releaseTitle: "",
  buyLinkType: "buy-link",
  buyLink: "",
  albumTitle: "",
  recordLabel: "",
  releaseDate: "",
  barcode: "",
  iswc: "",
  pLine: "",
  explicitContent: "No",
  licenseType: "all-rights-reserved",
  allowComments: true,
  displayStats: true,
  enableDownloads: false,
  enableContentId: false,
  includeInRss: true,
  copyrightConfirmed: false,
  excerptStart: 0,
  excerptEnd: 20,
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

function InfoTooltip() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#666"
      strokeWidth="2"
      className="inline align-middle ml-1"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
  testId,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
  testId?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer py-3 border-b border-white/5 last:border-b-0">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-testid={testId}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 w-10 h-5 rounded-full shrink-0 transition-colors ${
          checked ? "bg-[#f50]" : "bg-white/20"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <div>
        <span className="text-sm font-medium text-white">{label}</span>
        {description && (
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

// ─── Excerpt Waveform Selector ────────────────────────────────────────────────

function ExcerptSelector({
  audioFile,
  excerptStart,
  excerptEnd,
  onRangeChange,
}: {
  audioFile: File | null;
  excerptStart: number;
  excerptEnd: number;
  onRangeChange: (start: number, end: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<ReturnType<typeof RegionsPlugin.create> | null>(null);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!containerRef.current || !audioFile) return;

    const regions = RegionsPlugin.create();
    regionsRef.current = regions;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#404040",
      progressColor: "#404040",
      cursorColor: "transparent",
      cursorWidth: 0,
      barWidth: 3,
      barRadius: 2,
      barGap: 2,
      height: 80,
      normalize: true,
      interact: false,
      plugins: [regions],
    });

    wsRef.current = ws;

    ws.on("ready", () => {
      const dur = ws.getDuration();
      setDuration(dur);
      setIsReady(true);

      const clipEnd = Math.min(20, dur);

      regions.addRegion({
        start: 0,
        end: clipEnd,
        color: "rgba(255, 85, 0, 0.25)",
        drag: true,
        resize: false,
        id: "excerpt",
      });

      onRangeChange(0, clipEnd);
    });

    regions.on("region-updated", (region: { start: number; end: number }) => {
      onRangeChange(
        Math.max(0, Math.round(region.start * 10) / 10),
        Math.round(region.end * 10) / 10
      );
    });

    const url = URL.createObjectURL(audioFile);
    ws.load(url);

    return () => {
      ws.destroy();
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioFile]);

  if (!audioFile) {
    return (
      <div className="py-8 text-center text-sm text-white/40">
        Upload an audio file first to select a preview clip.
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-white/60 mb-4">
        Drag the highlighted region to select a 20-second preview clip. This will
        be used on your feed and socials.
      </p>

      <div
        data-testid="excerpt-waveform"
        ref={containerRef}
        className="w-full rounded-lg overflow-hidden bg-black/30 border border-white/10 p-2"
      />

      {isReady && (
        <div className="mt-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-white/60">
              Start:{" "}
              <span className="text-[#f50] font-semibold">
                {formatTime(excerptStart)}
              </span>
            </span>
            <span className="text-white/60">
              End:{" "}
              <span className="text-[#f50] font-semibold">
                {formatTime(excerptEnd)}
              </span>
            </span>
          </div>
          <span className="text-white/40">
            Duration: {formatTime(duration)}
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function UploadOptionsPanel({
  audioFile,
  artistName = "",
  onChange,
}: UploadOptionsPanelProps) {
  const [tab, setTab] = useState<OptionsTab>("metadata");
  const [options, setOptions] = useState<UploadOptionsData>({
    ...defaultOptions,
    artist: artistName,
  });

  const update = useCallback(
    (patch: Partial<UploadOptionsData>) => {
      setOptions((prev) => {
        const next = { ...prev, ...patch };
        onChange?.(next);
        return next;
      });
    },
    [onChange]
  );

  const tabs: { key: OptionsTab; label: string; badge?: string }[] = [
    { key: "metadata", label: "Metadata" },
    { key: "permissions", label: "Permissions" },
    { key: "advanced", label: "Advanced", badge: "NEW" },
  ];

  // ─── Shared input styles ──────────────────────────────────────────

  const inputCls =
    "w-full bg-transparent border-none border-b border-white/20 text-white text-sm py-2 px-0 outline-none focus:border-[#f50] transition-colors placeholder:text-white/25";
  const labelCls = "block text-xs font-bold text-white mb-1.5";

  return (
    <div data-testid="upload-options-panel" className="mt-4 border-t border-white/10 pt-4">
      <h3 className="text-sm font-bold text-white mb-4">Options</h3>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-white/10 mb-0">
        {tabs.map((t) => (
          <button
            key={t.key}
            data-testid={`options-tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t.key
                ? "text-white border-[#f50] font-bold"
                : "text-white/40 border-transparent hover:text-white/60"
            } flex items-center gap-1.5`}
          >
            {t.label}
            {t.badge && (
              <span className="text-[9px] font-bold text-white bg-[#f50] px-1.5 py-0.5 rounded uppercase">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Metadata Tab ── */}
      {tab === "metadata" && (
        <div data-testid="options-metadata-tab" className="py-6 space-y-5 animate-in fade-in duration-200">
          {/* Row 1: Contains music, Artist, Publisher */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Contains music</label>
              <select
                data-testid="options-contains-music"
                value={options.containsMusic}
                onChange={(e) => update({ containsMusic: e.target.value })}
                className={`${inputCls} cursor-pointer appearance-none bg-[#1a1a1a] rounded px-3 py-2 border border-white/10`}
                style={{ colorScheme: "dark" }}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Artist</label>
              <input
                data-testid="options-artist"
                type="text"
                value={options.artist}
                onChange={(e) => update({ artist: e.target.value })}
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
            <div>
              <label className={labelCls}>Publisher</label>
              <input
                data-testid="options-publisher"
                type="text"
                value={options.publisher}
                onChange={(e) => update({ publisher: e.target.value })}
                placeholder=""
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
          </div>

          {/* Row 2: ISRC, Composer, Release title */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>
                ISRC <InfoTooltip />
              </label>
              <input
                data-testid="options-isrc"
                type="text"
                value={options.isrc}
                onChange={(e) => update({ isrc: e.target.value })}
                placeholder="e.g. USS1Z1001234"
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
            <div>
              <label className={labelCls}>Composer</label>
              <input
                data-testid="options-composer"
                type="text"
                value={options.composer}
                onChange={(e) => update({ composer: e.target.value })}
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
            <div>
              <label className={labelCls}>Release title</label>
              <input
                data-testid="options-release-title"
                type="text"
                value={options.releaseTitle}
                onChange={(e) => update({ releaseTitle: e.target.value })}
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
          </div>

          {/* Buy-link / Storefront radio */}
          <div className="space-y-2">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  data-testid="options-buy-link-radio-buy"
                  type="radio"
                  name="buyLinkType"
                  checked={options.buyLinkType === "buy-link"}
                  onChange={() => update({ buyLinkType: "buy-link" })}
                  className="accent-[#f50]"
                />
                <span className="text-sm font-semibold text-white">Buy-link</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  data-testid="options-buy-link-radio-storefront"
                  type="radio"
                  name="buyLinkType"
                  checked={options.buyLinkType === "storefront"}
                  onChange={() => update({ buyLinkType: "storefront" })}
                  className="accent-[#f50]"
                />
                <span className="text-sm text-white/50">Artist Storefront</span>
              </label>
            </div>
            <div>
              <label className={labelCls}>Buy-link</label>
              <input
                data-testid="options-buy-link"
                type="url"
                value={options.buyLink}
                onChange={(e) => update({ buyLink: e.target.value })}
                placeholder="https://"
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
          </div>

          {/* Row 3: Album title, Record label, Release date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Album title</label>
              <input
                data-testid="options-album-title"
                type="text"
                value={options.albumTitle}
                onChange={(e) => update({ albumTitle: e.target.value })}
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
            <div>
              <label className={labelCls}>Record label</label>
              <input
                data-testid="options-record-label"
                type="text"
                value={options.recordLabel}
                onChange={(e) => update({ recordLabel: e.target.value })}
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
            <div>
              <label className={labelCls}>Release date</label>
              <input
                data-testid="options-release-date"
                type="date"
                value={options.releaseDate}
                onChange={(e) => update({ releaseDate: e.target.value })}
                placeholder="DD/MM/YYYY"
                className={`${inputCls} [color-scheme:dark]`}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
          </div>

          {/* Row 4: Barcode, ISWC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Barcode</label>
              <input
                data-testid="options-barcode"
                type="text"
                value={options.barcode}
                onChange={(e) => update({ barcode: e.target.value })}
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
            <div>
              <label className={labelCls}>
                ISWC <InfoTooltip />
              </label>
              <input
                data-testid="options-iswc"
                type="text"
                value={options.iswc}
                onChange={(e) => update({ iswc: e.target.value })}
                placeholder="e.g. T-034.524.680-1"
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
          </div>

          {/* Row 5: P line, Explicit content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                P line <InfoTooltip />
              </label>
              <input
                data-testid="options-p-line"
                type="text"
                value={options.pLine}
                onChange={(e) => update({ pLine: e.target.value })}
                placeholder="e.g. 2007 XYZ Record Company Limited"
                className={inputCls}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
              />
            </div>
            <div>
              <label className={labelCls}>Contains explicit content</label>
              <select
                data-testid="options-explicit-content"
                value={options.explicitContent}
                onChange={(e) => update({ explicitContent: e.target.value })}
                className={`${inputCls} cursor-pointer appearance-none bg-[#1a1a1a] rounded px-3 py-2 border border-white/10`}
                style={{ colorScheme: "dark" }}
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* License */}
          <div className="pt-2 space-y-2">
            <label className={labelCls}>
              License <InfoTooltip />
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                data-testid="options-license-all-rights"
                type="radio"
                name="licenseType"
                checked={options.licenseType === "all-rights-reserved"}
                onChange={() => update({ licenseType: "all-rights-reserved" })}
                className="accent-[#f50]"
              />
              <span className="text-sm font-semibold text-white">All Rights Reserved</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                data-testid="options-license-cc"
                type="radio"
                name="licenseType"
                checked={options.licenseType === "creative-commons"}
                onChange={() => update({ licenseType: "creative-commons" })}
                className="accent-[#f50]"
              />
              <span className="text-sm text-white/50">Creative Commons</span>
            </label>
          </div>
        </div>
      )}

      {/* ── Permissions Tab ── */}
      {tab === "permissions" && (
        <div data-testid="options-permissions-tab" className="py-6 space-y-1 animate-in fade-in duration-200">
          <p className="text-sm text-white/50 mb-4">
            Control the visibility of engagements on your track, direct
            downloads, and more.
          </p>

          <Toggle
            checked={options.allowComments}
            onChange={(v) => update({ allowComments: v })}
            label="Allow comments on this track"
            description="Listeners can post timestamped comments."
            testId="options-toggle-comments"
          />
          <Toggle
            checked={options.displayStats}
            onChange={(v) => update({ displayStats: v })}
            label="Display stats publicly"
            description="Show play counts, likes, and reposts on your track."
            testId="options-toggle-stats"
          />
          <Toggle
            checked={options.enableDownloads}
            onChange={(v) => update({ enableDownloads: v })}
            label="Enable direct downloads"
            description="Allow listeners to download the original file."
            testId="options-toggle-downloads"
          />
          <Toggle
            checked={options.enableContentId}
            onChange={(v) => update({ enableContentId: v })}
            label="Enable Content ID"
            description="Protect your track from unauthorized use on other platforms."
            testId="options-toggle-content-id"
          />
          <Toggle
            checked={options.includeInRss}
            onChange={(v) => update({ includeInRss: v })}
            label="Include in RSS feed"
            description="Make this track available via your RSS feed."
            testId="options-toggle-rss"
          />

          <div className="pt-4 border-t border-white/10 mt-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                data-testid="options-copyright-checkbox"
                type="checkbox"
                checked={options.copyrightConfirmed}
                onChange={(e) =>
                  update({ copyrightConfirmed: e.target.checked })
                }
                className="accent-[#f50] mt-1 w-4 h-4 shrink-0"
              />
              <span className="text-xs text-white/50 leading-relaxed">
                I confirm that I own or have the rights to distribute this
                content and that it does not infringe on any third-party
                copyrights, trademarks, or other intellectual property rights.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ── Advanced Tab ── */}
      {tab === "advanced" && (
        <div data-testid="options-advanced-tab" className="py-6 animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-white mb-1">Audio Clip</h4>
          <p className="text-xs text-white/40 mb-5">
            Pick the 20 second clip you&apos;d like to use as your track preview.
            This will live on your feed and socials.
          </p>

          <ExcerptSelector
            audioFile={audioFile}
            excerptStart={options.excerptStart}
            excerptEnd={options.excerptEnd}
            onRangeChange={(start, end) =>
              update({ excerptStart: start, excerptEnd: end })
            }
          />
        </div>
      )}
    </div>
  );
}
