import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlaybackStateGuard } from '../ui/playback/PlaybackStateGuard';

describe('PlaybackStateGuard', () => {
  it('renders children when state is "playable"', () => {
    render(
      <PlaybackStateGuard state="playable">
        <div>Track Content</div>
      </PlaybackStateGuard>
    );
    expect(screen.getByText('Track Content')).toBeInTheDocument();
    expect(document.getElementById('sc-playback-guard')).toHaveAttribute('data-state', 'playable');
  });

  it('renders PreviewBanner and children when state is "preview"', () => {
    render(
      <PlaybackStateGuard state="preview" userTier="guest" previewTimeRemaining={20}>
        <div>Track Content</div>
      </PlaybackStateGuard>
    );
    expect(screen.getByText('Track Content')).toBeInTheDocument();
    expect(document.getElementById('sc-preview-banner')).toBeInTheDocument();
    expect(document.getElementById('sc-playback-guard')).toHaveAttribute('data-state', 'preview');
  });

  it('renders BlockedOverlay (not children) when state is "blocked"', () => {
    render(
      <PlaybackStateGuard state="blocked" region="XX">
        <div>Track Content</div>
      </PlaybackStateGuard>
    );
    expect(screen.queryByText('Track Content')).not.toBeInTheDocument();
    expect(document.getElementById('sc-blocked-overlay')).toBeInTheDocument();
    expect(document.getElementById('sc-playback-guard')).toHaveAttribute('data-state', 'blocked');
  });

  it('passes region message to BlockedOverlay', () => {
    render(
      <PlaybackStateGuard state="blocked" region="XX">
        <div>Content</div>
      </PlaybackStateGuard>
    );
    expect(screen.getByText('Not available in your region')).toBeInTheDocument();
  });

  it('shows upgrade message for blocked non-region', () => {
    render(
      <PlaybackStateGuard state="blocked" userTier="free">
        <div>Content</div>
      </PlaybackStateGuard>
    );
    expect(screen.getByText('Go Pro to unlock')).toBeInTheDocument();
  });

  it('shows correct CTA text for guest in preview', () => {
    render(
      <PlaybackStateGuard state="preview" userTier="guest">
        <div>Content</div>
      </PlaybackStateGuard>
    );
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
