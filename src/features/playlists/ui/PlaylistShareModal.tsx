'use client';

import { type FC, useState, useCallback, useEffect } from 'react';
import { AppModal } from '@/shared/ui/AppModal';
import { playlistsRepository } from '../api/playlistsRepository';
import type { Playlist } from '../model/playlist';
import s from './PlaylistShareModal.module.scss';

type ShareTab = 'link' | 'embed';

interface PlaylistShareModalProps {
  open: boolean;
  onClose: () => void;
  playlist: Playlist;
}

export const PlaylistShareModal: FC<PlaylistShareModalProps> = ({
  open,
  onClose,
  playlist,
}) => {
  const [activeTab, setActiveTab] = useState<ShareTab>('link');
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [embedCopied, setEmbedCopied] = useState(false);
  const [embedLoading, setEmbedLoading] = useState(false);

  const playlistUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/playlist/${playlist._id}${playlist.isPrivate && playlist.secretToken ? `?secretToken=${playlist.secretToken}` : ''}`
    : '';

  // Fetch embed code when switching to embed tab
  useEffect(() => {
    if (activeTab !== 'embed' || embedCode || embedLoading) return;

    setEmbedLoading(true);
    playlistsRepository
      .getEmbed(playlist._id, playlist.isPrivate ? playlist.secretToken : undefined)
      .then((data) => setEmbedCode(data.iframeCode || ''))
      .catch((err) => {
        console.warn('[PlaylistShareModal] Embed fetch failed:', err);
        setEmbedCode('<!-- Embed not available -->');
      })
      .finally(() => setEmbedLoading(false));
  }, [activeTab, playlist._id, playlist.isPrivate, playlist.secretToken, embedCode, embedLoading]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setActiveTab('link');
      setLinkCopied(false);
      setEmbedCode('');
      setEmbedCopied(false);
    }
  }, [open]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(playlistUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [playlistUrl]);

  const handleCopyEmbed = useCallback(() => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    });
  }, [embedCode]);

  return (
    <AppModal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      size="md"
      title={`Share "${playlist.title}"`}
    >
      <div className={s.share}>
        {/* Tab Switcher */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${activeTab === 'link' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('link')}
            data-testid="share-tab-link"
          >
            Link
          </button>
          <button
            className={`${s.tab} ${activeTab === 'embed' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('embed')}
            data-testid="share-tab-embed"
          >
            Embed
          </button>
        </div>

        {/* Link Tab */}
        {activeTab === 'link' && (
          <div className={s.tabContent}>
            <label className={s.fieldLabel}>Playlist link</label>
            <div className={s.linkRow}>
              <input
                type="text"
                className={s.linkInput}
                value={playlistUrl}
                readOnly
                data-testid="share-link-input"
              />
              <button
                className={s.copyBtn}
                onClick={handleCopyLink}
                data-testid="share-copy-link"
              >
                {linkCopied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {playlist.isPrivate && (
              <p className={s.privacyNote}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" />
                </svg>
                This link includes your secret token for private access.
              </p>
            )}
          </div>
        )}

        {/* Embed Tab */}
        {activeTab === 'embed' && (
          <div className={s.tabContent}>
            <label className={s.fieldLabel}>Embed code</label>
            {embedLoading ? (
              <div className={s.embedLoading}>Loading embed code...</div>
            ) : (
              <>
                <textarea
                  className={s.embedTextarea}
                  value={embedCode}
                  readOnly
                  rows={4}
                  data-testid="share-embed-textarea"
                />
                <button
                  className={s.copyBtn}
                  onClick={handleCopyEmbed}
                  data-testid="share-copy-embed"
                >
                  {embedCopied ? '✓ Copied' : 'Copy embed code'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </AppModal>
  );
};
