"use client";

import React, { useState } from "react";
import { UserAvatar, TabBar } from "@/shared/ui";
import { useFollowing } from "../model/useFollowing";
import { useFollowers } from "../model/useFollowers";
import { FollowListGrid } from "./FollowListGrid";
import { LikedTracksList } from "@/features/track-engagement";
import { useAuthStore } from "@/features/auth/model/useAuthStore";

export const ProfileFeature = () => {
  const [activeTab, setActiveTab] = useState("likes");
  const { user } = useAuthStore();
  const userId = (user as any)?._id || user?.id || "";

  const { data: following, isLoading: isLoadingFollowing } = useFollowing(userId);
  const { data: followers, isLoading: isLoadingFollowers } = useFollowers(userId);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const tabs = [
    { key: "likes", label: "Likes" },
    { key: "following", label: "Following" },
    { key: "followers", label: "Followers" },
  ];

  return (
    <div className="w-full text-white pt-[30px]">
      {/* Header Profile Section */}
      <div className="flex items-center gap-[20px] mb-[40px]">
        {/* Placeholder gradient bubble representing XC Z */}
        <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-tr from-[#e5a89e] to-[#cc8078] flex-shrink-0" />
        <h1 className="text-[28px] font-bold">
          {activeTab === "likes" 
            ? "Likes by XC Z" 
            : `XC Z is ${activeTab === "following" ? "following" : "followed by"}`}
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-[#333] mb-6">
        <TabBar
          tabs={tabs}
          activeKey={activeTab}
          onTabChange={handleTabChange}
          className="max-w-max" // the component usually handles flex
        />
      </div>

      {/* Grid Content */}
      {activeTab === "likes" && (
        <LikedTracksList />
      )}
      {activeTab === "following" && (
        <FollowListGrid users={following || []} isLoading={isLoadingFollowing} />
      )}
      {activeTab === "followers" && (
        <FollowListGrid users={followers || []} isLoading={isLoadingFollowers} />
      )}
    </div>
  );
};

