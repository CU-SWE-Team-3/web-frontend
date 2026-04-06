// ── Model: Stores ────────────────────────────────────
export { usePlayerStore }  from './model/playerStore';
export type { Track, PlayerStore } from './model/playerStore';

export { useHistoryStore } from './model/historyStore';
export type { HistoryEntry, HistoryStore } from './model/historyStore';

// ── Model: Hooks ─────────────────────────────────────
export { usePlayer }        from './model/usePlayer';
export { usePlaybackState } from './model/usePlaybackState';
export type { PlaybackState } from './model/usePlaybackState';
export { useHistory }       from './model/useHistory';

// ── UI: Player controls ──────────────────────────────
export { SeekBar }          from './ui/player/SeekBar';
export type { SeekBarProps } from './ui/player/SeekBar';
export { VolumeControl }    from './ui/player/VolumeControl';
export type { VolumeControlProps } from './ui/player/VolumeControl';
export { WaveformDisplay }  from './ui/player/WaveformDisplay';
export type { WaveformDisplayProps } from './ui/player/WaveformDisplay';

// ── UI: Playback state components ────────────────────
export { PlaybackStateGuard } from './ui/playback/PlaybackStateGuard';
export type { PlaybackStateGuardProps, PlaybackStateType } from './ui/playback/PlaybackStateGuard';
export { PreviewBanner }    from './ui/playback/PreviewBanner';
export type { PreviewBannerProps } from './ui/playback/PreviewBanner';
export { BlockedOverlay }   from './ui/playback/BlockedOverlay';
export type { BlockedOverlayProps } from './ui/playback/BlockedOverlay';

// ── UI: History components ───────────────────────────
export { RecentlyPlayed }   from './ui/history/RecentlyPlayed';
export type { RecentlyPlayedProps } from './ui/history/RecentlyPlayed';
export { ListeningHistory } from './ui/history/ListeningHistory';
export type { ListeningHistoryProps } from './ui/history/ListeningHistory';

// ── Lib: Utilities ───────────────────────────────────
export { formatTime, clamp, generateWaveformData, formatRelativeTime } from './lib/playbackUtils';
