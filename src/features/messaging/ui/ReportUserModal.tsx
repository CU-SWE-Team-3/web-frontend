'use client';

import React, { useState, useEffect } from 'react';
import { CloseIcon } from '@/shared/ui/icons';
import s from './MessagesPage.module.scss';

interface ReportUserModalProps {
  open: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
  displayName: string;
}

const REPORT_REASONS = [
  'Spam',
  'Impersonation',
  'Abuse',
  'Trademark infringement',
  'Other',
];

const HELP_LINKS: Record<string, string> = {
  'Impersonation': '/help/reporting-impersonation',
  'Abuse': '/help/reporting-abuse',
  'Trademark infringement': '/help/reporting-trademark-infringement',
  'Other': '/help/other',
};

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  open,
  onClose,
  onReport,
  displayName,
}) => {
  const [view, setView] = useState<'categories' | 'spam'>('categories');

  useEffect(() => {
    if (!open) {
      setTimeout(() => setView('categories'), 200); // Reset after animation
    }
  }, [open]);

  if (!open) return null;

  const handleReasonClick = (reason: string) => {
    if (reason === 'Spam') {
      setView('spam');
    } else {
      window.open(HELP_LINKS[reason] || HELP_LINKS['Other'], '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div
      className={s.modalOverlay}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      data-testid="report-user-modal"
    >
      <div className={s.reportModalContent}>
        {view === 'categories' ? (
          <>
            <button className={s.blockModalClose} onClick={onClose} data-testid="report-modal-close">
              <CloseIcon size={20} />
            </button>
            <h2 className={s.reportModalTitle}>Report account for</h2>
            <div className={s.reportReasons}>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  className={s.reportReasonLink}
                  onClick={() => handleReasonClick(reason)}
                  data-testid={`report-reason-${reason.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className={s.reportDisclaimer}>
              <h3 className={s.reportDisclaimerTitle}>Disclaimer</h3>
              <p className={s.reportDisclaimerText}>
                Reported accounts are reviewed by a specialist team who take action if the account's
                content or activity violates our{' '}
                <a href="#" className={s.reportDisclaimerLink}>Guidelines</a>{' '}or{' '}
                <a href="#" className={s.reportDisclaimerLink}>Terms</a>.
                {' '}Repeated violation or serious breaches can result in the permanent deletion of accounts.
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className={s.reportModalTitle}>Report Spam</h2>
            <div className={s.blockModalDesc}>
              <strong>Reporting {displayName} for spam:</strong>
            </div>
            <ul className={s.blockModalList}>
              <li>Removes their comments, reposts and likes from your tracks and playlists</li>
              <li>Blocks them from interacting with you</li>
              <li>Sends BioBeats a spam report</li>
            </ul>
            <div className={s.blockModalFooter} style={{ marginTop: '32px' }}>
              <button
                className={s.blockModalCancelBtn}
                onClick={onClose}
                data-testid="report-spam-cancel"
              >
                Cancel
              </button>
              <button
                className={s.blockModalConfirmBtn}
                onClick={() => {
                  onReport('spam');
                  onClose();
                }}
                data-testid="report-spam-confirm"
              >
                Report spam
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
