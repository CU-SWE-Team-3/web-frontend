# Module 5 — Component ID Reference

**Purpose:** This document is the single source of truth for all `id` attributes used in Module 5: Playback & Streaming Engine. Use these IDs to write end-to-end or integration tests, locate elements in the DOM, and validate QA automation scripts.

---

## Quick Reference Table

| Element ID | Component | File | Purpose |
|---|---|---|---|
| `sc-player-bar` | `PlayerBar` | `src/shared/ui/PlayerBar/PlayerBar.tsx` | Root container of the persistent bottom player bar |
| `sc-btn-play-pause` | `PlayerBar` | `src/shared/ui/PlayerBar/PlayerBar.tsx` | Toggle play / pause. `aria-label` = `"Play"` or `"Pause"` |
| `sc-btn-prev` | `PlayerBar` | `src/shared/ui/PlayerBar/PlayerBar.tsx` | Skip to previous track |
| `sc-btn-next` | `PlayerBar` | `src/shared/ui/PlayerBar/PlayerBar.tsx` | Skip to next track |
| `sc-time-display` | `PlayerBar` | `src/shared/ui/PlayerBar/PlayerBar.tsx` | Current playback time text (`m:ss`) |
| `sc-btn-expand` | `PlayerBar` | `src/shared/ui/PlayerBar/PlayerBar.tsx` | Expand player to full-screen view |
| `sc-seekbar` | `SeekBar` | `src/features/playback-engine/components/player/SeekBar.tsx` | Seek / scrub container. Role = `slider` |
| `sc-seekbar-tooltip` | `SeekBar` | `src/features/playback-engine/components/player/SeekBar.tsx` | Hover timestamp tooltip. Only in DOM while hovering |
| `sc-volume-control` | `VolumeControl` | `src/features/playback-engine/components/player/VolumeControl.tsx` | Volume section wrapper |
| `sc-btn-mute` | `VolumeControl` | `src/features/playback-engine/components/player/VolumeControl.tsx` | Toggle mute. `aria-label` = `"Mute"` or `"Unmute"` |
| `sc-volume-slider` | `VolumeControl` | `src/features/playback-engine/components/player/VolumeControl.tsx` | Range input `0`–`1`. `type="range"` |
| `sc-waveform` | `WaveformDisplay` | `src/features/playback-engine/components/player/WaveformDisplay.tsx` | Waveform canvas container. Role = `slider` |
| `sc-playback-guard` | `PlaybackStateGuard` | `src/features/playback-engine/components/playback/PlaybackStateGuard.tsx` | Wrapper div. `data-state` = `"playable"` \| `"preview"` \| `"blocked"` |
| `sc-preview-banner` | `PreviewBanner` | `src/features/playback-engine/components/playback/PreviewBanner.tsx` | Orange banner shown in preview state |
| `sc-preview-timer` | `PreviewBanner` | `src/features/playback-engine/components/playback/PreviewBanner.tsx` | Countdown text e.g. `"0:25 remaining"` |
| `sc-preview-cta` | `PreviewBanner` | `src/features/playback-engine/components/playback/PreviewBanner.tsx` | CTA button. Text = `"Sign In"` or `"Go Pro"` |
| `sc-blocked-overlay` | `BlockedOverlay` | `src/features/playback-engine/components/playback/BlockedOverlay.tsx` | Full overlay rendered when state = blocked |
| `sc-blocked-cta` | `BlockedOverlay` | `src/features/playback-engine/components/playback/BlockedOverlay.tsx` | CTA button. Text = `"Learn More"` or `"Go Pro"` |
| `sc-recently-played` | `RecentlyPlayed` | `src/features/playback-engine/components/history/RecentlyPlayed.tsx` | Recently played section root |
| `sc-btn-clear-recent` | `RecentlyPlayed` | `src/features/playback-engine/components/history/RecentlyPlayed.tsx` | Button to clear recently played. Only rendered when list is non-empty |
| `sc-recent-item-{n}` | `RecentlyPlayed` | `src/features/playback-engine/components/history/RecentlyPlayed.tsx` | Individual item. `n` = 0-based index (max 9) |
| `sc-listening-history` | `ListeningHistory` | `src/features/playback-engine/components/history/ListeningHistory.tsx` | Full history panel root |
| `sc-history-sort` | `ListeningHistory` | `src/features/playback-engine/components/history/ListeningHistory.tsx` | Sort `<select>`. Options: `recent`, `oldest`, `title`, `artist` |
| `sc-history-filter` | `ListeningHistory` | `src/features/playback-engine/components/history/ListeningHistory.tsx` | Filter `<select>`. Options: `all`, `today`, `week`, `month` |
| `sc-history-item-{n}` | `ListeningHistory` | `src/features/playback-engine/components/history/ListeningHistory.tsx` | Individual history row. `n` = 0-based index of displayed page |
| `sc-history-delete-{n}` | `ListeningHistory` | `src/features/playback-engine/components/history/ListeningHistory.tsx` | Delete button per row. `n` matches its row index |
| `sc-history-load-more` | `ListeningHistory` | `src/features/playback-engine/components/history/ListeningHistory.tsx` | Load more button. Only in DOM when more items exist |

