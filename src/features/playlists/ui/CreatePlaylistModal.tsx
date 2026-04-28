'use client';

import { type FC, useState, useEffect } from 'react';
import { AppModal } from '@/shared/ui/AppModal';
import { useCreatePlaylist } from '../model/playlistQueries';
import type { CreatePlaylistInput } from '../model/playlist';
import s from './CreatePlaylistModal.module.scss';

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePlaylistModal: FC<CreatePlaylistModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const createPlaylist = useCreatePlaylist();

  useEffect(() => {
    if (!open) {
      setNewTitle('');
      setIsPrivate(false);
    }
  }, [open]);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createPlaylist.mutate(
      { title: newTitle.trim(), isPrivate, releaseType: 'playlist' } as CreatePlaylistInput,
      {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <AppModal open={open} onOpenChange={(v) => !v && onClose()} size="sm">
      <div className={s.modal}>
        <div className={s.header}>
          <h2 className={s.title}>Create a playlist</h2>
        </div>
        <div className={s.body}>
          <div className={s.createForm}>
            <label className={s.fieldLabel}>
              Playlist title <span className={s.required}>*</span>
            </label>
            <input
              type="text"
              className={s.titleInput}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              data-testid="create-playlist-title"
            />

            <div className={s.privacyRow}>
              <span className={s.privacyLabel}>Privacy:</span>
              <label className={s.radioLabel}>
                <input
                  type="radio"
                  name="create-generic-privacy"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className={s.radio}
                />
                Public
              </label>
              <label className={s.radioLabel}>
                <input
                  type="radio"
                  name="create-generic-privacy"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className={s.radio}
                />
                Private
              </label>

              <button
                className={s.saveBtn}
                onClick={handleCreate}
                disabled={!newTitle.trim() || createPlaylist.isPending}
                data-testid="create-playlist-save"
              >
                {createPlaylist.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
};
