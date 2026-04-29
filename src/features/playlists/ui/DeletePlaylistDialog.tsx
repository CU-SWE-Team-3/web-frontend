'use client';

import { type FC } from 'react';
import { AppModal } from '@/shared/ui/AppModal';
import s from './DeletePlaylistDialog.module.scss';

interface DeletePlaylistDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playlistTitle: string;
  isLoading?: boolean;
}

export const DeletePlaylistDialog: FC<DeletePlaylistDialogProps> = ({
  open,
  onClose,
  onConfirm,
  playlistTitle,
  isLoading,
}) => {
  return (
    <AppModal
      open={open}
      onOpenChange={(v) => !v && onClose()}
      size="sm"
      title="Delete Playlist"
    >
      <div className={s.dialog}>
        <p className={s.message}>
          Are you sure you want to permanently delete{' '}
          <strong>&ldquo;{playlistTitle}&rdquo;</strong>? This action cannot be
          undone.
        </p>

        <div className={s.actions}>
          <button
            className={s.cancelBtn}
            onClick={onClose}
            disabled={isLoading}
            data-testid="delete-playlist-cancel"
          >
            Cancel
          </button>
          <button
            className={s.deleteBtn}
            onClick={onConfirm}
            disabled={isLoading}
            data-testid="delete-playlist-confirm"
          >
            {isLoading ? <span className={s.spinner} /> : 'Delete'}
          </button>
        </div>
      </div>
    </AppModal>
  );
};
