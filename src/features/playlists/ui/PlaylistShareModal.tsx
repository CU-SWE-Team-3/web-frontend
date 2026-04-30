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
  shareUrl?: string;
  entityLabel?: string;
  embedEnabled?: boolean;
}

export const PlaylistShareModal: FC<PlaylistShareModalProps> = ({
  open,
  onClose,
  playlist,
  shareUrl,
  entityLabel = 'Playlist',
  embedEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<ShareTab>('link');
  const [linkCopied, setLinkCopied] = useState(false);
  const [embedCode, setEmbedCode] = useState('');
  const [embedCopied, setEmbedCopied] = useState(false);
  const [embedLoading, setEmbedLoading] = useState(false);

  const playlistUrl = shareUrl || (typeof window !== 'undefined'
    ? `${window.location.origin}/playlist/${playlist._id}${playlist.isPrivate && playlist.secretToken ? `?secretToken=${playlist.secretToken}` : ''}`
    : '');
  const creatorName = typeof playlist.creator === 'string'
    ? playlist.creator
    : playlist.creator.displayName || playlist.creator.permalink || 'Unknown creator';
  const shareText = `${playlist.title} by ${creatorName}`;
  const socialLinks = [
    {
      name: 'Twitter',
      className: s.twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(playlistUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 01-1.93.07 4.28 4.28 0 004 2.98 8.521 8.521 0 01-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      className: s.facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(playlistUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'Tumblr',
      className: s.tumblr,
      url: `https://www.tumblr.com/share/link?url=${encodeURIComponent(playlistUrl)}&name=${encodeURIComponent(playlist.title)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.168z" />
        </svg>
      ),
    },
    {
      name: 'Pinterest',
      className: s.pinterest,
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(playlistUrl)}&description=${encodeURIComponent(shareText)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      className: s.email,
      url: `mailto:?subject=${encodeURIComponent(playlist.title)}&body=${encodeURIComponent(playlistUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
  ];

  // Fetch embed code when switching to embed tab
  useEffect(() => {
    if (!embedEnabled || activeTab !== 'embed' || embedCode || embedLoading) return;

    setEmbedLoading(true);
    playlistsRepository
      .getEmbed(playlist._id, playlist.isPrivate ? playlist.secretToken : undefined)
      .then((data) => setEmbedCode(data.iframeCode || ''))
      .catch((err) => {
        console.warn('[PlaylistShareModal] Embed fetch failed:', err);
        setEmbedCode('<!-- Embed not available -->');
      })
      .finally(() => setEmbedLoading(false));
  }, [activeTab, playlist._id, playlist.isPrivate, playlist.secretToken, embedCode, embedLoading, embedEnabled]);

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
    if (!playlistUrl) return;
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
            type="button"
            className={`${s.tab} ${activeTab === 'link' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('link')}
            data-testid="share-tab-link"
          >
            Share
          </button>
          {embedEnabled && (
            <button
              type="button"
              className={`${s.tab} ${activeTab === 'embed' ? s.tabActive : ''}`}
              onClick={() => setActiveTab('embed')}
              data-testid="share-tab-embed"
            >
              Embed
            </button>
          )}
        </div>

        {/* Link Tab */}
        {activeTab === 'link' && (
          <div className={s.tabContent}>
            <div className={s.preview}>
              <div className={s.artwork}>
                {playlist.artworkUrl ? (
                  <img src={playlist.artworkUrl} alt={playlist.title} className={s.artworkImg} />
                ) : (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" opacity="0.35">
                    <path d="M9 18V5l12-2v13M6 18a3 3 0 100-6 3 3 0 000 6zM18 16a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                )}
              </div>
              <div className={s.previewText}>
                <span className={s.creator}>{creatorName}</span>
                <strong className={s.playlistTitle}>{playlist.title}</strong>
              </div>
            </div>

            <div className={s.socialRow}>
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${s.socialBtn} ${link.className}`}
                  aria-label={`Share on ${link.name}`}
                  data-testid={link.name === 'Facebook' ? 'playlist-share-facebook-button' : undefined}
                  title={link.name}
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.icon}
                </a>
              ))}
            </div>

            <label className={s.fieldLabel}>{entityLabel} link</label>
            <div className={s.linkRow}>
              <input
                type="text"
                className={s.linkInput}
                value={playlistUrl}
                readOnly
                data-testid="share-link-input"
              />
              <button
                type="button"
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
                  type="button"
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
