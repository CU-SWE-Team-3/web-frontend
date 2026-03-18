// This file wraps every page in the app with global providers.
// Think of it like the "outer wrapper" of your entire app.

'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create the TanStack Query client — one per app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data stays "fresh" for 5 minutes
      retry: 1, // Retry failed requests once
    },
  },
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    // QueryClientProvider makes TanStack Query available to every component
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
