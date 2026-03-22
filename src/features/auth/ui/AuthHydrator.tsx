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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      // Strategy 1: Try cookie-based refresh
      try {
        const res = await axios.post(`${apiUrl}/auth/refresh`, {}, {
          withCredentials: true,
        });

        if (res.data?.success && res.data?.data?.user) {
          const token = res.data?.data?.accessToken || res.data?.accessToken;
          login(res.data.data.user, token);
          return; // Success — session restored
        }
      } catch {
        // Cookie refresh failed — try localStorage fallback
      }

      // Strategy 2: Try localStorage token or HttpOnly Cookie + GET /auth/me
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        
        try {
          const res = await axios.get(`${apiUrl}/auth/me`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            withCredentials: true,
          });
          const user = res.data?.data?.user || res.data?.data || res.data?.user;
          if (user) {
            login(user, token || undefined);
            useAuthStore.setState({ isInitialized: true });
            return;
          }
        } catch (err: any) {
          // Only clean up if it's explicitly an auth error (401/403)
          // Do not delete token on 500 or network errors
          if (err.response?.status === 401 || err.response?.status === 403) {
            localStorage.removeItem('accessToken');
          }
        }
      }
      
      // Mark as initialized if hydration finishes without logging in
      useAuthStore.setState({ isInitialized: true });
    };

    hydrate();
  }, [login]);

  return null;
}

