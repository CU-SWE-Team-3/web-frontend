'use client';

import { type FC, useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import s from './ProfileCover.module.scss';
import ImageCropper from '@/shared/ui/ImageCropper';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

/* apiUrl is read inline from process.env.NEXT_PUBLIC_API_URL */

interface ProfileCoverProps {
  displayName: string;
  subName: string;
  location: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  onImageUploaded?: () => void;
  isOwnProfile?: boolean;
}

export const ProfileCover: FC<ProfileCoverProps> = ({
  displayName,
  subName,
  location,
  avatarUrl,
  coverUrl,
  onImageUploaded,
  isOwnProfile = true,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [cropFile, setCropFile] = useState<{ field: 'avatar' | 'cover', file: File } | null>(null);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [localPreviews, setLocalPreviews] = useState<{ avatar?: string; cover?: string }>({});

  // Dropdown state
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [coverDropdownOpen, setCoverDropdownOpen] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ field: 'avatar' | 'cover' } | null>(null);

  // Shield against backend bugs: if the backend nullifies the unmodified field during PATCH, 
  // we remember the last known good URLs.
  const [persistentAvatar, setPersistentAvatar] = useState(avatarUrl);
  const [persistentCover, setPersistentCover] = useState(coverUrl);

  useEffect(() => { if (avatarUrl) setPersistentAvatar(avatarUrl); }, [avatarUrl]);
  useEffect(() => { if (coverUrl) setPersistentCover(coverUrl); }, [coverUrl]);

  const { user, setUser } = useAuthStore();

  // Close dropdowns on outside click
  const avatarDropdownRef = useRef<HTMLDivElement>(null);
  const coverDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarDropdownRef.current && !avatarDropdownRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
      if (coverDropdownRef.current && !coverDropdownRef.current.contains(e.target as Node)) {
        setCoverDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpload = async (field: 'avatar' | 'cover', file: File | Blob) => {
    try {
      if (file instanceof Blob) {
        setLocalPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const formData = new FormData();
      
      // If it's a naked Blob (from the cropper), it lacks a filename, which many backends reject.
      if (file instanceof File) {
        formData.append(field, file);
      } else {
        formData.append(field, file, `${field}-upload.jpg`);
      }

      const response = await axios.patch(`${apiUrl}/profile/upload-images`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newCacheBuster = Date.now();
      setCacheBuster(newCacheBuster);

      const serverAvatarUrl = response.data?.data?.avatarUrl;
      const serverCoverUrl = response.data?.data?.coverUrl;

      onImageUploaded?.();

      // Update auth store unconditionally if logged in, since they are uploading from their active session
      if (user) {
        const updatedUser = { ...user };

        if (field === 'avatar') {
          updatedUser.avatarUrl = serverAvatarUrl
            ? `${serverAvatarUrl}?t=${newCacheBuster}`
            : (file instanceof Blob ? URL.createObjectURL(file) : updatedUser.avatarUrl);
        }
        if (field === 'cover') {
          updatedUser.coverUrl = serverCoverUrl
            ? `${serverCoverUrl}?t=${newCacheBuster}`
            : (file instanceof Blob ? URL.createObjectURL(file) : updatedUser.coverUrl);
        }
        setUser(updatedUser);
      }
    } catch (err) {
      console.error(`Failed to upload ${field}:`, err);
    } finally {
      setCropFile(null); // Ensure the modal closes regardless of success/failure
    }
  };

  const handleDelete = async (field: 'avatar' | 'cover') => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      // Attempt 1: Send a 0-byte file to upload-images endpoint
      const formData = new FormData();
      formData.append(field, new File([''], 'delete', { type: 'image/png' }));
      
      let serverUrl: string | undefined | null = null;
      let successDelete = false;

      try {
        const uploadRes = await axios.patch(`${apiUrl}/profile/upload-images`, formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        serverUrl = uploadRes.data?.data?.[`${field}Url`];
        // If the backend returned null or an empty string, delete succeeded
        if (!serverUrl) successDelete = true;
      } catch (err) {
        console.warn('0-byte file upload delete failed, trying update endpoint');
      }

      // Attempt 2: If the backend still returned a URL (meaning 0-byte file didn't delete it), 
      // try the standard profile update endpoint.
      if (!successDelete && serverUrl) {
        try {
          const updateRes = await axios.patch(`${apiUrl}/profile/update`, {
            [`${field}Url`]: '' 
          }, { withCredentials: true });
          // If this succeeded, let's assume it deleted
          successDelete = true;
          serverUrl = null;
        } catch (updateErr) {
          console.error('Update endpoint also failed to delete:', updateErr);
        }
      }

      // Instead of forcing null locally, we'll sync with what the server decided.
      // If serverUrl is still present and not null, we failed to delete.
      const finalUrl = serverUrl || null;

      if (field === 'avatar') {
        setPersistentAvatar(finalUrl);
        setLocalPreviews(prev => ({ ...prev, avatar: undefined }));
      } else {
        setPersistentCover(finalUrl);
        setLocalPreviews(prev => ({ ...prev, cover: undefined }));
      }

      setCacheBuster(Date.now());
      setDeleteConfirm(null);
      onImageUploaded?.();

      // Update auth store with the actual result unconditionally since they initiated the action
      if (user) {
        const updatedUser = { ...user };
        if (field === 'avatar') updatedUser.avatarUrl = finalUrl || undefined;
        if (field === 'cover') updatedUser.coverUrl = finalUrl || undefined;
        setUser(updatedUser);
      }
    } catch (err) {
      console.error(`Failed to delete ${field}:`, err);
      setDeleteConfirm(null);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCropFile({ field: 'avatar', file });
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCropFile({ field: 'cover', file });
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const hasAvatar = !!(localPreviews.avatar || persistentAvatar);
  const hasCover = !!(localPreviews.cover || persistentCover);

  const displayAvatarUrl = localPreviews.avatar
    ? localPreviews.avatar
    : (persistentAvatar ? `${persistentAvatar.split('?')[0]}?t=${cacheBuster}` : null);

  const displayCoverUrl = localPreviews.cover
    ? localPreviews.cover
    : (persistentCover ? `${persistentCover.split('?')[0]}?t=${cacheBuster}` : null);

  const handleAvatarBtnClick = () => {
    if (hasAvatar) {
      setAvatarDropdownOpen(prev => !prev);
      setCoverDropdownOpen(false);
    } else {
      avatarInputRef.current?.click();
    }
  };

  const handleCoverBtnClick = () => {
    if (hasCover) {
      setCoverDropdownOpen(prev => !prev);
      setAvatarDropdownOpen(false);
    } else {
      coverInputRef.current?.click();
    }
  };

  return (
    <section data-testid="profile-cover" className={s.cover}>
      {displayCoverUrl && (
        <img src={displayCoverUrl} alt="Cover" className={s.coverImage} />
      )}

      <div className={s.inner}>
        <div className={s.avatarBlock}>
          {displayAvatarUrl ? (
            <img
              data-testid="profile-avatar"
              src={displayAvatarUrl}
              alt={displayName}
              className={s.avatarCircle}
            />
          ) : (
            <div data-testid="profile-avatar" className={s.avatarCircle} />
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
          {isOwnProfile && (
            <div className={s.dropdownWrapper} ref={avatarDropdownRef}>
              <button
                data-testid="profile-avatar-upload-btn"
                className={s.uploadAvatarBtn}
                onClick={handleAvatarBtnClick}
              >
                {hasAvatar ? 'Update image' : 'Upload image'}
              </button>
              {avatarDropdownOpen && (
                <div className={s.dropdown}>
                  <button
                    className={s.dropdownItem}
                    onClick={() => {
                      setAvatarDropdownOpen(false);
                      avatarInputRef.current?.click();
                    }}
                  >
                    Replace image
                  </button>
                  <button
                    className={s.dropdownItem}
                    onClick={() => {
                      setAvatarDropdownOpen(false);
                      setDeleteConfirm({ field: 'avatar' });
                    }}
                  >
                    Delete image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={s.userText}>
          <h1 data-testid="profile-display-name" className={s.nameTag}>{displayName}</h1>
          <span className={s.subName}>{subName}</span>
          <span className={s.locationTag}>{location}</span>
        </div>
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleCoverChange}
      />
      {isOwnProfile && (
        <div className={s.coverDropdownWrapper} ref={coverDropdownRef}>
          <button
            data-testid="profile-cover-upload-btn"
            className={s.uploadHeaderBtn}
            onClick={handleCoverBtnClick}
          >
            {hasCover ? 'Update image' : 'Upload header image'}
          </button>
          {coverDropdownOpen && (
            <div className={s.dropdown}>
              <button
                className={s.dropdownItem}
                onClick={() => {
                  setCoverDropdownOpen(false);
                  coverInputRef.current?.click();
                }}
              >
                Replace image
              </button>
              <button
                className={s.dropdownItem}
                onClick={() => {
                  setCoverDropdownOpen(false);
                  setDeleteConfirm({ field: 'cover' });
                }}
              >
                Delete image
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className={s.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 className={s.modalTitle}>Are you sure?</h2>
            <p className={s.modalText}>
              Please confirm that you want to delete this image.<br />
              This action cannot be reversed.
            </p>
            <div className={s.modalActions}>
              <button
                className={s.modalCancelBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className={s.modalDeleteBtn}
                onClick={() => handleDelete(deleteConfirm.field)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {cropFile && (
        <ImageCropper
          imageFile={cropFile.file}
          title={displayName}
          subtitle="For best results, upload images of at least 1000x1000 pixels. 2MB file-size limit."
          aspectRatio={cropFile.field === 'cover' ? 1240 / 260 : 1}
          onClose={() => setCropFile(null)}
          onCropComplete={(blob) => handleUpload(cropFile.field, blob)}
        />
      )}
    </section>
  );
};
