# UI Component Test IDs Reference (Modules 4, 5, & 6)

**Purpose:** This document is the single source of truth for all `data-testid` attributes implemented across Modules 4 (Tracks & Uploads), 5 (Playback Engine), and 6 (Engagement & Social). Automation and QA teams must use these IDs to write robust end-to-end (E2E) tests, assert UI component states, and interact with the application.

---

## Module 4: Tracks & Audio Management

**Components:** `EditTrackModal.tsx`, `TrackForm.tsx`, `AudioUploader.tsx`

| Data Test ID | Dom Type | Target Purpose |
|---|---|---|
| `edit-track-modal` | `<div>` | Root background wrapper of the track edit modal |
| `edit-track-modal-panel` | `<div>` | Floating central panel within the dialog |
| `edit-track-title-input` | `<input>` | Plain text input for track title modifications |
| `edit-track-permalink-input` | `<input>` | Field controlling the custom URL string |
| `edit-track-genre-input` | `<input>` | Input containing the dropdown selector for genre |
| `edit-track-tags-input` | `<input>` | Form space for comma-separated tags |
| `edit-track-description-input`| `<textarea>`| Block text entry for detailed track descriptions |
| `edit-track-privacy-public` | `<input>` | Radio toggle for public visibility |
| `edit-track-privacy-private` | `<input>` | Radio toggle for private/hidden visibility |
| `edit-track-cancel-button` | `<button>` | Quits without committing backend modifications |
| `edit-track-save-button` | `<button>` | Initiates GraphQL/REST `onSave` network payload |
| `track-form` | `<div>` | High-level wrapper tracking component mode (create/edit) |
| `track-form-title-input` | `<input>` | Base title target mapped in standard track uploads |
| `track-form-genre-select` | `<select>` | Standard dropdown variation for genre constraints |
| `track-form-submit-button` | `<button>` | Submission point for uploading binaries/forms |
| `audio-uploader` | `<div>` | Visual dropzone frame encapsulating drag-and-drop |
| `audio-uploader-input` | `<input>` | The hidden native `type="file"` used by test automation |

---

## Module 5: Playback & Streaming Engine

**Components:** `PlayerBar.tsx`, `SeekBar.tsx`, `VolumeControl.tsx`, `WaveformDisplay.tsx`, `PlaybackStateGuard.tsx`, `RecentlyPlayed.tsx`

| Data Test ID | Dom Type | Target Purpose |
|---|---|---|
| `sc-player-bar` | `<div>` | Persistent global web player anchored at the viewport bottom |
| `sc-btn-play-pause` | `<button>`| Play / Pause audio stream toggle |
| `sc-btn-prev` | `<button>`| Seek to chapter start or previous array queue item |
| `sc-btn-next` | `<button>`| Advance strictly to the next logical chronological queue element |
| `sc-btn-shuffle` | `<button>`| Activate randomized execution of the playback cache |
| `sc-btn-repeat` | `<button>`| Switch through cycle states (`none`, `one`, `all`) |
| `sc-time-display` | `<span>` | Reflects current running audio millisecond (`m:ss`) |
| `sc-btn-queue` | `<button>`| Expand/collapse the right-aligned playlist drawer |
| `sc-btn-expand` | `<button>`| Shifts the player component into a modular fullscreen state |
| `sc-seekbar` | `<div>` | Wrapper intercepting complex coordinate scrub interactions |
| `sc-seekbar-tooltip` | `<div>` | Follows mouse hover coordinates over `sc-seekbar` |
| `sc-volume-control` | `<div>` | Outer encapsulating structure for sound modifications |
| `sc-btn-mute` | `<button>`| Binary un-mute or complete mute silencer |
| `sc-volume-slider` | `<input>` | A normalized `type="range"` slider mapping floating values |
| `sc-waveform` | `<div>` | Container anchoring absolute-positioned canvas sound visuals |
| `sc-playback-guard` | `<div>` | Security gate interceptor preventing free tier unauthorized listening |
| `sc-preview-banner` | `<div>` | Promotional top-layer toast showing partial snippet mode |
| `sc-preview-timer` | `<span>` | High-precision descending clock rendering seconds remaining |
| `sc-preview-cta` | `<button>`| Route interceptor bouncing the user to subscribe pages |
| `sc-blocked-overlay` | `<div>` | Pitch-black regional geo-blocking blocking all interactivity |
| `sc-blocked-cta` | `<button>`| Documentation link for DMCA/Geo takedown policies |
| `sc-recently-played` | `<div>` | Root component managing local-storage cache iterations |
| `sc-btn-clear-recent` | `<button>`| System sweep flushing local playback history tokens |
| `sc-recent-item-{n}` | `<button>`| Single graphical element (e.g. `sc-recent-item-3`) |
| `sc-listening-history` | `<div>` | Paginated infinite-scroll or load-more heavy container |
| `sc-history-sort` | `<select>`| Controls rendering orientation via Timestamp arrays |
| `sc-history-filter` | `<select>`| Scopes the display subset against Date matching |
| `sc-history-item-{n}` | `<div>` | High-density row (e.g. `sc-history-item-12`) |
| `sc-history-delete-{n}` | `<button>`| Trash icon specifically tearing down its parent sibling `item-{n}` |
| `sc-history-load-more` | `<button>`| Explicit CTA loading the next pagination fragment chunk |

---

## Module 6: Engagement & Social Interactions

**Components:** `EngagementListModal.tsx`, `TrackCard.tsx`, `WaveformPlayer.tsx`, `CommentInput.tsx`

| Data Test ID | Dom Type | Target Purpose |
|---|---|---|
| `track-card-{id}` | `<div>` | Base feed element uniquely bound to Database ID mappings |
| `track-card-repost-{id}` | `<button>`| Rapid optimistic update hook interacting with the feed relay |
| `engagement-list-modal` | `<div>` | Base Dialog managing internal scroll lists for active interactions |
| `engagement-list-content` | `<div>` | Primary body housing arrays of mapped likers or reposter users |
| `engagement-list-loading` | `<div>` | Fallback component simulating initial network queries |
| `engagement-list-empty` | `<div>` | Fallback empty state resolving against `0` value arrays |
| `engagement-list-items` | `<div>` | Array mapping execution wrapper confirming the list resolves |
| `engagement-item-{id}` | `<div>` | Micro-component projecting individual account avatars |
| `waveform-player` | `<div>` | Mega component controlling standalone audio instances on Track pages |
| `track-play-button` | `<button>`| Primary play button communicating to global `AudioContext` bindings |
| `comment-marker-{id}` | `<div>` | Timed-stamped relative graphical injection on `WaveSurfer.js` spans |
| `comment-tooltip` | `<div>` | Display hover states exposing message nodes string content |
| `waveform-current-time` | `<span>` | `WaveSurfer.js` instance output showing play progress |
| `waveform-duration` | `<span>` | `WaveSurfer.js` end computation boundary value string |
| `comment-input` | `<div>` | Persistent injection container tracking realtime timestamp data |
| `comment-text-input` | `<input>` | The mutable text variable controlled strictly by React State |
| `comment-timestamp-badge` | `<span>` | Floating badge capturing the millisecond integer at interaction frame |
| `comment-submit-button` | `<button>`| Final dispatch pipeline sending the mutation out locally |
