import React, { useState } from "react";
import Link from 'next/link';
import { ROUTES } from '@/shared/constants/routes';
import { UserAvatar, UserIcon, AppButton } from "@/shared/ui";
import { FollowNode } from "../model/types";
import { useFollowUser } from "../model/useFollowUser";
import { useUnfollowUser } from "../model/useUnfollowUser";
import { useFollowStore } from "../model/useFollowStore";

interface FollowUserCardProps {
  user: FollowNode;
}

const formatFollowers = (count: number | undefined | null) => {
  if (count == null) return '0';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

export const FollowUserCard = ({ user }: FollowUserCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const targetId = user.id || (user as any)._id;

  const followStore = useFollowStore();
  const globalFollowing = followStore.followingMap[targetId];
  const isFollowing = globalFollowing ?? (user.isFollowing || false);

  React.useEffect(() => {
    if (user.isFollowing !== undefined) {
      followStore.initFollowing(targetId, user.isFollowing);
    }
  }, [targetId, user.isFollowing, followStore]);

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const toggleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFollowing) {
      followStore.setFollowing(targetId, false);
      unfollowMutation.mutate(targetId);
    } else {
      followStore.setFollowing(targetId, true);
      followMutation.mutate({ targetId, targetUser: user });
    }
  };

  return (
    <Link href={ROUTES.PROFILE(user.username || (user as any).permalink)} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        className="flex flex-col items-center gap-3 w-full group cursor-pointer"
        data-testid={`follow-card-${user.id || (user as any)._id}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div data-testid="follow-card-avatar" className="w-full aspect-square max-w-[200px]">
          <UserAvatar
            src={user.avatarUrl || undefined}
            name={user.displayName}
            size="xl"
          />
        </div>

        <div className="flex flex-col items-center text-center w-full px-2 relative min-h-[60px]">
          <span
            data-testid="follow-card-name"
            className="text-white text-[15px] font-medium w-full truncate"
            title={user.displayName}
          >
            {user.displayName}
          </span>
          <div data-testid="follow-card-followers-count" className="flex items-center gap-1.5 text-[13px] text-[#999] mt-1 transition-opacity duration-200">
            <UserIcon size={13} color="currentColor" />
            <span>{formatFollowers(user.followerCount)} followers</span>
          </div>

          {/* Hover Button */}
          <div 
            className={`absolute bottom-[-25px] left-1/2 -translate-x-1/2 transition-all duration-200 w-full flex justify-center 
              ${isHovered ? "opacity-100 visible translate-y-0" : "opacity-100 visible translate-y-0 lg:opacity-0 lg:invisible lg:translate-y-4"}`}
          >
            <AppButton
              data-testid="follow-card-btn"
              variant={isFollowing ? "secondary" : "outline"}
              size="sm"
              onClick={toggleFollow}
              style={
                !isFollowing 
                  ? { backgroundColor: "white", color: "black", borderColor: "white" } 
                  : { color: "white" }
              }
            >
              {isFollowing ? "Following" : "Follow"}
            </AppButton>
          </div>
        </div>
      </div>
    </Link>
  );
};

