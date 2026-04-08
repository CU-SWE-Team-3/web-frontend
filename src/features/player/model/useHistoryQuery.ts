import { useQuery } from '@tanstack/react-query';
import { historyApi } from '../api/historyApi';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

export const useHistoryQuery = (page = 1, limit = 20) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['history', 'recently-played', page, limit],
    queryFn: () => historyApi.getRecentlyPlayed(page, limit),
    enabled: isAuthenticated, // Only fetch if user is logged in
    staleTime: 1000 * 60, // 1 minute
  });
};
