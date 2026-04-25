import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../api/messagingApi';
import type { Conversation } from './types';

export const CONVERSATIONS_QUERY_KEY = ['conversations'] as const;

export const useConversations = () => {
  return useQuery<Conversation[]>({
    queryKey: [...CONVERSATIONS_QUERY_KEY],
    queryFn: () => getConversations(),
  });
};
