"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "../../shared/ui/NavBar/NavBar";
import { SearchBar } from "../../shared/ui/SearchBar/SearchBar";
import { ROUTES } from "../../shared/constants/routes";
import { useAuthStore } from "../../features/auth/model/useAuthStore";
import apiClient from "../../shared/api/client";
import { useUploadTrack } from "../../features/tracks/model/trackQueries";
import UploadSuccessModal from "../../features/tracks/ui/UploadSuccessModal";
import UploadOptionsPanel from "../../features/tracks/ui/UploadOptionsPanel";
import type { UploadOptionsData } from "../../features/tracks/ui/UploadOptionsPanel";

// ─── Constants ──────────────────────────────────────────────────────────────
const ACCEPTED_AUDIO = ".mp3,.wav,.flac,.aiff,.ogg,.aac,.mp4,.m4a,.wma";
const ACCEPTED_TYPES = [
  "audio/mpeg","audio/wav","audio/flac","audio/aiff","audio/ogg",
  "audio/aac","audio/mp4","audio/x-m4a","audio/x-ms-wma",
  ".mp3",".wav",".flac",".aiff",".ogg",".aac",".mp4",".m4a",".wma",
];

const GENRE_OPTIONS = [
  "Alternative Rock","Ambient","Classical","Country","Dance & EDM",
  "Dancehall","Deep House","Disco","Drum & Bass","Dubstep","Electronic",
  "Folk & Singer-Songwriter","Hip-hop & Rap","House","Indie","Jazz & Blues",
  "Latin","Metal","Piano","Pop","R&B & Soul","Reggae","Reggaeton",
  "Rock","Soundtrack","Techno","Trance","Trap","Triphop","World",
];

