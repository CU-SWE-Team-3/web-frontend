'use client';

import { type FC, useState, useRef } from 'react';
import axios from 'axios';
import { CloseIcon } from '@/shared/ui/icons';
import s from './EditProfileModal.module.scss';

const apiUrl = '/api/proxy';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  profile: {
    displayName: string;
    firstName: string;
    lastName: string;
    city: string;
    country: string;
    bio: string;
    profileUrl: string;
    avatarUrl?: string | null;
    genres?: string[];
    socialLinks?: { platform: string; url: string }[];
    isPrivate?: boolean;
  };
}

export const EditProfileModal: FC<EditProfileModalProps> = ({
  open,
  onClose,
  onSaved,
  profile,
}) => {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [city, setCity] = useState(profile.city);
  const [country, setCountry] = useState(profile.country);
  const [bio, setBio] = useState(profile.bio || '');
  const [genresStr, setGenresStr] = useState((profile.genres || []).join(', '));
  const [socialLinks, setSocialLinks] = useState(profile.socialLinks || []);
  const [isPrivate, setIsPrivate] = useState(!!profile.isPrivate);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatarUrl || null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  if (!open) return null;

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // 1. Update profile fields
      await axios.patch(
        `${apiUrl}/profile/update`,
        {
          displayName,
          bio,
          country,
          city,
          genres: genresStr.split(',').map(s => s.trim()).filter(Boolean),
          socialLinks,
          isPrivate
        },
        { withCredentials: true }
      );

      // 2. Upload avatar if changed
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await axios.patch(`${apiUrl}/profile/upload-images`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSaved?.();
      onClose();
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to save profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.header}>
          <h2 className={s.title}>Edit your Profile</h2>
          <button className={s.closeBtn} onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={s.body}>
          {error && <div className={s.errorMsg}>{error}</div>}

          <div className={s.topSection}>
            {/* Avatar */}
            <div className={s.avatarArea}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={displayName}
                  className={s.avatarPreview}
                />
              ) : (
                <div className={s.avatarPreview} />
              )}
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarSelect}
              />
              <button
                className={s.uploadImgBtn}
                onClick={() => avatarFileRef.current?.click()}
              >
                Upload image
              </button>
            </div>

            {/* Fields */}
            <div className={s.fields}>
              {/* Display name */}
              <div>
                <label className={s.fieldLabel}>
                  Display name<span className={s.required}>*</span>
                </label>
                <input
                  className={s.fieldInput}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              {/* Profile URL */}
              <div>
                <label className={s.fieldLabel}>
                  Profile URL<span className={s.required}>*</span>
                </label>
                <input
                  className={s.fieldInputReadonly}
                  value={`biobeats.com/ ${profile.profileUrl}`}
                  readOnly
                />
              </div>

              {/* First / Last name */}
              <div className={s.row}>
                <div className={s.col}>
                  <label className={s.fieldLabel}>First name</label>
                  <input
                    className={s.fieldInput}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className={s.col}>
                  <label className={s.fieldLabel}>Last name</label>
                  <input
                    className={s.fieldInput}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              {/* City / Country */}
              <div className={s.row}>
                <div className={s.col}>
                  <label className={s.fieldLabel}>City</label>
                  <input
                    className={s.fieldInput}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className={s.col}>
                  <label className={s.fieldLabel}>Country</label>
                  <input
                    className={s.fieldInput}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className={s.fieldLabel}>Bio</label>
                <textarea
                  className={s.textarea}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the world a little bit about yourself. The shorter the better."
                />
              </div>

              {/* Genres */}
              <div>
                <label className={s.fieldLabel}>Favorite Genres</label>
                <input
                  className={s.fieldInput}
                  value={genresStr}
                  onChange={(e) => setGenresStr(e.target.value)}
                  placeholder="e.g. Hip Hop, R&B, Electronic (comma separated)"
                />
              </div>

              {/* Privacy */}
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="privacyToggle"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={{ accentColor: '#ff5500', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="privacyToggle" className={s.fieldLabel} style={{ marginBottom: 0, cursor: 'pointer' }}>
                  Make my profile private
                </label>
              </div>
            </div>
          </div>

          {/* Links section */}
          <div className={s.linksSection}>
            <div className={s.linksHead}>
              <span className={s.linksTitle}>Your links</span>
              <span className={s.linksInfoIcon}>ⓘ</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {socialLinks.map((link, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className={s.fieldInput}
                    placeholder="Platform (twitter)"
                    value={link.platform}
                    onChange={(e) => {
                      const newLinks = [...socialLinks];
                      newLinks[i].platform = e.target.value;
                      setSocialLinks(newLinks);
                    }}
                    style={{ flex: 1 }}
                  />
                  <input
                    className={s.fieldInput}
                    placeholder="URL (https://...)"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...socialLinks];
                      newLinks[i].url = e.target.value;
                      setSocialLinks(newLinks);
                    }}
                    style={{ flex: 2 }}
                  />
                  <button onClick={() => setSocialLinks(socialLinks.filter((_, idx) => idx !== i))} style={{ padding: '0 8px', background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                </div>
              ))}
            </div>

            <div className={s.linkBtns}>
              <button 
                className={s.addLinkBtn} 
                onClick={() => setSocialLinks([...socialLinks, { platform: '', url: '' }])}
              >
                Add link
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={s.footer}>
          <button className={s.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={s.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
