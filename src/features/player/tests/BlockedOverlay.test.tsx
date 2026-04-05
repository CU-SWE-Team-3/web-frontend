import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockedOverlay } from '../ui/playback/BlockedOverlay';

describe('BlockedOverlay', () => {
  it('renders sc-blocked-overlay id', () => {
    render(<BlockedOverlay />);
    expect(document.getElementById('sc-blocked-overlay')).toBeInTheDocument();
  });

  it('renders sc-blocked-cta button', () => {
    render(<BlockedOverlay />);
    expect(document.getElementById('sc-blocked-cta')).toBeInTheDocument();
  });

  it('shows region-blocked message when region prop provided', () => {
    render(<BlockedOverlay region="XX" />);
    expect(screen.getByText('Not available in your region')).toBeInTheDocument();
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  it('shows pro upgrade message when no region', () => {
    render(<BlockedOverlay />);
    expect(screen.getByText('Go Pro to unlock')).toBeInTheDocument();
    expect(screen.getByText('Go Pro')).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA is clicked', () => {
    const onCtaClick = jest.fn();
    render(<BlockedOverlay onCtaClick={onCtaClick} />);
    fireEvent.click(document.getElementById('sc-blocked-cta')!);
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});