function filenameToTitle(name: string) {
  return name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
}
function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SoundCloud Upload Page Clone
// ═══════════════════════════════════════════════════════════════════════════
export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Stage
  const [stage, setStage] = useState<"dropzone" | "form">("dropzone");

  // File
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Metadata
  const [title, setTitle] = useState("");
  const [trackLink, setTrackLink] = useState("");
  const [genre, setGenre] = useState("");
  const [genreOpen, setGenreOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private" | "schedule">("public");
  const [artworkUrl, setArtworkUrl] = useState("");
  const artworkInputRef = useRef<HTMLInputElement>(null);

  // Recording
  const [recordOpen, setRecordOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Options panel data
  const [optionsData, setOptionsData] = useState<UploadOptionsData | null>(null);

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedTrackTitle, setUploadedTrackTitle] = useState("");
  const [uploadedTrackId, setUploadedTrackId] = useState("");

  // Submit
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Upload mutation (TanStack Query — auto-invalidates cache)
  const uploadMutation = useUploadTrack();

  // ── File handling ─────────────────────────────────────────────────────
  const validateFile = useCallback((f: File) => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(f.type) && !ACCEPTED_TYPES.includes(ext)) {
      setFileError("This file type is not supported. Please upload a WAV, FLAC, AIFF, ALAC, OGG, MP3, AAC, or WMA file.");
      return false;
    }
    setFileError("");
    return true;
  }, []);

  const handleFileSelect = useCallback((f: File | null) => {
    if (!f || !validateFile(f)) return;
    setFile(f);
    setTitle(filenameToTitle(f.name));
    const username = (user as any)?.permalink || (user as any)?.username || "you";
    setTrackLink(`https://biobeats.com/${username}/${f.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, "-")}`);
    setStage("form");
    setUploadProgress(0);
    setUploadComplete(false);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) { p = 100; clearInterval(iv); setUploadComplete(true); }
      setUploadProgress(Math.min(Math.round(p), 100));
    }, 400);
  }, [validateFile, user]);

  // Drag & drop
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }, [handleFileSelect]);
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);

  // Recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const rec = new File([blob], `recording-${Date.now()}.wav`, { type: "audio/wav" });
        stream.getTracks().forEach((t) => t.stop());
        handleFileSelect(rec);
      };
      mr.start(); setIsRecording(true); setRecordTime(0);
      timerRef.current = setInterval(() => setRecordTime((p) => p + 1), 1000);
    } catch { setFileError("Microphone access denied."); }
  }, [handleFileSelect]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop(); setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  // Artwork
  const handleArtworkSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f?.type.startsWith("image/")) setArtworkUrl(URL.createObjectURL(f));
  }, []);

  // Submit
  const handleUpload = useCallback(async () => {
    if (!file || isSaving) return;
    setIsSaving(true); setSaveError("");
    try {
      const visibility = privacy === "public" ? "Public" : "Private";
      const result = await uploadMutation.mutateAsync({
        payload: {
          title,
          genre,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          description,
          visibility: visibility as "Public" | "Private",
          status: "Processing",
          fileName: file.name,
          artworkUrl: artworkUrl || undefined,
          excerptStart: optionsData?.excerptStart,
          excerptEnd: optionsData?.excerptEnd,
          releaseDate: optionsData?.releaseDate || "",
          labelName: optionsData?.recordLabel,
          isrc: optionsData?.isrc,
          publisher: optionsData?.publisher,
          buyLink: optionsData?.buyLink,
          allowComments: optionsData?.allowComments,
        },
        audioFile: file,
        onProgress: (p) => setUploadProgress(p),
      });
      // Log the full upload response for debugging
      console.log('[UploadPage] Full upload API response:', JSON.stringify(result, null, 2));
      console.log('[UploadPage] Track ID from response:', result.id);
      // Show success modal instead of navigating
      setUploadedTrackId(result.id);
      setUploadedTrackTitle(title);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('[UploadPage] Upload failed:', err);
      const backendMsg = err?.response?.data?.message || err?.response?.data;
      const exactErr = typeof backendMsg === 'string' ? backendMsg : JSON.stringify(backendMsg);
      setSaveError(exactErr || err?.message || "Upload failed. Please try again.");
    } finally { setIsSaving(false); }
  }, [file, title, genre, tags, description, privacy, artworkUrl, optionsData, user, uploadMutation, isSaving]);

  const handleCancel = useCallback(() => {
    setFile(null); setStage("dropzone"); setUploadProgress(0); setUploadComplete(false);
    setTitle(""); setTrackLink(""); setGenre(""); setTags(""); setDescription("");
    setPrivacy("public"); setArtworkUrl(""); setFileError(""); setSaveError("");
  }, []);

  const filteredGenres = GENRE_OPTIONS.filter((g) => g.toLowerCase().includes(genreSearch.toLowerCase()));

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: "#111", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* ── Top bar for FORM state (Track Info header) ── */}
      {stage === "form" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "#1a1a1a", borderBottom: "1px solid #333" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* SC logo bars */}
            <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
              <rect x="0" y="6" width="3" height="8" rx="1" fill="#f50"/><rect x="5" y="3" width="3" height="11" rx="1" fill="#f50"/>
              <rect x="10" y="0" width="3" height="14" rx="1" fill="#f50"/><rect x="15" y="4" width="3" height="10" rx="1" fill="#f50"/>
              <rect x="20" y="2" width="3" height="12" rx="1" fill="#f50"/><rect x="25" y="5" width="3" height="9" rx="1" fill="#f50"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Track Info</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 12, color: "#999" }}>{file?.name}</span>
            {/* Progress bar */}
            <div data-testid="upload-progress-bar" style={{ width: 160, height: 4, background: "#333", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${uploadProgress}%`, height: "100%", background: uploadComplete ? "#3bc96b" : "#f50", borderRadius: 2, transition: "width 300ms" }} />
            </div>
            <span style={{ fontSize: 12, color: uploadComplete ? "#3bc96b" : "#999" }}>
              {uploadComplete ? "Complete" : `Uploading ${uploadProgress}%`}
            </span>
            <button onClick={handleCancel} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 18, padding: 4 }}>✕</button>
          </div>
        </div>
      ) : (
        <NavBar onUpload={() => router.push(ROUTES.UPLOAD)} />
      )}

      <main data-testid="upload-page" style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 100px" }}>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* DROPZONE STATE                                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {stage === "dropzone" && (
          <>
            {/* Quota bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#1a1a1a", borderRadius: 8, marginBottom: 32, border: "1px solid #333" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span style={{ fontSize: 13, color: "#ccc" }}>0% of uploads used</span>
                <div style={{ width: 200, height: 4, background: "#333", borderRadius: 2 }}><div style={{ width: "0%", height: "100%", background: "#f50", borderRadius: 2 }} /></div>
                <span style={{ fontSize: 13, color: "#999" }}>0 of 120 minutes</span>
              </div>
              <button style={{ padding: "8px 20px", fontSize: 12, fontWeight: 600, color: "#fff", background: "transparent", border: "1px solid #fff", borderRadius: 100, cursor: "pointer" }}>Get unlimited uploads</button>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Upload your audio files.</h1>
            <p style={{ fontSize: 14, color: "#999", marginBottom: 32 }}>
              For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file size is 4GB uncompressed. <a href="#" style={{ color: "#999", textDecoration: "underline" }}>Learn more.</a>
            </p>

            {/* Dropzone */}
            <div data-testid="upload-dropzone" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => fileInputRef.current?.click()}
              style={{ padding: "80px 40px", border: `2px dashed ${isDragOver ? "#f50" : "#444"}`, borderRadius: 8, textAlign: "center", cursor: "pointer", transition: "all 200ms", background: isDragOver ? "rgba(255,85,0,0.05)" : "transparent" }}>
              <div style={{ marginBottom: 20 }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <path d="M52 34c0-9.4-7.6-17-17-17-7.5 0-13.8 4.8-16.1 11.5C12.4 29.5 8 34.6 8 40.7 8 47.4 13.4 53 20 53h28c7.7 0 14-6.3 14-14 0-3-1-5.8-2.6-8" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M32 24v20M24 32l8-8 8 8" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ fontSize: 16, color: "#ccc", marginBottom: 20 }}>Drag and drop audio files to get started.</p>
              <button data-testid="upload-browse-button" type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                style={{ padding: "10px 28px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#333", border: "none", borderRadius: 100, cursor: "pointer" }}
                onMouseOver={(e) => e.currentTarget.style.background = "#444"} onMouseOut={(e) => e.currentTarget.style.background = "#333"}>
                Choose files
              </button>
              <input data-testid="upload-dropzone-input" ref={fileInputRef} type="file" accept={ACCEPTED_AUDIO} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
            </div>

            {fileError && <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(229,57,53,0.1)", border: "1px solid rgba(229,57,53,0.3)", borderRadius: 4, color: "#ef5350", fontSize: 13 }}>{fileError}</div>}

            {/* Recording accordion */}
            <div style={{ marginTop: 32, background: "#1a1a1a", borderRadius: 8, border: "1px solid #333", overflow: "hidden" }}>
              <button onClick={() => setRecordOpen(!recordOpen)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "transparent", border: "none", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  <span style={{ fontSize: 14, color: "#999" }}>▾</span>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Or record with a microphone</span>
                  {recordOpen && <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Upload recorded voice memos, updates, news, or intros to new releases.</p>}
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ transform: recordOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>

              {recordOpen && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid #333" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16 }}>
                    {/* Control icons: check, undo, redo, delete */}
                    <div style={{ display: "flex", gap: 16 }}>
                      {["✓", "↩", "↪", "🗑"].map((icon, i) => (
                        <button key={i} style={{ background: "none", border: "none", color: "#666", fontSize: 16, cursor: "pointer", padding: 4 }}>{icon}</button>
                      ))}
                    </div>
                    {/* Start recording button */}
                    <button data-testid="upload-record-button" onClick={isRecording ? stopRecording : startRecording}
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 24px", borderRadius: 100, background: isRecording ? "#cc0000" : "#333", border: "1px solid #555", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e53935", display: "inline-block" }} />
                      {isRecording ? "Stop recording" : "Start recording"}
                    </button>
                    {/* Timer */}
                    <span data-testid="upload-record-timer" style={{ fontSize: 14, fontFamily: "monospace", color: isRecording ? "#e53935" : "#666" }}>{formatTime(recordTime)}</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* METADATA FORM STATE                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {stage === "form" && (
          <div data-testid="metadata-form">
            <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
              {/* ── Left: Artwork ── */}
              <div style={{ flexShrink: 0 }}>
                <div data-testid="metadata-artwork-upload" onClick={() => artworkInputRef.current?.click()}
                  style={{ width: 260, height: 260, background: artworkUrl ? `url(${artworkUrl}) center/cover` : "#1a1a1a", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", border: "1px dashed #555" }}>
                  {!artworkUrl && (
                    <div style={{ textAlign: "center", color: "#666" }}>
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <p style={{ fontSize: 13, marginTop: 12, color: "#999", fontWeight: 500 }}>Add new artwork</p>
                    </div>
                  )}
                  {artworkUrl && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 200ms" }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = "1"} onMouseOut={(e) => e.currentTarget.style.opacity = "0"}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  )}
                </div>
                <input ref={artworkInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleArtworkSelect} />
              </div>

              {/* ── Right: Form fields ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Track title */}
                <div style={{ marginBottom: 24 }}>
                  <label style={lbl}>Track title <span style={{ color: "#f50" }}>*</span> <InfoIcon /></label>
                  <input data-testid="metadata-title-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name your track" style={inp} />
                </div>

                {/* Track link */}
                <div style={{ marginBottom: 24 }}>
                  <label style={lbl}>Track link</label>
                  <input type="text" value={trackLink} onChange={(e) => setTrackLink(e.target.value)} style={inp} />
                </div>

                {/* Main Artist(s) */}
                <div style={{ marginBottom: 24 }}>
                  <label style={lbl}>Main Artist(s) <InfoIcon /></label>
                  <input type="text" defaultValue={(user as any)?.displayName || (user as any)?.username || ""} style={inp} />
                  <p style={{ fontSize: 11, color: "#555", marginTop: 6 }}>Tip: Use commas to add multiple artist names.</p>
                </div>

                {/* Genre — searchable dropdown */}
                <div style={{ marginBottom: 24, position: "relative" }}>
                  <label style={lbl}>Genre</label>
                  <div style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "0 12px" }}
                    onClick={() => setGenreOpen(!genreOpen)}>
                    <input data-testid="metadata-genre-input" type="text" value={genreOpen ? genreSearch : (genre || "")} placeholder="Add or search for genre"
                      onChange={(e) => { setGenreSearch(e.target.value); if (!genreOpen) setGenreOpen(true); }}
                      onClick={(e) => { e.stopPropagation(); setGenreOpen(true); }}
                      style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, flex: 1, padding: "10px 0" }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      {genre && <button onClick={(e) => { e.stopPropagation(); setGenre(""); setGenreSearch(""); }} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 14 }}>✕</button>}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ transform: genreOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                  {genreOpen && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#222", border: "1px solid #444", borderRadius: "0 0 4px 4px", maxHeight: 240, overflowY: "auto" }}>
                      <div style={{ padding: "8px 12px", fontSize: 12, color: "#3bc96b" }}>All music genres</div>
                      {filteredGenres.map((g) => (
                        <div key={g} onClick={() => { setGenre(g); setGenreSearch(""); setGenreOpen(false); }}
                          style={{ padding: "10px 16px", fontSize: 14, color: "#fff", cursor: "pointer", background: genre === g ? "rgba(255,255,255,0.1)" : "transparent", transition: "background 100ms" }}
                          onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                          onMouseOut={(e) => e.currentTarget.style.background = genre === g ? "rgba(255,255,255,0.1)" : "transparent"}>
                          {g}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div style={{ marginBottom: 24 }}>
                  <label style={lbl}>Tags <InfoIcon /></label>
                  <input data-testid="metadata-tags-input" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Add styles, moods, tempo." style={inp} />
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...lbl, fontWeight: 700 }}>Description</label>
                  <textarea data-testid="metadata-description-input" value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tracks with descriptions tend to get more plays and engagements." rows={3}
                    style={{ ...inp, resize: "vertical", minHeight: 80, lineHeight: "1.5" }} />
                </div>

                {/* Track Privacy */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...lbl, fontWeight: 700 }}>Track Privacy</label>
                  <div style={{ display: "flex", gap: 24 }}>
                    {(["public", "private", "schedule"] as const).map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input data-testid={`metadata-privacy-toggle-${opt}`} type="radio" name="privacy" checked={privacy === opt} onChange={() => setPrivacy(opt)}
                          style={{ accentColor: "#f50" }} />
                        <span style={{ fontSize: 14, color: "#ccc", textTransform: "capitalize" }}>{opt === "schedule" ? "Schedule" : opt === "public" ? "Public" : "Private"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Options section (tabbed panel) ── */}
            <UploadOptionsPanel
              audioFile={file}
              artistName={(user as any)?.displayName || (user as any)?.username || ""}
              onChange={setOptionsData}
            />

            {saveError && <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(229,57,53,0.1)", border: "1px solid rgba(229,57,53,0.3)", borderRadius: 4, color: "#ef5350", fontSize: 13 }}>{saveError}</div>}
          </div>
        )}
      </main>

      {/* ── Bottom bar (form state) ── */}
      {stage === "form" && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#1a1a1a", borderTop: "1px solid #333", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100 }}>
          <p style={{ fontSize: 12, color: "#777" }}>
            By uploading, you confirm that your sounds comply with our <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>Terms of Use</a> and you don&apos;t infringe anyone else&apos;s rights.
          </p>
          <button data-testid="metadata-save-button" onClick={handleUpload} disabled={isSaving || !title.trim()}
            style={{ padding: "10px 40px", fontSize: 14, fontWeight: 700, color: "#fff", background: isSaving || !title.trim() ? "#1b5e20" : "#2e7d32", border: "none", borderRadius: 4, cursor: isSaving || !title.trim() ? "not-allowed" : "pointer", transition: "all 150ms", opacity: isSaving || !title.trim() ? 0.6 : 1 }}>
            {isSaving ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}

      {/* ── Success Modal ── */}
      <UploadSuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          const uname = (user as any)?.permalink || (user as any)?.username || (user as any)?._id || "me";
          router.push(ROUTES.PROFILE(uname));
        }}
        trackTitle={uploadedTrackTitle}
        trackId={uploadedTrackId}
        username={(user as any)?.permalink || (user as any)?.username || (user as any)?._id || "me"}
      />
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────
function InfoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }}>
      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
    </svg>
  );
}

function Accordion({ title, subtitle, icon, open, onToggle }: { title: string; subtitle: string; icon: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderBottom: "1px solid #333" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {icon}
          <div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{title}</span>
            <p style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{subtitle}</p>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && <div style={{ padding: "0 0 16px 30px", fontSize: 13, color: "#777" }}>Coming soon — this feature is under development.</div>}
    </div>
  );
}

// ─── Shared styles ──────────────────────────────────────────────────────────
const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8 };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 14, color: "#fff", background: "transparent", border: "none", borderBottom: "1px solid #444", outline: "none", transition: "border-color 150ms", boxSizing: "border-box" };
