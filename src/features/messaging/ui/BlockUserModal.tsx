'use client';

import React, { useState } from 'react';
import { CloseIcon } from '@/shared/ui/icons';
import s from './MessagesPage.module.scss';

interface BlockUserModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (options: { removeContent: boolean; reportSpam: boolean }) => void;
  displayName: string;
}

export const BlockUserModal: React.FC<BlockUserModalProps> = ({
  open,
  onClose,
  onConfirm,
  displayName,
}) => {
  const [removeContent, setRemoveContent] = useState(false);
  const [reportSpam, setReportSpam] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm({ removeContent, reportSpam });
    setRemoveContent(false);
    setReportSpam(false);
  };

  return (
    <div
      className={s.modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      data-testid="block-user-modal"
    >
      <div className={s.blockModalContent}>
        {/* Close button */}
        <button
          className={s.blockModalClose}
          onClick={onClose}
          data-testid="block-modal-close"
        >
          <CloseIcon size={20} />
        </button>

        {/* Title */}
        <h2 className={s.blockModalTitle}>Block {displayName}</h2>

        {/* Description */}
        <p className={s.blockModalDesc}>
          <strong>Blocking means that {displayName} will no longer be able to</strong>
        </p>
        <ul className={s.blockModalList}>
          <li>follow you,</li>
          <li>like your tracks,</li>
          <li>repost your tracks,</li>
          <li>send you messages,</li>
          <li>share tracks with you,</li>
          <li>post new comments on your tracks, or</li>
          <li>send you new stream or email notifications.</li>
        </ul>

        {/* Checkboxes */}
        <div className={s.blockModalCheckboxes}>
          <label className={s.blockModalCheckbox}>
            <input
              type="checkbox"
              checked={removeContent}
              onChange={(e) => setRemoveContent(e.target.checked)}
              data-testid="remove-content-checkbox"
            />
            <span>Also permanently remove this user's comments, reposts and likes of your tracks and playlists</span>
          </label>
          <label className={s.blockModalCheckbox}>
            <input
              type="checkbox"
              checked={reportSpam}
              onChange={(e) => setReportSpam(e.target.checked)}
              data-testid="report-spam-checkbox"
            />
            <span>Also report {displayName} for spam</span>
          </label>
        </div>

        {/* Footer */}
        <div className={s.blockModalFooter}>
          <button
            className={s.blockModalCancelBtn}
            onClick={onClose}
            data-testid="block-modal-cancel"
          >
            Cancel
          </button>
          <button
            className={s.blockModalConfirmBtn}
            onClick={handleConfirm}
            data-testid="block-modal-confirm"
          >
            Block {displayName}
          </button>
        </div>
      </div>
    </div>
  );
};
