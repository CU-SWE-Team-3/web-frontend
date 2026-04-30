import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TrackPreviewCard } from '../TrackPreviewCard';
import * as trackQueries from '@/features/tracks/model/trackQueries';
import * as playerStore from '@/features/player/model/playerStore';
import * as likeHooks from '@/features/track-engagement/model/useLikeTrack';
import * as unlikeHooks from '@/features/track-engagement/model/useUnlikeTrack';
import * as repostHooks from '@/features/track-engagement/model/useRepostTrack';
import * as unrepostHooks from '@/features/track-engagement/model/useUnrepostTrack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/tracks/model/trackQueries', () => ({
  useTrack: vi.fn(),
  useUpdateTrack: vi.fn(),
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

vi.mock('@/features/track-engagement/model/useRepostTrack', () => ({
  useRepostTrack: vi.fn(),
}));

vi.mock('@/features/track-engagement/model/useUnrepostTrack', () => ({
  useUnrepostTrack: vi.fn(),
}));

vi.mock('@/shared/ui/RepostToast/RepostToast', () => ({
  RepostToast: () => null,
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

vi.mock('@/features/tracks/ui/EditTrackModal', () => ({
  default: ({ open, onClose }: any) => {
    if (!open) return null;
    return (
      <div data-testid="mock-edit-modal">
        <button onClick={onClose} data-testid="mock-edit-close">Close Edit</button>
      </div>
    );
  },
}));

describe('TrackPreviewCard', () => {
  const mockPlayTrack = vi.fn();
  const mockLikeTrack = vi.fn();
  const mockUnlikeTrack = vi.fn();
  const mockRepostTrack = vi.fn();
  const mockUnrepostTrack = vi.fn();
  const mockUpdateTrack = vi.fn();

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
    vi.mocked(repostHooks.useRepostTrack).mockReturnValue({ mutate: mockRepostTrack } as any);
    vi.mocked(unrepostHooks.useUnrepostTrack).mockReturnValue({ mutate: mockUnrepostTrack } as any);
    vi.mocked(trackQueries.useUpdateTrack).mockReturnValue({ mutateAsync: mockUpdateTrack, isPending: false } as any);
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

  it('should toggle repost status when repost button is clicked', () => {
    vi.mocked(trackQueries.useTrack).mockReturnValue({
      data: {
        id: 't1',
        title: 'Mock Track',
        artist: 'Mock Artist',
        repostCount: 3,
        waveform: [],
      },
      isLoading: false,
    } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });

    const repostBtn = screen.getByTestId('track-preview-repost-btn');
    fireEvent.click(repostBtn);

    // Should call repost mutation with correct args
    expect(mockRepostTrack).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: 't1' })
    );
  });

  it('should call unrepost mutation when clicking repost button while already reposted', () => {
    vi.mocked(trackQueries.useTrack).mockReturnValue({
      data: {
        id: 't1',
        title: 'Mock Track',
        artist: 'Mock Artist',
        repostCount: 3,
        waveform: [],
      },
      isLoading: false,
    } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });

    const repostBtn = screen.getByTestId('track-preview-repost-btn');
    // First click → repost
    fireEvent.click(repostBtn);
    // Second click → unrepost
    fireEvent.click(repostBtn);

    expect(mockUnrepostTrack).toHaveBeenCalledWith('t1');
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

  it('should open edit modal when edit button is clicked', async () => {
    vi.mocked(trackQueries.useTrack).mockReturnValue({
      data: {
        id: 't1',
        title: 'Mock Track',
        artist: 'Mock Artist',
      },
      isLoading: false,
    } as any);

    render(<TrackPreviewCard track={mockTrack} />, { wrapper: createWrapper() });
    
    const editBtn = screen.getByTitle('Edit');
    fireEvent.click(editBtn);
    
    expect(screen.getByTestId('mock-edit-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('mock-edit-close'));
    await waitFor(() => {
      expect(screen.queryByTestId('mock-edit-modal')).not.toBeInTheDocument();
    });
  });
});
