import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/messagingApi';

export const UNREAD_COUNT_QUERY_KEY = ['unread-message-count'] as const;

/**
 * Fetches total unread message count.
 * Polls every 30 seconds as agreed with the user.
 */
export const useUnreadCount = () => {
  return useQuery<number, Error>({
    queryKey: [...UNREAD_COUNT_QUERY_KEY],
    queryFn: getUnreadCount,
    refetchInterval: 30_000, // Poll every 30 seconds
  });
};
