'use client';

import React, { useState, useRef } from 'react';
import { CloseIcon } from '@/shared/ui/icons';

export interface TrackShareModalProps {
  open: boolean;
  onClose: () => void;
  trackTitle: string;
  trackArtist: string;
  trackArtworkUrl?: string | null;
  trackUrl: string;
  trackAge?: string;
  trackGenre?: string;
}

/* ── Shared styles ── */
const inputStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #444',
  borderRadius: 4,
  padding: '8px 12px',
  color: '#ccc',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'var(--sc-font-family)',
  width: '100%',
};

export const TrackShareModal: React.FC<TrackShareModalProps> = ({
  open,
  onClose,
  trackTitle,
  trackArtist,
  trackArtworkUrl,
  trackUrl,
  trackAge,
  trackGenre,
}) => {
  const [activeTab, setActiveTab] = useState<'Share' | 'Embed' | 'Message'>('Share');
  const linkRef = useRef<HTMLInputElement>(null);

  // Embed options
  const [embedSize, setEmbedSize] = useState<'large' | 'medium' | 'small'>('large');
  const [embedColor, setEmbedColor] = useState('#ff5500');
  const [embedHeight, setEmbedHeight] = useState('300');
  const [autoPlay, setAutoPlay] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);

  // Message
  const [messageTo, setMessageTo] = useState('');
  const [messageBody, setMessageBody] = useState('');

  if (!open) return null;

  const fullUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${trackUrl}`
    : trackUrl;

  // Initialize message body with track URL
  const messageBodyWithUrl = messageBody || fullUrl;

  const handleCopy = () => {
    if (linkRef.current) {
      linkRef.current.select();
      navigator.clipboard.writeText(fullUrl);
    }
  };

  const embedCode = `<iframe width="100%" height="${embedHeight}" scrolling="no" frameborder="no" allow="autoplay" src="${fullUrl}/embed?color=${encodeURIComponent(embedColor)}&auto_play=${autoPlay}&show_comments=${showComments}"></iframe>`;

  const colorPresets = ['#ff5500', '#333333', '#2b2b4b', '#2b4b3d', '#4b2b2b', '#2b3d4b'];

  const socialLinks = [
    {
      name: 'Twitter', color: '#1DA1F2',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(`${trackTitle} by ${trackArtist}`)}`,
    },
    {
      name: 'Facebook', color: '#1877F2',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    },
    {
      name: 'Tumblr', color: '#36465D',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M14.563 24c-5.093 0-7.031-3.756-7.031-6.411V9.747H5.116V6.648c3.63-1.313 4.512-4.596 4.71-6.469C9.84.051 9.941 0 9.999 0h3.517v6.114h4.801v3.633h-4.82v7.47c.016 1.001.375 2.371 2.207 2.371h.09c.631-.02 1.486-.205 1.936-.419l1.156 3.425c-.436.636-2.4 1.374-4.156 1.404h-.168z"/></svg>,
      url: `https://www.tumblr.com/share/link?url=${encodeURIComponent(fullUrl)}&name=${encodeURIComponent(trackTitle)}`,
    },
    {
      name: 'Pinterest', color: '#E60023',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z"/></svg>,
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(fullUrl)}&description=${encodeURIComponent(trackTitle)}`,
    },
    {
      name: 'Email', color: '#666',
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>,
      url: `mailto:?subject=${encodeURIComponent(trackTitle)}&body=${encodeURIComponent(fullUrl)}`,
    },
  ];

  /* ── Render tab content ── */
  const renderShareTab = () => (
    <>
      {/* Track Preview */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{ width: 100, height: 100, background: '#333', borderRadius: 4, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
          {trackArtworkUrl && <img src={trackArtworkUrl} alt={trackTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          <button style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#999', fontSize: 13 }}>{trackArtist}</div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>{trackTitle}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {trackGenre && <span style={{ display: 'inline-block', marginTop: 4, padding: '2px 8px', background: '#151515', border: '1px solid #333', borderRadius: 50, fontSize: 11, color: '#ccc' }}># {trackGenre}</span>}
            </div>
          </div>
          {/* Mini waveform */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 40, marginTop: 12 }}>
            {Array.from({ length: 60 }, (_, i) => {
              const h = 8 + Math.abs(Math.sin(i * 0.4) * 30) + (i % 7) * 2;
              return <div key={i} style={{ flex: 1, height: h, borderRadius: 1, background: i < 4 ? '#ff5500' : 'rgba(255,255,255,0.15)' }} />;
            })}
          </div>
        </div>
      </div>

      {/* Social links */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {socialLinks.map((link) => (
          <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" title={link.name}
            style={{ width: 48, height: 48, borderRadius: '50%', background: link.color, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'opacity 200ms' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >{link.icon}</a>
        ))}
      </div>

      {/* Copy link */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input ref={linkRef} readOnly value={fullUrl} style={inputStyle} onClick={handleCopy} />
      </div>
    </>
  );

  const renderEmbedTab = () => (
    <>
      {/* Size presets (3 artwork thumbnail variants) */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {(['large', 'medium', 'small'] as const).map((size) => (
          <button
            key={size}
            onClick={() => {
              setEmbedSize(size);
              setEmbedHeight(size === 'large' ? '300' : size === 'medium' ? '166' : '120');
            }}
            style={{
              width: 100, height: 100, borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
              border: embedSize === size ? '2px solid #fff' : '2px solid transparent',
              background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0, position: 'relative',
            }}
          >
            {trackArtworkUrl ? (
              <img src={trackArtworkUrl} alt={trackTitle}
                style={{
                  width: size === 'large' ? '100%' : size === 'medium' ? '60%' : '40%',
                  height: size === 'large' ? '100%' : size === 'medium' ? '60%' : '40%',
                  objectFit: 'cover', borderRadius: 2,
                }}
              />
            ) : (
              <div style={{
                width: size === 'large' ? '100%' : size === 'medium' ? '60%' : '40%',
                height: size === 'large' ? '100%' : size === 'medium' ? '60%' : '40%',
                background: '#555', borderRadius: 2,
              }}/>
            )}
            {/* Mini waveform overlay for medium/small */}
            {size !== 'large' && (
              <div style={{ position: 'absolute', bottom: 8, left: size === 'medium' ? '35%' : '45%', right: 8, display: 'flex', alignItems: 'flex-end', gap: 1, height: 20 }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} style={{ flex: 1, height: 4 + (i % 5) * 3, background: 'rgba(255,255,255,0.25)', borderRadius: 1 }}/>
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Code section */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Code</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input readOnly value={embedCode}
            style={{ ...inputStyle, flex: 1 }}
            onClick={(e) => { (e.target as HTMLInputElement).select(); navigator.clipboard.writeText(embedCode); }}
          />
          <a href="#" style={{ color: '#ff5500', fontSize: 12, whiteSpace: 'nowrap', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >WordPress code</a>
        </div>
      </div>

      {/* Options */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Options</div>
        {/* Color + Height row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <span style={{ color: '#999', fontSize: 13 }}>Color:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {colorPresets.map((c) => (
              <button key={c} onClick={() => setEmbedColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: 3, background: c, border: embedColor === c ? '2px solid #fff' : '2px solid transparent',
                  cursor: 'pointer', padding: 0,
                }} />
            ))}
          </div>
          <input value={embedColor} onChange={(e) => setEmbedColor(e.target.value)}
            style={{ ...inputStyle, width: 80, textAlign: 'center', fontSize: 12 }} />
          {/* Color picker dot */}
          <label style={{ width: 24, height: 24, borderRadius: '50%', background: `conic-gradient(red, yellow, lime, aqua, blue, magenta, red)`, cursor: 'pointer', display: 'block', position: 'relative', border: '2px solid #444' }}>
            <input type="color" value={embedColor} onChange={(e) => setEmbedColor(e.target.value)}
              style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
          </label>

          <span style={{ color: '#999', fontSize: 13, marginLeft: 16 }}>Height:</span>
          <select value={embedHeight} onChange={(e) => setEmbedHeight(e.target.value)}
            style={{ ...inputStyle, width: 80, padding: '4px 8px', cursor: 'pointer' }}>
            <option value="300">300px</option>
            <option value="166">166px</option>
            <option value="120">120px</option>
            <option value="450">450px</option>
          </select>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Enable automatic play', checked: autoPlay, set: setAutoPlay },
            { label: 'Show comments', checked: showComments, set: setShowComments },
            { label: 'Show recommendations', checked: showRecommendations, set: setShowRecommendations },
            { label: 'Show BioBeats overlays', checked: showOverlays, set: setShowOverlays },
          ].map(({ label, checked, set }) => (
            <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#ccc', fontSize: 13 }}>
              <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)}
                style={{ accentColor: '#ff5500', width: 16, height: 16 }} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Embed preview */}
      <div style={{ background: '#000', borderRadius: 4, overflow: 'hidden', border: '1px solid #333', marginBottom: 12 }}>
        <div style={{ position: 'relative', height: Number(embedHeight) > 200 ? 200 : Number(embedHeight), background: '#111' }}>
          {trackArtworkUrl && (
            <img src={trackArtworkUrl} alt={trackTitle}
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
          )}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: 11, opacity: 0.7 }}>{trackArtist}</div>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{trackTitle}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ color: '#999', fontSize: 9 }}>BIOBEATS</span>
                <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 2, padding: '3px 8px', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                  Share
                </button>
              </div>
            </div>
            {/* Mini waveform in preview */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 30 }}>
              {Array.from({ length: 80 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 3 + Math.abs(Math.sin(i * 0.3) * 20) + (i % 5) * 2, background: i < 5 ? embedColor : 'rgba(255,255,255,0.2)', borderRadius: 1 }}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy + Track name */}
      <a href="#" style={{ color: '#ff5500', fontSize: 11, textDecoration: 'none' }}>Privacy policy</a>
      <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>{trackArtist}  ·  {trackTitle}</div>
      <div style={{ color: '#666', fontSize: 10, marginTop: 8, lineHeight: 1.5 }}>
        This player uses cookies in accordance with our Cookies policy. We may collect usage data for analytics purposes. It is your responsibility to disclose this to visitors of any site where you embed the player.
      </div>
    </>
  );

  const renderMessageTab = () => (
    <>
      {/* To field */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
          To<span style={{ color: '#ff5500' }}>*</span>
        </label>
        <input
          value={messageTo}
          onChange={(e) => setMessageTo(e.target.value)}
          placeholder=""
          style={{ ...inputStyle, marginTop: 8 }}
        />
      </div>

      {/* Message body */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ color: '#999', fontSize: 13 }}>
          Write your message and add tracks or playlists<span style={{ color: '#ff5500' }}>*</span>
        </label>
        <textarea
          value={messageBodyWithUrl}
          onChange={(e) => setMessageBody(e.target.value)}
          style={{
            ...inputStyle,
            marginTop: 8,
            minHeight: 80,
            resize: 'vertical',
          }}
        />
      </div>

      {/* Track preview chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid #333' }}>
        <div style={{ width: 28, height: 28, borderRadius: 3, background: '#333', overflow: 'hidden', flexShrink: 0 }}>
          {trackArtworkUrl && <img src={trackArtworkUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <span style={{ color: '#999', fontSize: 13, flex: 1 }}>
          {trackArtist}  ·  {trackTitle}
        </span>
        <button
          style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
          title="Remove track"
        >×</button>
      </div>

      {/* Send button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <button
          style={{
            background: '#fff',
            color: '#333',
            border: 'none',
            borderRadius: 4,
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#eee')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
        >Send</button>
      </div>
    </>
  );

  return (
    <div
      data-testid="track-share-modal"
      style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#222', borderRadius: 8, width: '100%', maxWidth: 540, padding: 0, position: 'relative', color: '#fff', fontFamily: 'var(--sc-font-family)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#999', cursor: 'pointer', zIndex: 1 }}>
          <CloseIcon size={18} />
        </button>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 24, padding: '16px 24px 0 24px', borderBottom: '1px solid #333' }}>
          {(['Share', 'Embed', 'Message'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none',
                color: activeTab === tab ? '#fff' : '#999',
                fontSize: 18, fontWeight: 700, paddingBottom: 12, cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #fff' : '2px solid transparent',
                fontFamily: 'var(--sc-font-family)',
              }}
            >{tab}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px 24px' }}>
          {activeTab === 'Share' && renderShareTab()}
          {activeTab === 'Embed' && renderEmbedTab()}
          {activeTab === 'Message' && renderMessageTab()}
        </div>
      </div>
    </div>
  );
};
