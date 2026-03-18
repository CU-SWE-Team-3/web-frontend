'use client';

import { type FC, useState, useEffect, useCallback } from 'react';
import { AppModal, UserAvatar, FollowButton } from '@/shared/ui';
import s from './FollowersDialog.module.scss'; // Re-using FollowersDialog module

interface FollowingUser {
  _id: string;
  permalink: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
}

export interface FollowingDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FollowingDialog: FC<FollowingDialogProps> = ({
  userId,
  open,
  onOpenChange,
}) => {
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    try {
      const mockFollowing = [
        { _id: '4', permalink: 'dave', displayName: 'Dave Beats', avatarUrl: 'https://i.pravatar.cc/150?img=4', isFollowing: true },
        { _id: '5', permalink: 'eve', displayName: 'Eve Sounds', avatarUrl: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
      ];
      await new Promise(resolve => setTimeout(resolve, 400));
      setFollowing(mockFollowing);
    } catch {
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) fetchFollowing();
  }, [open, fetchFollowing]);

  const handleFollowToggle = async (targetId: string, isFollowing: boolean) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setFollowing((prev) =>
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
      title="Following"
      size="sm"
    >
      {loading ? (
        <div className={s.loading}>Loading…</div>
      ) : following.length === 0 ? (
        <div className={s.empty}>Not following anyone yet</div>
      ) : (
        <div className={s.list}>
          {following.map((user) => (
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
