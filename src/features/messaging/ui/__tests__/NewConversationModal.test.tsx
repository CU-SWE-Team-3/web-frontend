import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { NewConversationModal } from '../NewConversationModal';
import * as messagingApi from '../../api/messagingApi';
import * as startConversationHook from '../../model/useStartConversation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../api/messagingApi', () => ({
  searchUsers: vi.fn(() => Promise.resolve([])),
  resolveUserByPermalink: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('../../model/useStartConversation', () => ({
  useStartConversation: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('NewConversationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnCreated = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(startConversationHook.useStartConversation).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <NewConversationModal open={false} onClose={mockOnClose} onCreated={mockOnCreated} />,
      { wrapper: createWrapper() }
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should search users when typing in To field', async () => {
    vi.mocked(messagingApi.searchUsers).mockResolvedValueOnce([
      { _id: 'u1', displayName: 'John Doe', permalink: 'john', avatarUrl: null },
    ]);

    render(<NewConversationModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByTestId('user-search-input');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(messagingApi.searchUsers).toHaveBeenCalledWith('John');
    });
    
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
  });

  it('should select user from search results', async () => {
    vi.mocked(messagingApi.searchUsers).mockResolvedValueOnce([
      { _id: 'u1', displayName: 'John Doe', permalink: 'john', avatarUrl: null },
    ]);

    render(<NewConversationModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />, { wrapper: createWrapper() });
    
    const searchInput = screen.getByTestId('user-search-input');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    const resultItem = await screen.findByTestId('user-result-u1');
    fireEvent.click(resultItem);

    // Selected user should appear, input should disappear
    expect(screen.queryByTestId('user-search-input')).not.toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should trigger executeSend when Send is clicked with selected user', async () => {
    vi.mocked(messagingApi.searchUsers).mockResolvedValueOnce([
      { _id: 'u1', displayName: 'John Doe', permalink: 'john', avatarUrl: null },
    ]);

    render(<NewConversationModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />, { wrapper: createWrapper() });
    
    // Select user
    fireEvent.change(screen.getByTestId('user-search-input'), { target: { value: 'John' } });
    fireEvent.click(await screen.findByTestId('user-result-u1'));

    // Type message
    fireEvent.change(screen.getByTestId('new-conv-message-input'), { target: { value: 'Hello John!' } });

    // Click send
    fireEvent.click(screen.getByTestId('new-conv-send-button'));

    expect(mockMutate).toHaveBeenCalledWith(
      { userId: 'u1', content: 'Hello John!' },
      expect.any(Object)
    );
  });

  it('should fallback to resolveUserByPermalink if user types name without selecting', async () => {
    vi.mocked(messagingApi.resolveUserByPermalink).mockResolvedValueOnce('u1');

    render(<NewConversationModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />, { wrapper: createWrapper() });
    
    // Type but don't select
    fireEvent.change(screen.getByTestId('user-search-input'), { target: { value: 'john' } });
    fireEvent.change(screen.getByTestId('new-conv-message-input'), { target: { value: 'Hello John!' } });

    fireEvent.click(screen.getByTestId('new-conv-send-button'));

    await waitFor(() => {
      expect(messagingApi.resolveUserByPermalink).toHaveBeenCalledWith('john');
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { userId: 'u1', content: 'Hello John!' },
      expect.any(Object)
    );
  });

  it('should fallback to searchUsers if resolveUserByPermalink fails', async () => {
    vi.mocked(messagingApi.resolveUserByPermalink).mockResolvedValue(null);
    vi.mocked(messagingApi.searchUsers).mockResolvedValue([
      { _id: 'u1', displayName: 'John Doe', permalink: 'john-doe', avatarUrl: null },
    ]);

    render(<NewConversationModal open={true} onClose={mockOnClose} onCreated={mockOnCreated} />, { wrapper: createWrapper() });
    
    fireEvent.change(screen.getByTestId('user-search-input'), { target: { value: 'john doe' } });
    fireEvent.change(screen.getByTestId('new-conv-message-input'), { target: { value: 'Hello John!' } });

    fireEvent.click(screen.getByTestId('new-conv-send-button'));

    await waitFor(() => {
      expect(messagingApi.resolveUserByPermalink).toHaveBeenCalledWith('john doe');
      expect(messagingApi.searchUsers).toHaveBeenCalledWith('john doe');
    });

    expect(mockMutate).toHaveBeenCalledWith(
      { userId: 'u1', content: 'Hello John!' },
      expect.any(Object)
    );
  });
});
