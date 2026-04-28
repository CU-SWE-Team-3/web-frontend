import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConversationView } from '../ConversationView';
import * as messagesHooks from '../../model/useMessages';
import * as sendMessageHooks from '../../model/useSendMessage';
import * as socketHooks from '../../model/useSocket';
import * as blockUserHooks from '../../model/useBlockUser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../../model/useMessages', () => ({
  useMessages: vi.fn(),
}));

vi.mock('../../model/useSendMessage', () => ({
  useSendMessage: vi.fn(),
}));

vi.mock('../../model/useSocket', () => ({
  useSocket: vi.fn(),
}));

vi.mock('../../model/useBlockUser', () => ({
  useBlockUser: vi.fn(),
  useUnblockUser: vi.fn(),
}));

vi.mock('../MessageBubble', () => ({
  MessageBubble: ({ message }: any) => <div data-testid={`message-${message._id}`}>{message.content}</div>,
}));

vi.mock('../MessageComposer', () => ({
  MessageComposer: ({ onSend }: any) => (
    <div data-testid="mock-composer">
      <button onClick={() => onSend('Hello', undefined)} data-testid="mock-send-text">Send Text</button>
      <button onClick={() => onSend('', { type: 'track', id: 't1' })} data-testid="mock-send-track">Send Track</button>
    </div>
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ConversationView', () => {
  const mockMutate = vi.fn();
  const mockEmitMarkAsRead = vi.fn();
  const mockEmitStopTyping = vi.fn();

  const mockConversation = {
    _id: 'conv-1',
    participants: [],
    participant: { _id: 'user-2', displayName: 'User 2', permalink: 'user-2', avatarUrl: null },
    lastMessage: null,
    unreadCount: 0,
    isBlocked: false,
    isBlockedBy: false,
    isFirstMessage: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(sendMessageHooks.useSendMessage).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.mocked(socketHooks.useSocket).mockReturnValue({
      emitMarkAsRead: mockEmitMarkAsRead,
      emitStopTyping: mockEmitStopTyping,
      typingUsers: new Set(),
    } as any);

    vi.mocked(blockUserHooks.useBlockUser).mockReturnValue({ mutate: vi.fn() } as any);
    vi.mocked(blockUserHooks.useUnblockUser).mockReturnValue({ mutate: vi.fn() } as any);
  });

  it('should render empty state when no messages', () => {
    vi.mocked(messagesHooks.useMessages).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ConversationView conversation={mockConversation} onDeleted={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('should render messages and mark them as read', () => {
    const mockMessages = [
      { _id: 'm1', content: 'Msg 1', senderId: 'user-2', status: 'delivered' },
      { _id: 'm2', content: 'Msg 2', senderId: 'user-1', status: 'sent' },
    ];
    
    vi.mocked(messagesHooks.useMessages).mockReturnValue({
      data: mockMessages,
      isLoading: false,
    } as any);

    render(<ConversationView conversation={mockConversation} onDeleted={vi.fn()} />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('message-m1')).toHaveTextContent('Msg 1');
    expect(screen.getByTestId('message-m2')).toHaveTextContent('Msg 2');
    
    expect(mockEmitMarkAsRead).toHaveBeenCalledWith('conv-1');
  });

  it('should handle sending text message', () => {
    vi.mocked(messagesHooks.useMessages).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ConversationView conversation={mockConversation} onDeleted={vi.fn()} />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByTestId('mock-send-text'));
    
    expect(mockEmitStopTyping).toHaveBeenCalledWith('user-2');
    expect(mockMutate).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      receiverId: 'user-2',
      content: 'Hello',
      sharedTrack: undefined,
    });
  });

  it('should handle sending track attachment', () => {
    vi.mocked(messagesHooks.useMessages).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ConversationView conversation={mockConversation} onDeleted={vi.fn()} />, { wrapper: createWrapper() });
    
    fireEvent.click(screen.getByTestId('mock-send-track'));
    
    expect(mockMutate).toHaveBeenCalledWith({
      conversationId: 'conv-1',
      receiverId: 'user-2',
      content: '',
      sharedTrack: { trackId: 't1' },
    });
  });

  it('should render typing indicator if user is typing', () => {
    vi.mocked(socketHooks.useSocket).mockReturnValue({
      emitMarkAsRead: mockEmitMarkAsRead,
      emitStopTyping: mockEmitStopTyping,
      typingUsers: new Set(['user-2']),
    } as any);

    vi.mocked(messagesHooks.useMessages).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ConversationView conversation={mockConversation} onDeleted={vi.fn()} />, { wrapper: createWrapper() });
    
    expect(screen.getByText('User 2 is typing...')).toBeInTheDocument();
  });
});
