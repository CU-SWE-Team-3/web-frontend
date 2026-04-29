import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MessageComposer } from '../MessageComposer';

import * as trackQueries from '@/features/tracks/model/trackQueries';

vi.mock('@/features/tracks/model/trackQueries', () => ({
  useUserTracks: vi.fn(),
}));

describe('MessageComposer', () => {
  const mockOnSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(trackQueries.useUserTracks).mockReturnValue({
      data: [{ id: 't1', title: 'Track 1', artist: { displayName: 'Artist 1' }, artworkUrl: 'img1.jpg' }],
      isLoading: false,
    } as any);
  });

  it('should render correctly and disable send button initially', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const input = screen.getByTestId('message-composer-input');
    const sendBtn = screen.getByTestId('message-send-button');

    expect(input).toBeInTheDocument();
    expect(sendBtn).toBeDisabled();
  });

  it('should enable send button when text is typed', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const input = screen.getByTestId('message-composer-input');
    const sendBtn = screen.getByTestId('message-send-button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(sendBtn).not.toBeDisabled();
  });

  it('should call onSend with text and clear input', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    const input = screen.getByTestId('message-composer-input');
    const sendBtn = screen.getByTestId('message-send-button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendBtn);

    expect(mockOnSend).toHaveBeenCalledWith('Hello', undefined);
    expect(input).toHaveValue('');
    expect(sendBtn).toBeDisabled();
  });

  it('should allow attaching a track and sending it', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    
    // Open modal
    const addAttachmentBtn = screen.getByText('Add track or playlist');
    fireEvent.click(addAttachmentBtn);
    expect(screen.getByTestId('add-attachment-modal')).toBeInTheDocument();

    // Select track
    fireEvent.click(screen.getByTestId('attachment-track-t1'));
    
    // Check if track is attached (chip rendered)
    expect(screen.getByText('Artist 1 · Track 1')).toBeInTheDocument();
    
    // Send button should be enabled even without text
    const sendBtn = screen.getByTestId('message-send-button');
    expect(sendBtn).not.toBeDisabled();

    // Send
    fireEvent.click(sendBtn);
    
    expect(mockOnSend).toHaveBeenCalledWith('', { type: 'track', id: 't1' });
    expect(screen.queryByText('Artist 1 · Track 1')).not.toBeInTheDocument();
  });

  it('should allow removing an attached track', () => {
    render(<MessageComposer onSend={mockOnSend} />);
    
    const addAttachmentBtn = screen.getByText('Add track or playlist');
    fireEvent.click(addAttachmentBtn);
    fireEvent.click(screen.getByTestId('attachment-track-t1'));
    
    expect(screen.getByText('Artist 1 · Track 1')).toBeInTheDocument();
    
    // Remove track
    const removeBtn = screen.getByTitle('Remove track');
    fireEvent.click(removeBtn);
    
    expect(screen.queryByText('Artist 1 · Track 1')).not.toBeInTheDocument();
    
    // Send button should be disabled again
    expect(screen.getByTestId('message-send-button')).toBeDisabled();
  });
});
