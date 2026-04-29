import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSocket } from '../useSocket';
import { io } from 'socket.io-client';

// ─── Mock socket.io-client ──────────────────────────────────────────────────
const mockOn = vi.fn();
const mockEmit = vi.fn();
const mockDisconnect = vi.fn();
const mockSocket = {
  on: mockOn,
  emit: mockEmit,
  disconnect: mockDisconnect,
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock accessToken in localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'accessToken') return 'mock-jwt-token';
      return null;
    });
  });

  it('should connect to the socket server with JWT auth', () => {
    renderHook(() => useSocket(), { wrapper: createWrapper() });

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: 'mock-jwt-token' },
      })
    );
  });

  it('should register all required event listeners', () => {
    renderHook(() => useSocket(), { wrapper: createWrapper() });

    const registeredEvents = mockOn.mock.calls.map((call: any[]) => call[0]);

    expect(registeredEvents).toContain('connect');
    expect(registeredEvents).toContain('receive_message');
    expect(registeredEvents).toContain('messages_delivered');
    expect(registeredEvents).toContain('messages_read');
    expect(registeredEvents).toContain('user_typing');
    expect(registeredEvents).toContain('user_stopped_typing');
    expect(registeredEvents).toContain('message_edited');
    expect(registeredEvents).toContain('message_deleted_everyone');
    expect(registeredEvents).toContain('error');
    expect(registeredEvents).toContain('disconnect');
  });

  it('should provide emitter functions', () => {
    const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    expect(result.current.emitMarkAsDelivered).toBeDefined();
    expect(result.current.emitMarkAsRead).toBeDefined();
    expect(result.current.emitTyping).toBeDefined();
    expect(result.current.emitStopTyping).toBeDefined();
    expect(typeof result.current.emitMarkAsDelivered).toBe('function');
    expect(typeof result.current.emitMarkAsRead).toBe('function');
    expect(typeof result.current.emitTyping).toBe('function');
    expect(typeof result.current.emitStopTyping).toBe('function');
  });

  it('should emit mark_as_delivered event', () => {
    const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    act(() => {
      result.current.emitMarkAsDelivered('conv-1');
    });

    expect(mockEmit).toHaveBeenCalledWith('mark_as_delivered', { conversationId: 'conv-1' });
  });

  it('should emit mark_as_read event', () => {
    const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    act(() => {
      result.current.emitMarkAsRead('conv-1');
    });

    expect(mockEmit).toHaveBeenCalledWith('mark_as_read', { conversationId: 'conv-1' });
  });

  it('should emit typing event', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    act(() => {
      result.current.emitTyping('user-2');
    });

    expect(mockEmit).toHaveBeenCalledWith('typing', { receiverId: 'user-2' });

    vi.useRealTimers();
  });

  it('should auto emit stop_typing after 2 seconds', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    act(() => {
      result.current.emitTyping('user-2');
    });

    expect(mockEmit).toHaveBeenCalledWith('typing', { receiverId: 'user-2' });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockEmit).toHaveBeenCalledWith('stop_typing', { receiverId: 'user-2' });

    vi.useRealTimers();
  });

  it('should emit stop_typing event immediately', () => {
    const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    act(() => {
      result.current.emitStopTyping('user-2');
    });

    expect(mockEmit).toHaveBeenCalledWith('stop_typing', { receiverId: 'user-2' });
  });

  it('should initialize typingUsers as an empty set', () => {
    const { result } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    expect(result.current.typingUsers.size).toBe(0);
  });

  it('should disconnect socket on unmount', () => {
    const { unmount } = renderHook(() => useSocket(), { wrapper: createWrapper() });

    unmount();

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should not connect if no token is available', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    renderHook(() => useSocket(), { wrapper: createWrapper() });

    // io should not be called when there is no token
    expect(io).not.toHaveBeenCalled();
  });
});
