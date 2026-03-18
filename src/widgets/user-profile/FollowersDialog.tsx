'use client';

import { type FC, useState, useEffect, useCallback } from 'react';
import { AppModal, UserAvatar, FollowButton } from '@/shared/ui';
import s from './FollowersDialog.module.scss';

interface FollowerUser {
  _id: string;
  permalink: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface FollowersDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FollowersDialog: FC<FollowersDialogProps> = ({
  userId,
  open,
  onOpenChange,
}) => {
  const [followers, setFollowers] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    try {
      const mockFollowers = [
        { _id: '1', permalink: 'alice', displayName: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?img=1', isFollowing: true },
        { _id: '2', permalink: 'bob', displayName: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?img=2', isFollowing: false },
        { _id: '3', permalink: 'charlie', displayName: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?img=3', isFollowing: false },
      ];
      await new Promise(resolve => setTimeout(resolve, 400));
      setFollowers(mockFollowers);
    } catch {
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) fetchFollowers();
  }, [open, fetchFollowers]);

  const handleFollowToggle = async (targetId: string, isFollowing: boolean) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setFollowers((prev) =>
        prev.map((u) =>
          u._id === targetId ? { ...u, isFollowing: !isFollowing } : u,
        ),
      );
    } catch {
      /* silently fail */
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Followers"
      size="sm"
    >
      {loading ? (
        <div className={s.loading}>Loading…</div>
      ) : followers.length === 0 ? (
        <div className={s.empty}>No followers yet</div>
      ) : (
        <div className={s.list}>
          {followers.map((user) => (
            <div key={user._id} className={s.row}>
              <UserAvatar
                src={user.avatarUrl}
                name={user.displayName}
                size="sm"
              />
              <div className={s.info}>
                <div className={s.displayName}>{user.displayName}</div>
                <div className={s.username}>@{user.permalink}</div>
              </div>
              <FollowButton
                isFollowing={user.isFollowing}
                onClick={() =>
                  handleFollowToggle(user._id, user.isFollowing)
                }
              />
            </div>
          ))}
        </div>
      )}
    </AppModal>
  );
};
