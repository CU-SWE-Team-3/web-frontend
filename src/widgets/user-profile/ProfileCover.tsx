'use client';

import { type FC, useRef } from 'react';
import axios from 'axios';
import s from './ProfileCover.module.scss';

/* apiUrl is read inline from process.env.NEXT_PUBLIC_API_URL */

interface ProfileCoverProps {
  displayName: string;
  subName: string;
  location: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  onImageUploaded?: () => void;
}

export const ProfileCover: FC<ProfileCoverProps> = ({
  displayName,
  subName,
  location,
  avatarUrl,
  coverUrl,
  onImageUploaded,
}) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (field: 'avatar' | 'cover', file: File) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const formData = new FormData();
      formData.append(field, file);
      await axios.patch(`${apiUrl}/profile/upload-images`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onImageUploaded?.();
    } catch (err) {
      console.error(`Failed to upload ${field}:`, err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload('avatar', file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload('cover', file);
  };

  return (
    <section data-testid="profile-cover" className={s.cover}>
      {coverUrl && (
        <img src={coverUrl} alt="Cover" className={s.coverImage} />
      )}

      <div className={s.inner}>
        <div className={s.avatarBlock}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className={s.avatarCircle}
            />
          ) : (
            <div className={s.avatarCircle} />
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
          <button
            data-testid="profile-avatar-upload-btn"
            className={s.uploadAvatarBtn}
            onClick={() => avatarInputRef.current?.click()}
          >
            Upload image
          </button>
        </div>

        <div className={s.userText}>
          <h1 className={s.nameTag}>{displayName}</h1>
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
      <button
        data-testid="profile-cover-upload-btn"
        className={s.uploadHeaderBtn}
        onClick={() => coverInputRef.current?.click()}
      >
        Upload header image
      </button>
    </section>
  );
};
