'use client';

import { type FC, useState, type FormEvent } from 'react';
import { Globe, Lock } from 'lucide-react';
import { AppModal, AppButton, AppInput } from '@/shared/ui';
import { AvatarUpload } from './AvatarUpload';
import { CoverUpload } from './CoverUpload';
import { GenreTagInput } from './GenreTagInput';
import { RoleSelector } from './RoleSelector';
import s from './EditProfileForm.module.scss';

interface ProfileFormData {
  displayName: string;
  bio: string;
  country: string;
  city: string;
  genres: string[];
  instagram: string;
  twitter: string;
  website: string;
  role: 'artist' | 'listener';
  isPrivate: boolean;
}

export interface EditProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ProfileFormData;
  currentAvatarUrl: string | null;
  currentCoverUrl: string | null;
  displayName: string;
  onSaved: () => void;
}

export const EditProfileForm: FC<EditProfileFormProps> = ({
  open,
  onOpenChange,
  initialData,
  currentAvatarUrl,
  currentCoverUrl,
  displayName,
  onSaved,
}) => {
  const [form, setForm] = useState<ProfileFormData>(initialData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverSelect = (file: File) => {
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const update = (patch: Partial<ProfileFormData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      onSaved();
      onOpenChange(false);
    } catch {
      /* handle error silently or toast */
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal open={open} onOpenChange={onOpenChange} title="Edit Profile" size="lg">
      <form data-testid="edit-profile-form" className={s.form} onSubmit={handleSubmit}>
        <div className={s.uploads}>
          <AvatarUpload
            currentSrc={currentAvatarUrl}
            previewUrl={avatarPreview}
            name={displayName}
            onFileSelect={handleAvatarSelect}
          />
          <CoverUpload
            currentSrc={currentCoverUrl}
            previewUrl={coverPreview}
            onFileSelect={handleCoverSelect}
          />
        </div>

        <hr className={s.divider} />

        <AppInput
          label="Display Name"
          value={form.displayName}
          onChange={(e) => update({ displayName: e.target.value })}
        />
        <div className={s.row}>
          <AppInput
            label="City"
            value={form.city}
            onChange={(e) => update({ city: e.target.value })}
          />
          <AppInput
            label="Country"
            value={form.country}
            onChange={(e) => update({ country: e.target.value })}
          />
        </div>

        <div>
          <span className={s.sectionLabel}>Bio</span>
          <textarea
            className={s.textarea}
            value={form.bio}
            onChange={(e) => update({ bio: e.target.value })}
            placeholder="Tell the world about yourself…"
            maxLength={300}
          />
        </div>

        <hr className={s.divider} />
        <GenreTagInput genres={form.genres} onChange={(genres) => update({ genres })} />

        <hr className={s.divider} />
        <span className={s.sectionLabel}>Social Links</span>
        <AppInput label="Instagram URL" value={form.instagram} onChange={(e) => update({ instagram: e.target.value })} placeholder="https://instagram.com/..." />
        <AppInput label="Twitter URL" value={form.twitter} onChange={(e) => update({ twitter: e.target.value })} placeholder="https://twitter.com/..." />
        <AppInput label="Website URL" value={form.website} onChange={(e) => update({ website: e.target.value })} placeholder="https://..." />

        <hr className={s.divider} />
        <span className={s.sectionLabel}>Account Type</span>
        <RoleSelector role={form.role} onChange={(role) => update({ role })} />

        <div
          className={s.privacyToggle}
          onClick={() => update({ isPrivate: !form.isPrivate })}
          role="switch"
          aria-checked={form.isPrivate}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') update({ isPrivate: !form.isPrivate }); }}
        >
          {form.isPrivate ? <Lock size={20} /> : <Globe size={20} />}
          <div className={s.privacyInfo}>
            <div className={s.privacyLabel}>{form.isPrivate ? 'Private' : 'Public'}</div>
            <div className={s.privacyHint}>{form.isPrivate ? 'Only approved followers can see your content' : 'Anyone can view your profile'}</div>
          </div>
        </div>

        <div className={s.footer}>
          <AppButton type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</AppButton>
          <AppButton type="submit" loading={saving}>Save Changes</AppButton>
        </div>
      </form>
    </AppModal>
  );
};
