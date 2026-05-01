'use client';

import React from 'react';
import { AppModal, EmptyState, LikeIcon, RepostIcon } from '@/shared/ui';
import { useTrackLikers } from '../model/useTrackLikers';
import { useTrackReposters } from '../model/useTrackReposters';
import { EngagementUserItem } from './EngagementUserItem';
import s from './EngagementListModal.module.scss';

export type EngagementType = 'likes' | 'reposts';

interface EngagementListModalProps {
  trackId: string;
  type: EngagementType;
  isOpen: boolean;
  onClose: () => void;
}

export const EngagementListModal = ({
  trackId,
  type,
  isOpen,
  onClose,
}: EngagementListModalProps) => {
  // Select data hook based on type
  const likesData = useTrackLikers(trackId);
  const repostsData = useTrackReposters(trackId);

  const query = type === 'likes' ? likesData : repostsData;
  const rawData = query.data as any;
  const users = Array.isArray(rawData) ? rawData : (rawData?.users || []);
  const isLoading = query.isLoading;

  const title = type === 'likes' ? 'Likes' : 'Reposts';
  const emptyIcon = type === 'likes' ? <LikeIcon size={48} /> : <RepostIcon size={48} />;

  return (
    <AppModal
      data-testid="engagement-list-modal"
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      size="sm"
      className={s.modal}
    >
      <div data-testid="engagement-list-content" className={s.content}>
        {isLoading ? (
          <div data-testid="engagement-list-loading" className={s.loadingArea}>
            <div className={s.spinner} />
            <span>Loading {type}...</span>
          </div>
        ) : !users || users.length === 0 ? (
          <div data-testid="engagement-list-empty">
            <EmptyState
              title={`No ${type} yet`}
              description={`When people ${type === 'likes' ? 'like' : 'repost'} this track, they will appear here.`}
              icon={emptyIcon}
              className={s.empty}
            />
          </div>
        ) : (
          <div data-testid="engagement-list-items" className={s.list}>
            {users.map((user: any, index: number) => {
              const userKey = user.id || user._id || user.permalink || `engagement-user-${index}`;

              return (
              <div data-testid={`engagement-item-${userKey}`} key={userKey}>
                <EngagementUserItem user={user} />
              </div>
              );
            })}
          </div>
        )}
      </div>
    </AppModal>
  );
};
