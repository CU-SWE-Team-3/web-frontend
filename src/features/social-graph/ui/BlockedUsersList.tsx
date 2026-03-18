"use client";

import React, { useState, useCallback } from "react";
import { useBlockedUsers } from "../model/useBlockedUsers";
import { useUnblockUser } from "../model/useUnblockUser";
import type { BlockedUser } from "../model/types";
import {
  UserAvatar,
  AppButton,
  EmptyState,
  SkeletonLoader,
  AppToast,
  BanIcon,
  CloseIcon,
} from "@/shared/ui";

/* ─────────────────────── Toast State ─────────────────────── */

interface ToastState {
  open: boolean;
  message: string;
  variant: "success" | "error";
}

const TOAST_INITIAL: ToastState = { open: false, message: "", variant: "success" };

/* ─────────────────────── Row Sub-component ─────────────────────── */

interface RowProps {
  user: BlockedUser;
  onUnblock: (id: string) => void;
  isUnblocking: boolean;
}

const BlockedUserRow: React.FC<RowProps> = ({ user, onUnblock, isUnblocking }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--sc-space-3)",
      paddingBlock: "var(--sc-space-3)",
    }}
    data-testid="blocked-user-row"
  >
    <UserAvatar
      src={user.avatarUrl}
      name={user.displayName}
      size="md"
    />

    <span
      style={{
        fontSize: "var(--sc-font-size-md)",
        fontWeight: "var(--sc-font-weight-bold)" as unknown as number,
        color: "var(--sc-white)",
      }}
      data-testid="blocked-user-username"
    >
      {user.displayName}
    </span>

    <AppButton
      variant="secondary"
      size="sm"
      loading={isUnblocking}
      leftIcon={<BanIcon size={14} />}
      onClick={() => onUnblock(user.id)}
      data-testid="unblock-button"
      style={{ marginLeft: "auto", color: "var(--sc-primary)" }}
    >
      Blocked
    </AppButton>
  </div>
);

/* ─────────────────────── Loading Sub-component ─────────────────────── */

const BlockedUsersLoading: React.FC = () => (
  <div data-testid="blocked-loading" style={{ display: "flex", flexDirection: "column", gap: "var(--sc-space-3)" }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--sc-space-3)", paddingBlock: "var(--sc-space-3)" }}>
        <SkeletonLoader width={40} height={40} rounded="circle" />
        <SkeletonLoader width={120} height={16} />
        <SkeletonLoader width={90} height={32} style={{ marginLeft: "auto" }} />
      </div>
    ))}
  </div>
);

/* ─────────────────────── Main Component ─────────────────────── */

export const BlockedUsersList: React.FC = () => {
  const { data: blockedUsers, isLoading, isError } = useBlockedUsers();
  const unblockMutation = useUnblockUser();
  const [toast, setToast] = useState<ToastState>(TOAST_INITIAL);

  const closeToast = useCallback(() => setToast(TOAST_INITIAL), []);

  const handleUnblock = useCallback(
    (userId: string) => {
      unblockMutation.mutate(userId, {
        onSuccess: () =>
          setToast({ open: true, message: "User unblocked successfully.", variant: "success" }),
        onError: (err) =>
          setToast({
            open: true,
            message: err.message || "Failed to unblock user.",
            variant: "error",
          }),
      });
    },
    [unblockMutation],
  );

  /* ---- Loading ---- */
  if (isLoading) return <BlockedUsersLoading />;

  /* ---- Error ---- */
  if (isError) {
    return (
      <EmptyState
        icon={<CloseIcon size={24} />}
        title="Failed to load blocked users"
        description="Something went wrong. Please try again later."
      />
    );
  }

  /* ---- Empty ---- */
  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <EmptyState
        icon={<BanIcon size={24} />}
        title="You haven't blocked anyone"
        description="When you block someone, they won't be able to find your profile, tracks, or playlists."
        data-testid="blocked-empty-state"
      />
    );
  }

  /* ---- List ---- */
  return (
    <>
      <div data-testid="blocked-users-list" style={{ display: "flex", flexDirection: "column" }}>
        {blockedUsers.map((user) => (
          <BlockedUserRow
            key={user.id}
            user={user}
            onUnblock={handleUnblock}
            isUnblocking={unblockMutation.isPending && unblockMutation.variables === user.id}
          />
        ))}
      </div>

      <AppToast
        open={toast.open}
        message={toast.message}
        variant={toast.variant}
        onClose={closeToast}
      />
    </>
  );
};
