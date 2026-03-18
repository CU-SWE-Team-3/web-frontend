'use client';

import { type FC, useState } from 'react';
import s from './ShareModal.module.scss';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  profileUrl: string;
}

type TabType = 'share' | 'message';

export const ShareModal: FC<ShareModalProps> = ({
  open,
  onClose,
  profileUrl,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('share');
  const fullUrl = `https://biobeats.com/${profileUrl}?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing`;

  if (!open) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Tabs */}
        <div className={s.tabsHeader}>
          <button
            className={`${s.tab} ${activeTab === 'share' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('share')}
          >
            Share
          </button>
          <button
            className={`${s.tab} ${activeTab === 'message' ? s.tabActive : ''}`}
            onClick={() => setActiveTab('message')}
          >
            Message
          </button>
        </div>

        {/* Share Panel */}
        {activeTab === 'share' && (
          <div className={s.sharePanel}>
            <div className={s.socialRow}>
              <button className={`${s.socialBtn} ${s.twitter}`} aria-label="Share on Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </button>
              <button className={`${s.socialBtn} ${s.facebook}`} aria-label="Share on Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>
              <button className={`${s.socialBtn} ${s.tumblr}`} aria-label="Share on Tumblr">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.168z" />
                </svg>
              </button>
              <button className={`${s.socialBtn} ${s.pinterest}`} aria-label="Share on Pinterest">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
                </svg>
              </button>
              <button className={`${s.socialBtn} ${s.email}`} aria-label="Share via Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </button>
            </div>

            <div className={s.urlRow}>
              <input
                className={s.urlInput}
                value={fullUrl}
                readOnly
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>

            <div className={s.shortenRow}>
              <input type="checkbox" className={s.checkbox} id="shorten-link" />
              <label htmlFor="shorten-link" className={s.shortenLabel}>Shorten link</label>
            </div>
          </div>
        )}

        {/* Message Panel */}
        {activeTab === 'message' && (
          <div className={s.messagePanel}>
            <label className={s.fieldLabel}>
              To<span className={s.required}>*</span>
            </label>
            <input className={s.toInput} placeholder="" />

            <label className={s.fieldLabel}>
              Write your message and add tracks or playlists<span className={s.required}>*</span>
            </label>
            <textarea
              className={s.messageTextarea}
              defaultValue={`https://biobeats.com/${profileUrl}`}
            />

            <div className={s.sendRow}>
              <button className={s.sendBtn}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