---

## Component-by-Component Detail

### `PlayerBar` — `#sc-player-bar`

**File:** `src/shared/ui/PlayerBar/PlayerBar.tsx`  
**SCSS Module:** `src/shared/ui/PlayerBar/PlayerBar.module.scss`

```
#sc-player-bar
  ├── [thumbnail img]
  ├── [.trackTitle / .trackArtist]
  ├── [like button]
  ├── #sc-btn-prev
  ├── #sc-btn-play-pause       ← aria-label="Play" | "Pause"
  ├── #sc-btn-next
  ├── #sc-time-display         ← text: "m:ss"
  ├── #sc-seekbar              ← SeekBar component
  ├── [duration text]
  ├── [add-to-playlist button]
  ├── #sc-volume-control       ← VolumeControl component
  └── #sc-btn-expand
```

**Responsive behaviour:**
- `< 640px` — only thumbnail + play/pause + title visible
- `< 768px` — right section (volume, expand) hidden; seek row hidden
- `≥ 768px` — full layout

---

### `SeekBar` — `#sc-seekbar`

**File:** `src/features/playback-engine/components/player/SeekBar.tsx`

```
#sc-seekbar
  ├── [.track] (click target, role="slider")
  │   ├── [.buffered]     ← grey fill
  │   ├── [.played]       ← orange #FF5500 fill
  │   └── [.thumb]        ← white dot (opacity 0 until hover)
  └── #sc-seekbar-tooltip  ← only in DOM while hovering; text: "m:ss"
```

**Keyboard:** `ArrowLeft` − 5 s, `ArrowRight` + 5 s

---

### `VolumeControl` — `#sc-volume-control`

**File:** `src/features/playback-engine/components/player/VolumeControl.tsx`

```
#sc-volume-control
  ├── #sc-btn-mute    ← aria-label="Mute"|"Unmute"; icon changes with level
  └── #sc-volume-slider  ← type="range" min=0 max=1 step=0.01
```

Icon states:
- `VolumeX` when `isMuted === true` or `volume === 0`
- `Volume1` when `0 < volume < 0.5`
- `Volume2` when `volume ≥ 0.5`

---

### `WaveformDisplay` — `#sc-waveform`

**File:** `src/features/playback-engine/components/player/WaveformDisplay.tsx`

- Canvas element inside the wrapper div
- Click anywhere to seek
- Role = `slider`; `aria-valuenow` = `currentTime`; `aria-valuemax` = `duration`
- Colors: played = `#FF5500`, unplayed = `#333333`, hovered-unplayed = `#FF7733`

---

### `PlaybackStateGuard` — `#sc-playback-guard`

**File:** `src/features/playback-engine/components/playback/PlaybackStateGuard.tsx`

