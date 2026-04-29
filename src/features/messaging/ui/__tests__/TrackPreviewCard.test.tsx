import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TrackPreviewCard } from '../TrackPreviewCard';
import * as trackQueries from '@/features/tracks/model/trackQueries';
import * as playerStore from '@/features/player/model/playerStore';
import * as likeHooks from '@/features/track-engagement/model/useLikeTrack';
import * as unlikeHooks from '@/features/track-engagement/model/useUnlikeTrack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/tracks/model/trackQueries', () => ({
  useTrack: vi.fn(),
}));

vi.mock('@/features/player/model/playerStore', () => ({
  usePlayerStore: vi.fn(),
}));

vi.mock('@/features/track-engagement/model/useLikeTrack', () => ({
  useLikeTrack: vi.fn(),
}));

vi.mock('@/features/track-engagement/model/useUnlikeTrack', () => ({
  useUnlikeTrack: vi.fn(),
}));

vi.mock('@/shared/ui/TrackShareModal/TrackShareModal', () => ({
  TrackShareModal: ({ open, onClose }: any) => {
    if (!open) return null;
    return (
      <div data-testid="mock-share-modal">
        <button onClick={onClose} data-testid="mock-share-close">Close Share</button>
      </div>
    );
  },
}));

describe('TrackPreviewCard', () => {
  const mockPlayTrack = vi.fn();
  const mockLikeTrack = vi.fn();
  const mockUnlikeTrack = vi.fn();

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(playerStore.usePlayerStore).mockImplementation((selector: any) => {
      const state = {
        play: mockPlayTrack,
        currentTrack: null,
        isPlaying: false,
      };
      return selector ? selector(state) : state;
    });

    vi.mocked(likeHooks.useLikeTrack).mockReturnValue({ mutate: mockLikeTrack } as any);
    vi.mocked(unlikeHooks.useUnlikeTrack).mockReturnValue({ mutate: mockUnlikeTrack } as any);
  });

  const mockTrack = { 
    trackId: 't1', 
    artist: 'Mock Artist', 
    title: 'Mock Track',
    artworkUrl: null,
    duration: 180,
    trackUrl: '/tracks/t1'
  };

  it('should render loading state when fetching track', () => {
    vi.mocked(trackQueries.useTrack).mockReturnValue({ data: null, isLoading: true } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });
    expect(screen.getByText('Loading track preview...')).toBeInTheDocument();
  });

  it('should render track details when loaded', () => {
    vi.mocked(trackQueries.useTrack).mockReturnValue({
      data: {
        id: 't1',
        title: 'Mock Track',
        artist: 'Mock Artist',
        waveform: [0.1, 0.2],
        likeCount: 5,
        hasLiked: false,
      },
      isLoading: false,
    } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Mock Track')).toBeInTheDocument();
    expect(screen.getByText('Mock Artist')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Like count
  });

  it('should trigger play when play button is clicked', () => {
    const mockData = {
      id: 't1',
      title: 'Mock Track',
      artist: 'Mock Artist',
      artworkUrl: 'img1.jpg',
      streamUrl: 'stream-url',
    };
    vi.mocked(trackQueries.useTrack).mockReturnValue({
      data: mockData,
      isLoading: false,
    } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });
    
    const playBtn = screen.getByTestId('track-preview-play-btn');
    fireEvent.click(playBtn);
    
    expect(mockPlayTrack).toHaveBeenCalledWith({
      id: 't1',
      title: 'Mock Track',
      artist: 'Mock Artist',
      artworkUrl: 'img1.jpg',
      hlsUrl: 'stream-url',
    });
  });

  it('should toggle like status', () => {
    vi.mocked(trackQueries.useTrack).mockReturnValue({
      data: {
        id: 't1',
        title: 'Mock Track',
        artist: 'Mock Artist',
        likeCount: 5,
        hasLiked: false,
      },
      isLoading: false,
    } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });
    
    const likeBtn = screen.getByTestId('track-preview-like-btn');
    fireEvent.click(likeBtn);
    
    expect(mockLikeTrack).toHaveBeenCalledWith('t1');
  });

  it('should open share modal when share button is clicked', async () => {
    vi.mocked(trackQueries.useTrack).mockReturnValue({
      data: {
        id: 't1',
        title: 'Mock Track',
        artist: 'Mock Artist',
      },
      isLoading: false,
    } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });
    
    const shareBtn = screen.getByTestId('track-preview-share-btn');
    fireEvent.click(shareBtn);
    
    expect(screen.getByTestId('mock-share-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('mock-share-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('mock-share-modal')).not.toBeInTheDocument();
    });
  });
});
