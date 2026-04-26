'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthHydrator } from '@/features/auth/ui/AuthHydrator';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { connectSocket, disconnectSocket, getSocket } from '@/shared/socket';
import { useNotificationStore } from '@/features/notifications/model/useNotificationStore';

/**
 * Gate that waits until auth hydration is complete before rendering children.
 * This prevents React Query hooks from firing before the JWT token is restored.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) {
    // Minimal loading state — prevents flash of empty content
    return (
      <div style={{
        minHeight: '100vh',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid #333',
          borderTopColor: '#f50',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Manages Socket.IO connection lifecycle:
 * - Connects when the user is authenticated
 * - Sets up notification event listeners
 * - Disconnects on logout
 */
function SocketProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  const {
    fetchUnreadCount,
    handleSocketNewNotification,
    handleSocketNotificationRead,
    handleSocketAllNotificationsRead,
    handleSocketNotificationDeleted,
  } = useNotificationStore();

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) {
      disconnectSocket();
      return;
    }

    // Connect to Socket.IO with JWT
    const socket = connectSocket();

    // Register notification handlers BEFORE connection fires
    socket.on('new_notification', handleSocketNewNotification);
    socket.on('notification_read', ({ notificationId }: { notificationId: string }) => {
      handleSocketNotificationRead(notificationId);
    });
    socket.on('all_notifications_read', handleSocketAllNotificationsRead);
    socket.on('notification_deleted', ({ notificationId }: { notificationId: string }) => {
      handleSocketNotificationDeleted(notificationId);
    });

    // Fetch initial unread count after connection
    socket.on('connect', () => {
      fetchUnreadCount();
    });

    // If already connected, fetch now
    if (socket.connected) {
      fetchUnreadCount();
    }

    return () => {
      socket.off('new_notification', handleSocketNewNotification);
      socket.off('notification_read');
      socket.off('all_notifications_read', handleSocketAllNotificationsRead);
      socket.off('notification_deleted');
      socket.off('connect');
    };
  }, [
    isAuthenticated,
    isInitialized,
    fetchUnreadCount,
    handleSocketNewNotification,
    handleSocketNotificationRead,
    handleSocketAllNotificationsRead,
    handleSocketNotificationDeleted,
  ]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator />
      <AuthGate>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthGate>
    </QueryClientProvider>
  );
}