| `data-state` | What renders |
|---|---|
| `"playable"` | `children` only |
| `"preview"` | `children` + `#sc-preview-banner` (absolute positioned at bottom) |
| `"blocked"` | `#sc-blocked-overlay` only (no children) |

---

### `PreviewBanner` — `#sc-preview-banner`

**File:** `src/features/playback-engine/components/playback/PreviewBanner.tsx`

```
#sc-preview-banner
  ├── [message text]       ← "Sign in for full access" | "Upgrade to listen"
  ├── #sc-preview-timer    ← "m:ss remaining"
  └── #sc-preview-cta      ← "Sign In" | "Go Pro"
```

---

### `BlockedOverlay` — `#sc-blocked-overlay`

**File:** `src/features/playback-engine/components/playback/BlockedOverlay.tsx`

```
#sc-blocked-overlay
  ├── [blurred artwork backdrop]   ← only if artworkUrl provided
  ├── [dark scrim]
  └── [content]
      ├── [lock icon]
      ├── [message text]           ← "Not available in your region" | "Go Pro to unlock"
      └── #sc-blocked-cta          ← "Learn More" | "Go Pro"
```

**Message logic:** If `region` prop is provided → region-blocked message. Otherwise → tier-upgrade message.

---

### `RecentlyPlayed` — `#sc-recently-played`

**File:** `src/features/playback-engine/components/history/RecentlyPlayed.tsx`

```
#sc-recently-played
  ├── [h2 title]
  ├── #sc-btn-clear-recent   ← only rendered when tracks.length > 0
  └── [horizontal scroll list]
      ├── #sc-recent-item-0
      ├── #sc-recent-item-1
      └── ... (max 9)
```

Each item is a `<button>` with thumbnail, title, artist. Calls `onPlay(track)` on click.

---

### `ListeningHistory` — `#sc-listening-history`

**File:** `src/features/playback-engine/components/history/ListeningHistory.tsx`

```
#sc-listening-history
  ├── [h2 title]
  ├── #sc-history-sort      ← <select>
  ├── #sc-history-filter    ← <select>
  ├── [list]
  │   ├── #sc-history-item-0
  │   │   └── #sc-history-delete-0
  │   ├── #sc-history-item-1
  │   │   └── #sc-history-delete-1
  │   └── ...
  └── #sc-history-load-more  ← only when more items exist
```

**Sort options:** `recent` | `oldest` | `title` | `artist`  
**Filter options:** `all` | `today` | `week` | `month`  
**Pagination:** Default `pageSize = 20`. Each click shows 20 more.

---

## State & Data Flow

```
usePlayerStore (Zustand)
  └── usePlayer() hook
        └── PlayerBar
              ├── SeekBar
              └── VolumeControl

useHistoryStore (Zustand)
  └── useHistory() hook
        ├── RecentlyPlayed
        └── ListeningHistory

usePlaybackState() hook
  └── PlaybackStateGuard
        ├── PreviewBanner (preview state)
        └── BlockedOverlay (blocked state)
```

---

## Test Commands

```bash
# Run all Module 5 tests
npx vitest run src/__tests__/components/PlayerBar.test.tsx
npx vitest run src/__tests__/components/SeekBar.test.tsx
npx vitest run src/__tests__/components/VolumeControl.test.tsx
npx vitest run src/__tests__/components/WaveformDisplay.test.tsx
npx vitest run src/__tests__/components/PlaybackStateGuard.test.tsx
npx vitest run src/__tests__/components/PreviewBanner.test.tsx
npx vitest run src/__tests__/components/BlockedOverlay.test.tsx
npx vitest run src/__tests__/components/RecentlyPlayed.test.tsx
npx vitest run src/__tests__/components/ListeningHistory.test.tsx
npx vitest run src/__tests__/hooks/usePlayer.test.ts
npx vitest run src/__tests__/hooks/usePlaybackState.test.ts
npx vitest run src/__tests__/hooks/useHistory.test.ts

# Or run everything at once
npx vitest run src/__tests__
```
