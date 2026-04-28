// ─── Public API for the playlists feature ────────────────────────────────────
// Other parts of the app should only import from this file.

export * from './model/playlist';
export * from './model/playlistQueries';
export { playlistsRepository } from './api/playlistsRepository';

// UI Components
export { CreatePlaylistModal } from './ui/CreatePlaylistModal';
export { EditPlaylistModal } from './ui/EditPlaylistModal';
export { AddToPlaylistModal } from './ui/AddToPlaylistModal';
export { PlaylistDetailHeader } from './ui/PlaylistDetailHeader';
export { PlaylistTrackList } from './ui/PlaylistTrackList';
export { TrackPickerModal } from './ui/TrackPickerModal';
export { PlaylistShareModal } from './ui/PlaylistShareModal';
export { DeletePlaylistDialog } from './ui/DeletePlaylistDialog';
export { PlaylistGridCard } from './ui/PlaylistGridCard';
export { PlaylistStreamCard } from './ui/PlaylistStreamCard';
