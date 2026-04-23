import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageBubble } from '../MessageBubble';
import type { Message } from '../../model/types';

const mockMessage: Message = {
  _id: 'msg-1',
  conversationId: 'conv-1',
  senderId: 'u2',
  sender: {
    _id: 'u2',
    displayName: 'Other User',
    permalink: 'other',
    avatarUrl: 'https://example.com/avatar.jpg'
  },
  content: 'Hello there!',
  attachment: null,
  sharedTrack: null,
  status: 'sent',
  isEdited: false,
  isDeleted: false,
  deletedFor: [],
  createdAt: '2026-04-21T12:00:00Z',
  updatedAt: '2026-04-21T12:00:00Z',
};

describe('MessageBubble', () => {
  it('renders correctly with message content', () => {
    render(<MessageBubble message={mockMessage} />);
    
    expect(screen.getByTestId('message-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-content-msg-1')).toHaveTextContent('Hello there!');
    expect(screen.getByTestId('message-sender-msg-1')).toHaveTextContent('Other User');
  });

  it('renders edited badge when isEdited is true', () => {
    render(<MessageBubble message={{ ...mockMessage, isEdited: true }} />);
    expect(screen.getByTestId('message-edited-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-edited-msg-1')).toHaveTextContent('(edited)');
  });

  it('renders deleted placeholder when isDeleted is true', () => {
    render(<MessageBubble message={{ ...mockMessage, isDeleted: true }} />);
    expect(screen.getByTestId('message-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-content-msg-1')).toHaveTextContent('This message was deleted');
  });

  it('renders status ticks only for own messages', () => {
    const { rerender } = render(<MessageBubble message={mockMessage} isOwnMessage={false} />);
    expect(screen.queryByTestId('message-status-msg-1')).not.toBeInTheDocument();

    rerender(<MessageBubble message={{ ...mockMessage, status: 'delivered' }} isOwnMessage={true} />);
    expect(screen.getByTestId('message-status-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-status-delivered')).toBeInTheDocument();
  });
});
