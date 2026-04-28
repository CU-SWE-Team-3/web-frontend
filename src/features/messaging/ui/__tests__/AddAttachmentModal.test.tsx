import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AddAttachmentModal } from '../AddAttachmentModal';
import * as trackQueries from '@/features/tracks/model/trackQueries';

vi.mock('@/features/tracks/model/trackQueries', () => ({
  useUserTracks: vi.fn(),
}));

describe('AddAttachmentModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSelectTrack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when open is false', () => {
    vi.mocked(trackQueries.useUserTracks).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { container } = render(
      <AddAttachmentModal open={false} onClose={mockOnClose} onSelectTrack={mockOnSelectTrack} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render loading state when tracks are fetching', () => {
    vi.mocked(trackQueries.useUserTracks).mockReturnValue({
      data: [],
      isLoading: true,
    } as any);

    render(<AddAttachmentModal open={true} onClose={mockOnClose} onSelectTrack={mockOnSelectTrack} />);
    
    expect(screen.getByText('Loading your tracks...')).toBeInTheDocument();
  });

  it('should render empty state when no tracks are found', () => {
    vi.mocked(trackQueries.useUserTracks).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<AddAttachmentModal open={true} onClose={mockOnClose} onSelectTrack={mockOnSelectTrack} />);
    
    expect(screen.getByText("You don't have any tracks yet.")).toBeInTheDocument();
  });

  it('should render tracks and fire onSelectTrack when clicked', () => {
    const mockTracks = [
      { id: 't1', title: 'Track 1', artist: 'Artist 1', artworkUrl: 'img1.jpg' },
      { id: 't2', title: 'Track 2', artist: { displayName: 'Artist 2' }, artworkUrl: 'img2.jpg' },
    ];
    
    vi.mocked(trackQueries.useUserTracks).mockReturnValue({
      data: mockTracks,
      isLoading: false,
    } as any);

    render(<AddAttachmentModal open={true} onClose={mockOnClose} onSelectTrack={mockOnSelectTrack} />);
    
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();

    const track1Btn = screen.getByTestId('attachment-track-t1');
    fireEvent.click(track1Btn);

    expect(mockOnSelectTrack).toHaveBeenCalledWith(mockTracks[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close when overlay is clicked', () => {
    vi.mocked(trackQueries.useUserTracks).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<AddAttachmentModal open={true} onClose={mockOnClose} onSelectTrack={mockOnSelectTrack} />);
    
    const overlay = screen.getByTestId('add-attachment-modal');
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
