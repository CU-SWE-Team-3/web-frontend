// component-id: SubscriptionPageTests_001

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SubscriptionPage from '../page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/subscription',
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

// Mock NavBar
vi.mock('@/shared/ui/NavBar', () => ({
  NavBar: () => <nav data-testid="navbar" />,
}));

// Mock auth store
const mockUser = {
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'Artist' as const,
  createdAt: '2026-01-01T00:00:00.000Z',
  isPremium: false,
  subscriptionPlan: 'Free' as const,
};

vi.mock('@/features/auth/model/useAuthStore', () => ({
  useAuthStore: () => ({ user: mockUser }),
}));

// Mock subscription store
const mockSyncFromUser = vi.fn();
const mockCancel = vi.fn();

const mockSubscriptionStore = {
  currentPlan: 'Free' as const,
  isPremium: false,
  expiresAt: null,
  cancelAtPeriodEnd: false,
  isLoading: false,
  error: null,
  syncFromUser: mockSyncFromUser,
  cancel: mockCancel,
};

vi.mock('@/features/subscription/model/useSubscriptionStore', () => ({
  useSubscriptionStore: () => mockSubscriptionStore,
}));

describe('SubscriptionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscriptionStore.currentPlan = 'Free';
    mockSubscriptionStore.isPremium = false;
    mockSubscriptionStore.expiresAt = null;
    mockSubscriptionStore.cancelAtPeriodEnd = false;
    mockSubscriptionStore.isLoading = false;
    mockSubscriptionStore.error = null;
  });

  it('renders the subscription page', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-page')).toBeDefined();
  });

  it('renders the page title "Subscriptions"', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-title').textContent).toBe('Subscriptions');
  });

  it('renders the navbar', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('navbar')).toBeDefined();
  });

  it('renders the announcement banner', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-banner')).toBeDefined();
  });

  it('closes the banner when close button is clicked', () => {
    render(<SubscriptionPage />);
    const closeBtn = screen.getByTestId('subscription-banner-close');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('subscription-banner')).toBeNull();
  });

  it('renders current plans section', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-current-plans-title')).toBeDefined();
    expect(screen.getByTestId('subscription-plan-card')).toBeDefined();
  });

  it('shows "Basic" plan name when on Free plan', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-plan-name').textContent).toBe('Basic');
  });

  it('shows "Try Artist Pro" button when on Free plan', () => {
    render(<SubscriptionPage />);
    const btn = screen.getByTestId('subscription-try-pro-btn');
    expect(btn).toBeDefined();
    expect(btn.textContent).toBe('Try Artist Pro');
  });

  it('"Try Artist Pro" button links to /artist-pro', () => {
    render(<SubscriptionPage />);
    const btn = screen.getByTestId('subscription-try-pro-btn');
    expect(btn.getAttribute('href')).toBe('/artist-pro');
  });

  it('shows plan description for Free plan', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-plan-description')).toBeDefined();
  });

  it('shows "Artist Pro" plan name when subscribed to Pro', () => {
    mockSubscriptionStore.currentPlan = 'Pro';
    mockSubscriptionStore.isPremium = true;
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-plan-name').textContent).toBe('Artist Pro');
  });

  it('shows cancel button when on Pro plan without cancelAtPeriodEnd', () => {
    mockSubscriptionStore.currentPlan = 'Pro';
    mockSubscriptionStore.isPremium = true;
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-cancel-btn')).toBeDefined();
  });

  it('hides cancel button when cancelAtPeriodEnd is true', () => {
    mockSubscriptionStore.currentPlan = 'Pro';
    mockSubscriptionStore.isPremium = true;
    mockSubscriptionStore.cancelAtPeriodEnd = true;
    render(<SubscriptionPage />);
    expect(screen.queryByTestId('subscription-cancel-btn')).toBeNull();
  });

  it('renders error message from store', () => {
    mockSubscriptionStore.error = 'You do not have an active subscription.';
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-error').textContent).toContain(
      'You do not have an active subscription.'
    );
  });

  it('renders the student discount banner', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-student-banner')).toBeDefined();
    expect(screen.getByTestId('subscription-student-link').getAttribute('href')).toBe('/artist-pro');
  });

  it('renders the purchase history section', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-history-title').textContent).toBe('Purchase history');
    expect(screen.getByTestId('subscription-history-empty')).toBeDefined();
  });

  it('renders the sidebar with helpful links', () => {
    render(<SubscriptionPage />);
    expect(screen.getByTestId('subscription-sidebar')).toBeDefined();
    expect(screen.getByTestId('subscription-sidebar-troubleshoot')).toBeDefined();
    expect(screen.getByTestId('subscription-sidebar-billing-help')).toBeDefined();
    expect(screen.getByTestId('subscription-sidebar-tax')).toBeDefined();
  });

  it('syncs from user on mount', () => {
    render(<SubscriptionPage />);
    expect(mockSyncFromUser).toHaveBeenCalled();
  });

  it('shows cancel success message after cancellation', async () => {
    mockSubscriptionStore.currentPlan = 'Pro';
    mockSubscriptionStore.isPremium = true;
    mockCancel.mockResolvedValueOnce(undefined);

    render(<SubscriptionPage />);
    const cancelBtn = screen.getByTestId('subscription-cancel-btn');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.getByTestId('subscription-cancel-success')).toBeDefined();
    });
  });
});
