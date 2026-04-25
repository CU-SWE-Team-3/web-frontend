'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from './types';
import { MESSAGES_QUERY_KEY } from './useMessages';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';
import { UNREAD_COUNT_QUERY_KEY } from './useUnreadCount';

// ─── Socket Configuration ────────────────────────────────────────────────────

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:5000';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DeliveredPayload {
  conversationId: string;
  deliveredAt: string;
}

interface ReadPayload {
  conversationId: string;
  readAt: string;
}

interface TypingPayload {
  senderId: string;
}

interface SocketError {
  message: string;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Connect on mount
  useEffect(() => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null;

    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to WebSocket server');
    });

    // ─── Server → Client Events ────────────────────────────────────────

    /** receive_message — new message arrives */
    socket.on('receive_message', (message: Message) => {
      // Append to cache
      queryClient.setQueryData<Message[]>(
        [...MESSAGES_QUERY_KEY, message.conversationId],
        (old) => (old ? [...old, message] : [message])
      );

      // Refresh conversations list
      queryClient.invalidateQueries({ queryKey: [...CONVERSATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...UNREAD_COUNT_QUERY_KEY] });

      // Immediately acknowledge delivery
      socket.emit('mark_as_delivered', { conversationId: message.conversationId });
    });

    /** messages_delivered — our sent messages were received */
    socket.on('messages_delivered', (payload: DeliveredPayload) => {
      queryClient.setQueryData<Message[]>(
        [...MESSAGES_QUERY_KEY, payload.conversationId],
        (old) =>
          old?.map((m) =>
            m.status === 'sent' ? { ...m, status: 'delivered' as const } : m
          ) ?? []
      );
    });

    /** messages_read — our sent messages were read */
    socket.on('messages_read', (payload: ReadPayload) => {
      queryClient.setQueryData<Message[]>(
        [...MESSAGES_QUERY_KEY, payload.conversationId],
        (old) =>
          old?.map((m) =>
            m.status === 'sent' || m.status === 'delivered'
              ? { ...m, status: 'read' as const, readAt: payload.readAt }
              : m
          ) ?? []
      );
    });

    /** user_typing — someone started typing */
    socket.on('user_typing', (payload: TypingPayload) => {
      setTypingUsers((prev) => new Set(prev).add(payload.senderId));
    });

    /** user_stopped_typing — someone stopped typing */
    socket.on('user_stopped_typing', (payload: TypingPayload) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(payload.senderId);
        return next;
      });
    });

    /** message_edited — a message was edited */
    socket.on('message_edited', (updatedMessage: Message) => {
      queryClient.setQueryData<Message[]>(
        [...MESSAGES_QUERY_KEY, updatedMessage.conversationId],
        (old) =>
          old?.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)) ?? []
      );
    });

    /** message_deleted_everyone — a message was unsent */
    socket.on('message_deleted_everyone', (updatedMessage: Message) => {
      queryClient.setQueryData<Message[]>(
        [...MESSAGES_QUERY_KEY, updatedMessage.conversationId],
        (old) =>
          old?.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)) ?? []
      );
    });

    /** error — socket-level error */
    socket.on('error', (payload: SocketError) => {
      console.error('[Socket] Error:', payload.message);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);

  // ─── Client → Server Emitters ──────────────────────────────────────

  const emitMarkAsDelivered = useCallback((conversationId: string) => {
    socketRef.current?.emit('mark_as_delivered', { conversationId });
  }, []);

  const emitMarkAsRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('mark_as_read', { conversationId });
  }, []);

  const emitTyping = useCallback((receiverId: string) => {
    socketRef.current?.emit('typing', { receiverId });

    // Auto stop-typing after 2 seconds of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { receiverId });
    }, 2000);
  }, []);

  const emitStopTyping = useCallback((receiverId: string) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketRef.current?.emit('stop_typing', { receiverId });
  }, []);

  return {
    socket: socketRef.current,
    typingUsers,
    emitMarkAsDelivered,
    emitMarkAsRead,
    emitTyping,
    emitStopTyping,
  };
};
