import { useQuery } from '@tanstack/react-query';
import { getMessages } from '../api/messagingApi';
import type { Message } from './types';

export const MESSAGES_QUERY_KEY = ['messages'] as const;

export const useMessages = (conversationId: string | null) => {
  return useQuery<Message[]>({
    queryKey: [...MESSAGES_QUERY_KEY, conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: Boolean(conversationId),
  });
};
