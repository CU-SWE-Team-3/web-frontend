"use client";

import React, { useState, useRef, useCallback } from "react";
import type { Track, UploadTrackInput } from "../model/track";

// ─── Constants ──────────────────────────────────────────────────────────────
const GENRE_OPTIONS = [
  "Alternative Rock","Ambient","Classical","Country","Dance & EDM",
  "Dancehall","Deep House","Disco","Drum & Bass","Dubstep","Electronic",
  "Folk & Singer-Songwriter","Hip-hop & Rap","House","Indie","Jazz & Blues",
  "Latin","Metal","Piano","Pop","R&B & Soul","Reggae","Reggaeton",
  "Rock","Soundtrack","Techno","Trance","Trap","Triphop","World",
];

type ModalTab = "basic" | "metadata" | "permissions" | "advanced";

interface EditTrackModalProps {
  track: Track;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<UploadTrackInput>) => Promise<void>;
  isSaving?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SoundCloud-style Edit Track Modal
// ═══════════════════════════════════════════════════════════════════════════
export default function EditTrackModal({ track, open, onClose, onSave, isSaving = false }: EditTrackModalProps) {
  const [tab, setTab] = useState<ModalTab>("basic");
  const [title, setTitle] = useState(track.title || "");
  const [permalink, setPermalink] = useState(
    track.title?.toLowerCase().replace(/\s+/g, "-") || ""
  );
  const [genre, setGenre] = useState(track.genre || "");
  const [genreOpen, setGenreOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState("");
  const [tags, setTags] = useState((track.tags || []).join(", "));
  const [description, setDescription] = useState(track.description || "");
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Private">(
    track.visibility || "Public"
  );
  const [releaseDate, setReleaseDate] = useState(
    track.releaseDate ? new Date(track.releaseDate).toISOString().split("T")[0] : ""
  );
  const [labelName, setLabelName] = useState(track.labelName || "");
  const [isrc, setIsrc] = useState(track.isrc || "");
  const [publisher, setPublisher] = useState(track.publisher || "");
  const [buyLink, setBuyLink] = useState(track.buyLink || "");
  const [allowComments, setAllowComments] = useState(track.allowComments ?? true);
  const [artworkUrl, setArtworkUrl] = useState(track.artworkUrl || "");
  const artworkInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      setTitle(track.title || "");
      setPermalink(track.title?.toLowerCase().replace(/\s+/g, "-") || "");
      setGenre(track.genre || "");
      setTags((track.tags || []).join(", "));
      setDescription(track.description || "");
      setVisibility(track.visibility || "Public");
      setArtworkUrl(track.artworkUrl || "");
      setReleaseDate(track.releaseDate ? new Date(track.releaseDate).toISOString().split("T")[0] : "");
      setLabelName(track.labelName || "");
      setIsrc(track.isrc || "");
      setPublisher(track.publisher || "");
      setBuyLink(track.buyLink || "");
      setAllowComments(track.allowComments ?? true);
    }
  }, [open, track]);

  const filteredGenres = GENRE_OPTIONS.filter((g) =>
    g.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const handleArtworkSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f?.type.startsWith("image/")) setArtworkUrl(URL.createObjectURL(f));
    },
    []
  );

  const handleSave = async () => {
    await onSave({
      title,
      genre,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      description,
      visibility,
      artworkUrl,
      releaseDate,
      labelName,
      isrc,
      publisher,
      buyLink,
      allowComments,
    });
  };

  if (!open) return null;

  const tabs: { key: ModalTab; label: string; badge?: string }[] = [
    { key: "basic", label: "Basic info" },
    { key: "metadata", label: "Metadata" },
    { key: "permissions", label: "Permissions" },
    { key: "advanced", label: "Advanced", badge: "NEW" },
  ];

  return (
    <div data-testid="edit-track-modal" style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", overflowY: "auto", padding: "40px 20px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>

      <div data-testid="edit-track-modal-panel" style={{ width: "100%", maxWidth: 700, background: "#1a1a1a", borderRadius: 8, color: "#fff", fontFamily: "'Inter', sans-serif", position: "relative" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Replace file link */}
        <div style={{ padding: "12px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span style={{ fontSize: 12, color: "#999" }}>Replace file</span>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, padding: "0 24px", borderBottom: "1px solid #333", marginTop: 8 }}>
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "14px 20px", fontSize: 14, fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? "#fff" : "#777", background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #f50" : "2px solid transparent",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}>
              {t.label}
              {t.badge && <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: "#f50", padding: "2px 6px", borderRadius: 3, textTransform: "uppercase" }}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── Basic info tab ── */}
        {tab === "basic" && (
          <div style={{ padding: "24px", display: "flex", gap: 24 }}>
            {/* Artwork */}
            <div style={{ flexShrink: 0 }}>
              <div onClick={() => artworkInputRef.current?.click()} style={{
                width: 160, height: 160, background: artworkUrl ? `url(${artworkUrl}) center/cover` : "#222",
                borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {!artworkUrl && (
                  <div style={{ textAlign: "center", color: "#666" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                )}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "rgba(0,0,0,0.7)", padding: "8px 0", textAlign: "center",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Upload Image</span>
                </div>
              </div>
              <input ref={artworkInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleArtworkSelect} />
            </div>

            {/* Fields */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Title */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Title <span style={{ color: "#f50" }}>*</span></label>
                <input data-testid="edit-track-title-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inp} />
              </div>

              {/* Permalink */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Permalink <span style={{ color: "#f50" }}>*</span></label>
                <div style={{ display: "flex" }}>
                  <span style={{ padding: "8px 10px", fontSize: 12, background: "#222", borderBottom: "1px solid #444", color: "#666", whiteSpace: "nowrap" }}>biobeats.com/you/</span>
                  <input data-testid="edit-track-permalink-input" type="text" value={permalink} onChange={(e) => setPermalink(e.target.value)} style={{ ...inp, flex: 1 }} />
                </div>
              </div>

              {/* Genre */}
              <div style={{ marginBottom: 20, position: "relative" }}>
                <label style={lbl}>Genre</label>
                <div style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: 0 }}
                  onClick={() => setGenreOpen(!genreOpen)}>
                  <input data-testid="edit-track-genre-input" type="text" value={genreOpen ? genreSearch : genre}
                    placeholder="Add or search for genre"
                    onChange={(e) => { setGenreSearch(e.target.value); if (!genreOpen) setGenreOpen(true); }}
                    onClick={(e) => { e.stopPropagation(); setGenreOpen(true); }}
                    style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 13, flex: 1, padding: "8px 0" }} />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" style={{ transform: genreOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms", marginRight: 4 }}><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                {genreOpen && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#222", border: "1px solid #444", borderRadius: "0 0 4px 4px", maxHeight: 200, overflowY: "auto" }}>
                    <div style={{ padding: "6px 12px", fontSize: 11, color: "#3bc96b" }}>All music genres</div>
                    {filteredGenres.map((g) => (
                      <div key={g} onClick={() => { setGenre(g); setGenreSearch(""); setGenreOpen(false); }}
                        style={{ padding: "8px 14px", fontSize: 13, color: "#fff", cursor: "pointer", background: genre === g ? "rgba(255,255,255,0.1)" : "transparent" }}
                        onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                        onMouseOut={(e) => e.currentTarget.style.background = genre === g ? "rgba(255,255,255,0.1)" : "transparent"}>
                        {g}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional tags */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Additional tags</label>
                <input data-testid="edit-track-tags-input" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Add tags to describe the genre and mood of your track" style={inp} />
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ ...lbl, fontWeight: 700 }}>Description</label>
                <textarea data-testid="edit-track-description-input" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your track" rows={3}
                  style={{ ...inp, resize: "vertical", minHeight: 70, lineHeight: "1.5" }} />
              </div>

              {/* Caption */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>
                  Caption <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                </label>
                <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption to your post (optional)" style={inp} maxLength={140} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: "#555" }}>Editing the caption doesn&apos;t post the track again.</span>
                  <span style={{ fontSize: 11, color: "#555" }}>{caption.length}/140</span>
                </div>
              </div>

              {/* Privacy */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ ...lbl, fontWeight: 700 }}>Privacy:</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input data-testid="edit-track-privacy-public" type="radio" name="edit-privacy" checked={visibility === "Public"} onChange={() => setVisibility("Public")} style={{ marginTop: 3, accentColor: "#f50" }} />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Public</span>
                      <p style={{ fontSize: 11, color: "#777", marginTop: 2 }}>Anyone will be able to listen to this track.</p>
                    </div>
                  </label>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input data-testid="edit-track-privacy-private" type="radio" name="edit-privacy" checked={visibility === "Private"} onChange={() => setVisibility("Private")} style={{ marginTop: 3, accentColor: "#f50" }} />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Private</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Metadata tab ── */}
        {tab === "metadata" && (
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>Add additional metadata to help listeners discover your track.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Release date</label>
              <input 
                type="date" 
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                style={{ ...inp, colorScheme: "dark" }} 
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Label name</label>
              <input type="text" value={labelName} onChange={(e) => setLabelName(e.target.value)} placeholder="e.g. Sony Music" style={inp} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>ISRC</label>
              <input type="text" value={isrc} onChange={(e) => setIsrc(e.target.value)} placeholder="e.g. US-S1Z-03-12345" style={inp} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Publisher</label>
              <input type="text" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher name" style={inp} />
            </div>
          </div>
        )}

        {/* ── Permissions tab ── */}
        {tab === "permissions" && (
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>Control the visibility of engagements on your track, direct downloads, and more.</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={allowComments} onChange={(e) => setAllowComments(e.target.checked)} style={{ accentColor: "#f50" }} />
                <span style={{ fontSize: 13, color: "#ccc" }}>Allow comments on this track</span>
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" defaultChecked style={{ accentColor: "#f50" }} />
                <span style={{ fontSize: 13, color: "#ccc" }}>Display stats publicly</span>
              </label>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "#f50" }} />
                <span style={{ fontSize: 13, color: "#ccc" }}>Enable direct downloads</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Advanced tab ── */}
        {tab === "advanced" && (
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 20 }}>Advanced options for your track.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Buy link</label>
              <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} placeholder="https://" style={inp} />
            </div>
            <div style={{ marginBottom: 20 }}><label style={lbl}>P-line</label><input type="text" placeholder="P-line text" style={inp} /></div>
            <div style={{ marginBottom: 20 }}><label style={lbl}>C-line</label><input type="text" placeholder="C-line text" style={inp} /></div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #333" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: "#f50" }}>* Required fields</span>
            <div style={{ display: "flex", gap: 12 }}>
              <button data-testid="edit-track-cancel-button" onClick={onClose} style={{ padding: "8px 20px", fontSize: 13, color: "#ccc", background: "transparent", border: "none", cursor: "pointer" }}>Cancel</button>
              <button data-testid="edit-track-save-button" onClick={handleSave} disabled={isSaving || !title.trim()} style={{
                padding: "8px 24px", fontSize: 13, fontWeight: 600, color: "#fff",
                background: isSaving || !title.trim() ? "#333" : "#444",
                border: "1px solid #555", borderRadius: 3,
                cursor: isSaving || !title.trim() ? "not-allowed" : "pointer",
              }}>
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
          <p style={{ fontSize: 10, color: "#555", lineHeight: 1.4 }}>
            Important: By sharing, you confirm that your track complies with our <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>Terms of Use</a> and you don&apos;t infringe anyone else&apos;s rights. If in doubt, refer to the <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>Copyright Information</a> pages and <a href="#" style={{ color: "#fff", textDecoration: "underline" }}>FAQs</a> before uploading.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared styles ──────────────────────────────────────────────────────────
const lbl: React.CSSProperties = { display: "block", fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", padding: "8px 0", fontSize: 13, color: "#fff", background: "transparent", border: "none", borderBottom: "1px solid #444", outline: "none", boxSizing: "border-box" };
