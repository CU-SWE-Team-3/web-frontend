// component-id: PaymentPageTests_001

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentPage from '../page';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/payment',
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

// Mock auth store
vi.mock('@/features/auth/model/useAuthStore', () => ({
  useAuthStore: () => ({
    user: {
      displayName: 'Yousef Waseem',
      avatarUrl: null,
      email: 'test@example.com',
      role: 'Artist',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  }),
}));

// Mock subscription store
const mockCheckout = vi.fn();
vi.mock('@/features/subscription/model/useSubscriptionStore', () => ({
  useSubscriptionStore: () => ({
    checkout: mockCheckout,
    isLoading: false,
    error: null,
  }),
}));

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the page with correct test id', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-page')).toBeDefined();
  });

  it('renders the page title "Get Artist Pro"', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-title').textContent).toBe('Get Artist Pro');
  });

  it('renders the logo linking to feed', () => {
    render(<PaymentPage />);
    const logo = screen.getByTestId('payment-logo');
    expect(logo.getAttribute('href')).toBe('/feed');
  });

  it('renders user info in header', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-user-info').textContent).toContain('Yousef Waseem');
  });

  it('renders billing section', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-billing-section')).toBeDefined();
  });

  it('renders yearly and monthly billing options', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('billing-yearly')).toBeDefined();
    expect(screen.getByTestId('billing-monthly')).toBeDefined();
  });

  it('yearly billing is selected by default', () => {
    render(<PaymentPage />);
    const yearly = screen.getByTestId('billing-yearly');
    expect(yearly.getAttribute('aria-checked')).toBe('true');
  });

  it('toggling to monthly billing updates the total in review', () => {
    render(<PaymentPage />);
    const monthly = screen.getByTestId('billing-monthly');
    fireEvent.click(monthly);
    expect(monthly.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByTestId('payment-total').textContent).toContain('149.99');
  });

  it('renders payment method options', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-applepay')).toBeDefined();
    expect(screen.getByTestId('payment-card')).toBeDefined();
    expect(screen.getByTestId('payment-paypal')).toBeDefined();
  });

  it('renders the review section', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-review')).toBeDefined();
    expect(screen.getByTestId('payment-total').textContent).toContain('899.88');
  });

  it('renders the Buy subscription button', () => {
    render(<PaymentPage />);
    const btn = screen.getByTestId('payment-buy-btn');
    expect(btn.textContent).toBe('Buy subscription');
  });

  it('clicking Buy calls checkout and shows processing state', async () => {
    mockCheckout.mockImplementation(
      () => new Promise((res) => setTimeout(() => res('https://checkout.stripe.com/test'), 100))
    );

    render(<PaymentPage />);
    const btn = screen.getByTestId('payment-buy-btn');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('payment-buy-btn').textContent).toContain('Processing');
    });

    expect(mockCheckout).toHaveBeenCalledWith('Pro');
  });

  it('shows error message when checkout fails', async () => {
    mockCheckout.mockRejectedValueOnce(new Error('You are already an active premium subscriber.'));

    render(<PaymentPage />);
    const btn = screen.getByTestId('payment-buy-btn');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('payment-error')).toBeDefined();
      expect(screen.getByTestId('payment-error').textContent).toContain(
        'You are already an active premium subscriber.'
      );
    });
  });

  it('redirects to /subscription after successful payment', async () => {
    mockCheckout.mockResolvedValueOnce('https://checkout.stripe.com/test');
    vi.useFakeTimers();

    render(<PaymentPage />);
    const btn = screen.getByTestId('payment-buy-btn');
    fireEvent.click(btn);

    // Fast-forward through the 2s processing + 1.2s success delays
    await vi.runAllTimersAsync();

    expect(mockPush).toHaveBeenCalledWith('/subscription');
    vi.useRealTimers();
  });

  it('renders the footer', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-footer')).toBeDefined();
  });
});
