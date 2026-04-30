import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '../api/messagingApi';
import type { Message } from './types';
import { MESSAGES_QUERY_KEY } from './useMessages';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';
import { UNREAD_COUNT_QUERY_KEY } from './useUnreadCount';

interface SendMessageVars {
  conversationId: string;
  receiverId: string;
  content: string;
  attachment?: { type: 'track' | 'playlist'; id: string };
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, SendMessageVars>({
    mutationFn: ({ receiverId, content, attachment }) =>
      sendMessage(receiverId, content, attachment),
    onSuccess: (_data, variables) => {
      // Refetch the messages for this conversation
      queryClient.invalidateQueries({
        queryKey: [...MESSAGES_QUERY_KEY, variables.conversationId],
      });
      // Refetch conversation list to update lastMessage
      queryClient.invalidateQueries({
        queryKey: [...CONVERSATIONS_QUERY_KEY],
      });
      // Refetch unread count
      queryClient.invalidateQueries({
        queryKey: [...UNREAD_COUNT_QUERY_KEY],
      });
    },
  });
};
