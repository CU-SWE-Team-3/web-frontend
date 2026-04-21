import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockUserModal } from '../BlockUserModal';

describe('BlockUserModal', () => {
  it('does not render when open is false', () => {
    render(<BlockUserModal open={false} onClose={vi.fn()} onConfirm={vi.fn()} displayName="John" />);
    expect(screen.queryByTestId('block-user-modal')).not.toBeInTheDocument();
  });

  it('renders correctly when open', () => {
    render(<BlockUserModal open={true} onClose={vi.fn()} onConfirm={vi.fn()} displayName="John" />);
    expect(screen.getByTestId('block-user-modal')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Block John' })).toBeInTheDocument();
  });

  it('calls onClose when clicking cancel or close buttons', () => {
    const handleClose = vi.fn();
    render(<BlockUserModal open={true} onClose={handleClose} onConfirm={vi.fn()} displayName="John" />);
    
    fireEvent.click(screen.getByTestId('block-modal-close'));
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('block-modal-cancel'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('calls onConfirm with correct options when confirmed', () => {
    const handleConfirm = vi.fn();
    render(<BlockUserModal open={true} onClose={vi.fn()} onConfirm={handleConfirm} displayName="John" />);
    
    const removeContentCb = screen.getByTestId('remove-content-checkbox');
    const reportSpamCb = screen.getByTestId('report-spam-checkbox');
    
    fireEvent.click(removeContentCb); // check
    fireEvent.click(reportSpamCb); // check
    
    fireEvent.click(screen.getByTestId('block-modal-confirm'));
    
    expect(handleConfirm).toHaveBeenCalledWith({
      removeContent: true,
      reportSpam: true,
    });
  });
});
