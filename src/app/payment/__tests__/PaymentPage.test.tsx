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
    logout: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock subscription store
const mockMockCheckout = vi.fn();
vi.mock('@/features/subscription/model/useSubscriptionStore', () => ({
  useSubscriptionStore: () => ({
    mockCheckout: mockMockCheckout,
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

  it('renders the logo linking to home', () => {
    render(<PaymentPage />);
    const logo = screen.getByTestId('payment-logo');
    expect(logo.getAttribute('href')).toBe('/');
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
    expect(screen.getByTestId('payment-total').textContent).toContain('74.99');
  });

  it('renders Stripe payment option (no PayPal)', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-stripe')).toBeDefined();
    expect(screen.getByTestId('payment-applepay')).toBeDefined();
    expect(screen.queryByTestId('payment-paypal')).toBeNull();
  });

  it('renders the Stripe card form when Stripe is selected', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('stripe-form')).toBeDefined();
    expect(screen.getByTestId('stripe-card-number')).toBeDefined();
    expect(screen.getByTestId('stripe-card-expiry')).toBeDefined();
    expect(screen.getByTestId('stripe-card-cvc')).toBeDefined();
    expect(screen.getByTestId('stripe-card-name')).toBeDefined();
  });

  it('renders the review section with correct yearly total', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-review')).toBeDefined();
    expect(screen.getByTestId('payment-total').textContent).toContain('899.88');
  });

  it('renders the Buy subscription button', () => {
    render(<PaymentPage />);
    const btn = screen.getByTestId('payment-buy-btn');
    expect(btn.textContent).toBe('Buy subscription');
  });

  it('shows validation error when Stripe form is incomplete', async () => {
    render(<PaymentPage />);
    const btn = screen.getByTestId('payment-buy-btn');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('payment-validation-error')).toBeDefined();
      expect(screen.getByTestId('payment-validation-error').textContent).toContain(
        'Please fill in all card details correctly'
      );
    });
  });

  it('clicking Buy with valid card data shows processing state', async () => {
    render(<PaymentPage />);

    // Fill in mock card data
    fireEvent.change(screen.getByTestId('stripe-card-number'), {
      target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByTestId('stripe-card-expiry'), {
      target: { value: '1228' },
    });
    fireEvent.change(screen.getByTestId('stripe-card-cvc'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByTestId('stripe-card-name'), {
      target: { value: 'John Doe' },
    });

    const btn = screen.getByTestId('payment-buy-btn');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('payment-buy-btn').textContent).toContain('Processing');
    });
  });

  it('redirects to /subscription after successful payment', async () => {
    vi.useFakeTimers();

    render(<PaymentPage />);

    // Fill in mock card data
    fireEvent.change(screen.getByTestId('stripe-card-number'), {
      target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByTestId('stripe-card-expiry'), {
      target: { value: '1228' },
    });
    fireEvent.change(screen.getByTestId('stripe-card-cvc'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByTestId('stripe-card-name'), {
      target: { value: 'John Doe' },
    });

    const btn = screen.getByTestId('payment-buy-btn');
    fireEvent.click(btn);

    // Fast-forward through the 2s processing + 1.5s success delays
    await vi.runAllTimersAsync();

    expect(mockMockCheckout).toHaveBeenCalledWith('Pro', 'yearly');
    expect(mockPush).toHaveBeenCalledWith('/subscription');
    vi.useRealTimers();
  });

  it('renders the footer', () => {
    render(<PaymentPage />);
    expect(screen.getByTestId('payment-footer')).toBeDefined();
  });
});
