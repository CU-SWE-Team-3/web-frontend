// component-id: ArtistProPageTests_001

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ArtistProPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/artist-pro',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ArtistProPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page with correct test id', () => {
    render(<ArtistProPage />);
    expect(screen.getByTestId('artist-pro-page')).toBeDefined();
  });

  it('renders the hero section with title', () => {
    render(<ArtistProPage />);
    const title = screen.getByTestId('artist-pro-title');
    expect(title.textContent).toBe('Reach more listeners.');
  });

  it('renders the hero Get Artist Pro button', () => {
    render(<ArtistProPage />);
    const btn = screen.getByTestId('artist-pro-get-btn');
    expect(btn).toBeDefined();
    expect(btn.textContent).toBe('Get Artist Pro');
  });

  it('clicking "Get Artist Pro" navigates to /payment', () => {
    render(<ArtistProPage />);
    const btn = screen.getByTestId('artist-pro-get-btn');
    fireEvent.click(btn);
    expect(mockPush).toHaveBeenCalledWith('/payment');
  });

  it('renders the feature highlights section', () => {
    render(<ArtistProPage />);
    const featuresSection = screen.getByTestId('artist-pro-features');
    expect(featuresSection).toBeDefined();
    const featureItems = screen.getAllByTestId('artist-pro-feature-item');
    expect(featureItems.length).toBe(4);
  });

  it('renders the plans section with both plan cards', () => {
    render(<ArtistProPage />);
    expect(screen.getByTestId('plan-card-artist')).toBeDefined();
    expect(screen.getByTestId('plan-card-artist-pro')).toBeDefined();
  });

  it('renders Artist plan with correct pricing', () => {
    render(<ArtistProPage />);
    const artistCard = screen.getByTestId('plan-card-artist');
    expect(artistCard.textContent).toContain('EGP 29.99');
  });

  it('renders Artist Pro plan with correct pricing', () => {
    render(<ArtistProPage />);
    const proCard = screen.getByTestId('plan-card-artist-pro');
    expect(proCard.textContent).toContain('EGP 74.99');
  });

  it('clicking plan card Artist CTA navigates to /payment', () => {
    render(<ArtistProPage />);
    const btn = screen.getByTestId('plan-card-artist-cta');
    fireEvent.click(btn);
    expect(mockPush).toHaveBeenCalledWith('/payment');
  });

  it('clicking plan card Pro CTA navigates to /payment', () => {
    render(<ArtistProPage />);
    const btn = screen.getByTestId('plan-card-pro-cta');
    fireEvent.click(btn);
    expect(mockPush).toHaveBeenCalledWith('/payment');
  });

  it('renders the compare features section', () => {
    render(<ArtistProPage />);
    expect(screen.getByTestId('artist-pro-compare')).toBeDefined();
    expect(screen.getByTestId('artist-pro-compare-title')).toBeDefined();
    expect(screen.getByTestId('artist-pro-compare-title').textContent).toBe('Compare features.');
  });

  it('renders all feature sections in the comparison table', () => {
    render(<ArtistProPage />);
    expect(screen.getByTestId('compare-section-get-heard')).toBeDefined();
    expect(screen.getByTestId('compare-section-manage-your-music')).toBeDefined();
    expect(screen.getByTestId('compare-section-build-your-brand')).toBeDefined();
    expect(screen.getByTestId('compare-section-get-paid')).toBeDefined();
    expect(screen.getByTestId('compare-section-special-treatment')).toBeDefined();
  });

  it('renders compare table Get Started buttons that navigate to /payment', () => {
    render(<ArtistProPage />);
    const artistCta = screen.getByTestId('compare-artist-cta');
    const proCta = screen.getByTestId('compare-pro-cta');
    fireEvent.click(artistCta);
    expect(mockPush).toHaveBeenCalledWith('/payment');
    fireEvent.click(proCta);
    expect(mockPush).toHaveBeenCalledWith('/payment');
  });

  it('renders the footer', () => {
    render(<ArtistProPage />);
    expect(screen.getByTestId('artist-pro-footer')).toBeDefined();
  });
});
