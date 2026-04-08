'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthHydrator } from '@/features/auth/ui/AuthHydrator';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

/**
 * Gate that waits until auth hydration is complete before rendering children.
 * This prevents React Query hooks from firing before the JWT token is restored.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) {
    // Minimal loading state — prevents flash of empty content
    return (
      <div style={{
        minHeight: '100vh',
        background: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid #333',
          borderTopColor: '#f50',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthHydrator />
      <AuthGate>
        {children}
      </AuthGate>
    </QueryClientProvider>
  );
}
