import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreviewBanner } from '../ui/playback/PreviewBanner';

describe('PreviewBanner', () => {
  it('renders sc-preview-banner id', () => {
    render(<PreviewBanner />);
    expect(document.getElementById('sc-preview-banner')).toBeInTheDocument();
  });

  it('renders sc-preview-cta button', () => {
    render(<PreviewBanner />);
    expect(document.getElementById('sc-preview-cta')).toBeInTheDocument();
  });

  it('renders sc-preview-timer', () => {
    render(<PreviewBanner previewTimeRemaining={15} />);
    expect(document.getElementById('sc-preview-timer')).toBeInTheDocument();
    expect(document.getElementById('sc-preview-timer')).toHaveTextContent('0:15 remaining');
  });

  it('shows "Sign in for full access" for guest', () => {
    render(<PreviewBanner userTier="guest" />);
    expect(screen.getByText('Sign in for full access')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('shows "Upgrade to listen" for free tier', () => {
    render(<PreviewBanner userTier="free" />);
    expect(screen.getByText('Upgrade to listen')).toBeInTheDocument();
    expect(screen.getByText('Go Pro')).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA is clicked', () => {
    const onCtaClick = jest.fn();
    render(<PreviewBanner onCtaClick={onCtaClick} />);
    fireEvent.click(document.getElementById('sc-preview-cta')!);
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});
