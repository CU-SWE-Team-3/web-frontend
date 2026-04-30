'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../model/useAuthStore';

export function AuthHydrator() {
  const { login } = useAuthStore();
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const hydrate = async () => {
      const axiosConfig = { timeout: 5000, withCredentials: true };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Use POST /auth/refresh — the only reliable endpoint for cookie-based session restoration.
      // There is no GET /auth/me endpoint on this backend.
      try {
        const res = await axios.post(`${apiUrl}/auth/refresh`, {}, axiosConfig);

        if (res.data?.success && res.data?.data?.user) {
          const token = res.data?.data?.accessToken || res.data?.accessToken;
          login(res.data.data.user, token);
          // Ensure accessToken is persisted so the apiClient interceptor can attach it
          if (token && typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
          }
          return; // Success — session restored
        }
      } catch {
        // Cookie refresh failed — user is not logged in
      }

      // Hydration complete — user is not logged in
      useAuthStore.setState({ isInitialized: true });
    };

    hydrate();
  }, [login]);

  return null;
}
