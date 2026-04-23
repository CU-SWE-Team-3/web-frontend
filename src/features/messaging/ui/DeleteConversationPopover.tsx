'use client';

import React, { useState, useRef, useEffect } from 'react';
import s from './MessagesPage.module.scss';

interface DeleteConversationPopoverProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reportSpam: boolean) => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export const DeleteConversationPopover: React.FC<DeleteConversationPopoverProps> = ({
  open,
  onClose,
  onConfirm,
  anchorRef,
}) => {
  const [reportSpam, setReportSpam] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(reportSpam);
    setReportSpam(false);
  };

  return (
    <div
      ref={popoverRef}
      className={s.deletePopover}
      data-testid="delete-conversation-popover"
    >
      {/* Arrow */}
      <div className={s.deletePopoverArrow} />

      <h3 className={s.deletePopoverTitle}>Are you sure?</h3>
      <p className={s.deletePopoverText}>
        Archiving a conversation removes it from your messages and will be restored if you contact this user again.
      </p>

      <label className={s.deletePopoverCheckbox}>
        <input
          type="checkbox"
          checked={reportSpam}
          onChange={(e) => setReportSpam(e.target.checked)}
          data-testid="archive-report-spam-checkbox"
        />
        <span>Also report conversation as spam</span>
      </label>

      <div className={s.deletePopoverFooter}>
        <button
          className={s.deletePopoverCancelBtn}
          onClick={onClose}
          data-testid="archive-cancel"
        >
          Cancel
        </button>
        <button
          className={s.deletePopoverArchiveBtn}
          onClick={handleConfirm}
          data-testid="archive-confirm"
        >
          Archive
        </button>
      </div>
    </div>
  );
};
