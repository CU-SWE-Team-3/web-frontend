import React from "react";
import { FollowUserCard } from "./FollowUserCard";
import { FollowNode } from "../model/types";

interface FollowListGridProps {
  users: FollowNode[];
  isLoading?: boolean;
}

export const FollowListGrid = ({ users, isLoading }: FollowListGridProps) => {
  if (isLoading) {
    // Generate empty placeholders based on the dark squares in the skeleton screenshot
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-full aspect-square max-w-[200px] bg-[#222]"
            data-testid="follow-skeleton"
          />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div data-testid="follow-list-empty" className="py-10 text-center text-[#999] text-[15px]">
        Nothing to show here.
      </div>
    );
  }

  return (
    <div data-testid="follow-list-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-6">
      {users.map((user) => (
        <FollowUserCard key={user.id} user={user} />
      ))}
      
      {/* Placholders for styling the grid correctly as seen in screenshot */}
      {Array.from({ length: Math.max(0, 5 - users.length) }).map((_, i) => (
        <div
          key={`placeholder-${i}`}
          className="w-full aspect-square max-w-[200px] bg-[#222]"
        />
      ))}
    </div>
  );
};
