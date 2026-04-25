import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportUserModal } from '../ReportUserModal';

describe('ReportUserModal', () => {
  it('should render only when open is true', () => {
    const { rerender } = render(<ReportUserModal open={false} onClose={vi.fn()} onReport={vi.fn()} displayName="Test" />);
    expect(screen.queryByTestId('report-user-modal')).not.toBeInTheDocument();

    rerender(<ReportUserModal open={true} onClose={vi.fn()} onReport={vi.fn()} displayName="Test" />);
    expect(screen.getByTestId('report-user-modal')).toBeInTheDocument();
  });

  it('should navigate categories and report spam', () => {
    const handleReport = vi.fn();
    render(<ReportUserModal open={true} onClose={vi.fn()} onReport={handleReport} displayName="Test" />);
    
    // Select Spam category
    fireEvent.click(screen.getByTestId('report-reason-spam'));
    expect(screen.getByText(/Reporting Test for spam:/i)).toBeInTheDocument();
    
    // Confirm report
    fireEvent.click(screen.getByTestId('report-spam-confirm'));
    expect(handleReport).toHaveBeenCalledWith('spam');
  });
});
