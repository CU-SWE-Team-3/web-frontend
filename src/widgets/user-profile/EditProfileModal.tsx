'use client';

import { type FC, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { CloseIcon } from '@/shared/ui/icons';
import s from './EditProfileModal.module.scss';

/* apiUrl is read inline from process.env.NEXT_PUBLIC_API_URL */

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Sync state when modal opens or profile data changes after re-fetch
  useEffect(() => {
    console.log('[EditProfileModal useEffect] open:', open, 'profile:', JSON.stringify(profile, null, 2));
    if (open) {
      setDisplayName(profile.displayName);
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setCity(profile.city);
      setCountry(profile.country);
      setBio(profile.bio || '');
      setGenresStr((profile.genres || []).join(', '));
      setSocialLinks(profile.socialLinks || []);
      setIsPrivate(!!profile.isPrivate);
      setAvatarPreview(profile.avatarUrl || null);
      setAvatarFile(null);
      setError(null);
    }
  }, [open, profile.avatarUrl, profile.displayName, profile.bio, profile.city, profile.country, profile.firstName, profile.lastName, JSON.stringify(profile.genres), JSON.stringify(profile.socialLinks), profile.isPrivate]);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const parsedGenres = genresStr.split(',').map(g => g.trim()).filter(Boolean);

      // Build the displayName: if firstName/lastName were edited, combine them
      // The API only stores displayName (no separate first/last), so we merge them
      let finalDisplayName = displayName;
      if (firstName || lastName) {
        const combined = [firstName, lastName].filter(Boolean).join(' ');
        if (combined && combined !== displayName) {
          finalDisplayName = combined;
        }
      }

      const payload = {
        displayName: finalDisplayName,
        bio,
        country,
        city,
        genres: parsedGenres,
      };
      console.log('[EditProfileModal handleSave] Sending PATCH /profile/update with payload:', JSON.stringify(payload, null, 2));

      // 1. Update profile fields
      const updateRes = await axios.patch(
        `${apiUrl}/profile/update`,
        payload,
        { withCredentials: true }
      );
      console.log('[EditProfileModal handleSave] /profile/update response:', updateRes.status, JSON.stringify(updateRes.data, null, 2));

      // 2. Upload avatar if changed
      let newAvatarUrl: string | undefined;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const uploadRes = await axios.patch(`${apiUrl}/profile/upload-images`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        newAvatarUrl = uploadRes.data?.data?.avatarUrl;
        console.log('[EditProfileModal handleSave] Avatar uploaded, newAvatarUrl:', newAvatarUrl);
      }

      // 3. Update privacy if changed
      if (isPrivate !== !!profile.isPrivate) {
        try {
          await axios.patch(`${apiUrl}/profile/privacy`, { isPrivate }, { withCredentials: true });
        } catch (privErr) {
          console.warn('[EditProfileModal handleSave] Privacy update failed:', privErr);
        }
      }

      // 4. Update social links if changed
      const validLinks = socialLinks.filter(l => l.platform && l.url);
      if (validLinks.length > 0) {
        try {
          await axios.patch(`${apiUrl}/profile/social-links`, { socialLinks: validLinks }, { withCredentials: true });
        } catch (linksErr) {
          console.warn('[EditProfileModal handleSave] Social links update failed:', linksErr);
        }
      }

      // 5. Update auth store with ALL saved fields so the profile page reflects changes immediately
      const { user, setUser } = useAuthStore.getState();
      if (user) {
        const updatedUser = {
          ...user,
          displayName: finalDisplayName,
          bio,
          country,
          city,
          genres: parsedGenres,
          avatarUrl: newAvatarUrl
            ? `${newAvatarUrl}?t=${Date.now()}`
            : avatarFile && avatarPreview
              ? avatarPreview
              : user.avatarUrl,
        };
        console.log('[EditProfileModal handleSave] Updating auth store with:', JSON.stringify(updatedUser, null, 2));
        setUser(updatedUser as any);
      }

      // 6. Re-fetch profile page data and close modal
      onSaved?.();
      onClose();
    } catch (err: any) {
      console.error('[EditProfileModal handleSave] ERROR:', err.response?.status, err.response?.data);
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to save profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div data-testid="edit-profile-modal" className={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={s.header}>
          <h2 className={s.title}>Edit your Profile</h2>
          <button data-testid="edit-profile-close-btn" className={s.closeBtn} onClick={onClose} aria-label="Close">
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
                data-testid="edit-profile-avatar-upload"
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
                  data-testid="edit-profile-displayname"
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
          <button data-testid="edit-profile-cancel-btn" className={s.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            data-testid="edit-profile-save-btn"
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
