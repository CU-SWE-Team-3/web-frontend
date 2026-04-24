import React, { useRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConversationPopover } from '../DeleteConversationPopover';

const Wrapper = ({ open, onClose, onConfirm }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={ref} data-testid="anchor">Anchor</div>
      <DeleteConversationPopover open={open} onClose={onClose} onConfirm={onConfirm} anchorRef={ref} />
    </div>
  );
};

describe('DeleteConversationPopover', () => {
  it('does not render when open is false', () => {
    render(<Wrapper open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.queryByTestId('delete-conversation-popover')).not.toBeInTheDocument();
  });

  it('renders correctly when open', () => {
    render(<Wrapper open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByTestId('delete-conversation-popover')).toBeInTheDocument();
  });

  it('calls onClose when cancel is clicked', () => {
    const handleClose = vi.fn();
    render(<Wrapper open={true} onClose={handleClose} onConfirm={vi.fn()} />);
    
    fireEvent.click(screen.getByTestId('archive-cancel'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm with reportSpam value when confirmed', () => {
    const handleConfirm = vi.fn();
    render(<Wrapper open={true} onClose={vi.fn()} onConfirm={handleConfirm} />);
    
    fireEvent.click(screen.getByTestId('archive-report-spam-checkbox'));
    fireEvent.click(screen.getByTestId('archive-confirm'));
    
    expect(handleConfirm).toHaveBeenCalledWith(true); // reportSpam checked
  });
});
